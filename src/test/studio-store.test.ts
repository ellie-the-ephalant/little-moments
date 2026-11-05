import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS, MAX_PHOTOS } from "../lib/constants";
import { useStudioStore } from "../lib/studio-store";
import type { Photo } from "../lib/types";

const resetState = () =>
  useStudioStore.setState({
    ...DEFAULT_SETTINGS,
    step: "setup",
    title: "",
    dateISO: "",
    photos: [],
    hydrated: false,
  });

const photo = (id: string): Photo => ({
  id,
  dataUrl: "data:image/jpeg;base64,AA==",
  width: 1080,
  height: 1350,
  source: "upload",
  createdAt: 1,
});

describe("studio store", () => {
  beforeEach(resetState);

  it("trims and clamps titles to 40 characters", () => {
    useStudioStore.getState().setTitle(`  ${"a".repeat(41)}  `);
    expect(useStudioStore.getState().title).toBe("a".repeat(40));
  });

  it("appends photos up to the six-photo cap", () => {
    useStudioStore
      .getState()
      .addPhotos(Array.from({ length: 5 }, (_, i) => photo(`${i}`)));
    useStudioStore.getState().addPhotos([photo("5"), photo("6")]);

    expect(useStudioStore.getState().photos.map(({ id }) => id)).toEqual(
      Array.from({ length: MAX_PHOTOS }, (_, i) => `${i}`),
    );
  });

  it("replaces only the requested photo", () => {
    useStudioStore.getState().addPhotos([photo("first"), photo("second")]);
    useStudioStore.getState().replacePhoto(1, photo("replacement"));

    expect(useStudioStore.getState().photos.map(({ id }) => id)).toEqual([
      "first",
      "replacement",
    ]);
  });

  it("resets session data while keeping style preferences", () => {
    const store = useStudioStore.getState();
    store.setLayout("six");
    store.setTheme("sage");
    store.setFilter("vivid");
    store.setStep("finish");
    store.setTitle("Afternoon");
    store.setDate("2026-11-05");
    store.addPhotos([photo("one")]);
    useStudioStore.getState().resetSession();

    expect(useStudioStore.getState()).toMatchObject({
      layoutId: "six",
      themeId: "sage",
      filterId: "vivid",
      step: "setup",
      title: "",
      dateISO: "",
      photos: [],
    });
  });

  it("persists only the six settings and validates hydration", () => {
    const options = useStudioStore.persist.getOptions();
    expect(options.name).toBe("little-moments.settings.v1");
    expect(options.version).toBe(1);
    expect(options.skipHydration).toBe(true);
    expect(options.partialize?.(useStudioStore.getState())).toEqual(
      DEFAULT_SETTINGS,
    );

    const merge = options.merge;
    expect(
      merge?.({ themeId: "blush" }, useStudioStore.getState()),
    ).toMatchObject({
      ...DEFAULT_SETTINGS,
      themeId: "blush",
      hydrated: true,
    });
    expect(
      merge?.({ themeId: "unknown" }, useStudioStore.getState()),
    ).toMatchObject({
      ...DEFAULT_SETTINGS,
      hydrated: true,
    });
  });

  it("rehydrates safely without browser storage", async () => {
    await useStudioStore.persist.rehydrate();
    expect(useStudioStore.getState().hydrated).toBe(true);
  });
});
