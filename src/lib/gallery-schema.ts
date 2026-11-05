import { z } from "zod";

import { FILTER_IDS, LAYOUT_IDS, THEME_IDS } from "./constants";

const blobSchema = z
  .instanceof(Blob)
  .refine((blob) => blob.size > 0, { message: "Blob must not be empty" });

export const stripRecordSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    createdAt: z.number().int().nonnegative(),
    title: z.string().min(1).max(40),
    layoutId: z.enum(LAYOUT_IDS),
    themeId: z.enum(THEME_IDS),
    filterId: z.enum(FILTER_IDS),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    mimeType: z.literal("image/jpeg"),
    image: blobSchema,
    thumb: blobSchema,
  })
  .strip();

export type StoredStrip = z.infer<typeof stripRecordSchema>;
