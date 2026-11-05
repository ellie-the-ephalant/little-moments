import { createStore, del, delMany, get, keys, set } from "idb-keyval";

import {
  GALLERY_DB_NAME,
  GALLERY_KEY_PREFIX,
  GALLERY_LIMIT,
  GALLERY_STORE_NAME,
} from "./constants";
import { stripRecordSchema } from "./gallery-schema";
import type { StripRecord } from "./types";

type GalleryEntry = { key: string; record: StripRecord | null };
type PruneCandidate = { key: string; createdAt: number | null };

const galleryStore = createStore(GALLERY_DB_NAME, GALLERY_STORE_NAME);

export class GalleryUnavailableError extends Error {
  constructor() {
    super("Gallery storage is unavailable");
    this.name = "GalleryUnavailableError";
  }
}

export class GalleryQuotaError extends Error {
  constructor() {
    super("Gallery storage quota exceeded");
    this.name = "GalleryQuotaError";
  }
}

export function isQuotaExceededError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "QuotaExceededError"
  );
}

export function getOldestKeys(
  entries: readonly PruneCandidate[],
  count: number,
) {
  return [...entries]
    .sort(
      (left, right) =>
        (left.createdAt ?? Number.NEGATIVE_INFINITY) -
        (right.createdAt ?? Number.NEGATIVE_INFINITY),
    )
    .slice(0, Math.max(0, count))
    .map(({ key }) => key);
}

async function getStripKeys() {
  try {
    return (await keys(galleryStore)).filter(
      (key): key is string =>
        typeof key === "string" && key.startsWith(GALLERY_KEY_PREFIX),
    );
  } catch {
    throw new GalleryUnavailableError();
  }
}

async function readEntries(): Promise<GalleryEntry[]> {
  const stripKeys = await getStripKeys();
  try {
    const values = await Promise.all(
      stripKeys.map((key) => get<unknown>(key, galleryStore)),
    );

    return stripKeys.map((key, index) => {
      const parsed = stripRecordSchema.safeParse(values[index]);
      const keyId = key.slice(GALLERY_KEY_PREFIX.length);
      return {
        key,
        record: parsed.success && parsed.data.id === keyId ? parsed.data : null,
      };
    });
  } catch {
    throw new GalleryUnavailableError();
  }
}

async function deleteKeys(stripKeys: string[]) {
  if (!stripKeys.length) return;
  try {
    await delMany(stripKeys, galleryStore);
  } catch {
    throw new GalleryUnavailableError();
  }
}

function pruneCandidates(entries: GalleryEntry[]): PruneCandidate[] {
  return entries.map(({ key, record }) => ({
    key,
    createdAt: record?.createdAt ?? null,
  }));
}

async function pruneOldest(count: number) {
  const entries = await readEntries();
  await deleteKeys(getOldestKeys(pruneCandidates(entries), count));
}

export async function listStrips(): Promise<{
  records: StripRecord[];
  skipped: number;
}> {
  const entries = await readEntries();
  return {
    records: entries
      .flatMap(({ record }) => (record ? [record] : []))
      .sort((left, right) => right.createdAt - left.createdAt),
    skipped: entries.filter(({ record }) => record === null).length,
  };
}

export async function saveStrip(record: StripRecord): Promise<void> {
  const parsed = stripRecordSchema.safeParse(record);
  if (!parsed.success) throw new TypeError("Invalid strip record");

  await pruneTo(GALLERY_LIMIT - 1);
  const key = `${GALLERY_KEY_PREFIX}${parsed.data.id}`;
  try {
    await set(key, parsed.data, galleryStore);
  } catch (error) {
    if (!isQuotaExceededError(error)) throw new GalleryUnavailableError();
    await pruneOldest(5);
    try {
      await set(key, parsed.data, galleryStore);
    } catch (retryError) {
      if (isQuotaExceededError(retryError)) throw new GalleryQuotaError();
      throw new GalleryUnavailableError();
    }
  }
}

export async function deleteStrip(id: string): Promise<void> {
  try {
    await del(`${GALLERY_KEY_PREFIX}${id}`, galleryStore);
  } catch {
    throw new GalleryUnavailableError();
  }
}

export async function clearStrips(): Promise<void> {
  await deleteKeys(await getStripKeys());
}

export async function pruneTo(limit: number): Promise<void> {
  const entries = await readEntries();
  const keepCount = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  await deleteKeys(
    getOldestKeys(
      pruneCandidates(entries),
      Math.max(0, entries.length - keepCount),
    ),
  );
}

export async function isGalleryAvailable(): Promise<boolean> {
  try {
    await keys(galleryStore);
    return true;
  } catch {
    return false;
  }
}
