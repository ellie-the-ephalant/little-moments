import { z } from "zod";

import { FILTER_IDS, LAYOUT_IDS, THEME_IDS } from "./constants";

export const settingsSchema = z
  .object({
    layoutId: z.enum(LAYOUT_IDS).default("classic"),
    themeId: z.enum(THEME_IDS).default("classic"),
    filterId: z.enum(FILTER_IDS).default("natural"),
    countdownSeconds: z
      .union([z.literal(0), z.literal(3), z.literal(5), z.literal(10)])
      .default(3),
    mirror: z.boolean().default(true),
    flash: z.boolean().default(false),
  })
  .strip();

export type Settings = z.infer<typeof settingsSchema>;
