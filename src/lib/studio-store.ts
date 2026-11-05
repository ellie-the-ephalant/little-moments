import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import {
  DEFAULT_SETTINGS,
  MAX_PHOTOS,
  SETTINGS_STORAGE_KEY,
  TITLE_MAX_LENGTH,
} from "./constants";
import { settingsSchema } from "./settings-schema";
import type {
  CountdownSeconds,
  FilterId,
  LayoutId,
  Photo,
  PersistedSettings,
  StudioState,
  StudioStep,
  ThemeId,
} from "./types";

type StudioActions = {
  setStep: (step: StudioStep) => void;
  setLayout: (layoutId: LayoutId) => void;
  setTheme: (themeId: ThemeId) => void;
  setFilter: (filterId: FilterId) => void;
  setCountdown: (countdownSeconds: CountdownSeconds) => void;
  setMirror: (mirror: boolean) => void;
  setFlash: (flash: boolean) => void;
  setTitle: (title: string) => void;
  setDate: (dateISO: string) => void;
  addPhotos: (photos: Photo[]) => void;
  replacePhoto: (index: number, photo: Photo) => void;
  setHydrated: (hydrated: boolean) => void;
  resetSession: () => void;
  resetAll: () => void;
};

export type StudioStore = StudioState & StudioActions;

const stateStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Settings persistence must never block the session.
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Settings persistence must never block the session.
    }
  },
};

const jsonStorage = createJSONStorage<PersistedSettings>(() => stateStorage);
const safeStorage = {
  getItem: (name: string) => {
    try {
      return jsonStorage?.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (
    name: string,
    value: Parameters<NonNullable<typeof jsonStorage>["setItem"]>[1],
  ) => {
    try {
      jsonStorage?.setItem(name, value);
    } catch {
      // Ignore unavailable or full local storage.
    }
  },
  removeItem: (name: string) => {
    try {
      jsonStorage?.removeItem(name);
    } catch {
      // Ignore unavailable local storage.
    }
  },
};

export const useStudioStore = create<StudioStore>()(
  persist<StudioStore, [], [], PersistedSettings>(
    (set) => ({
      ...DEFAULT_SETTINGS,
      step: "setup",
      title: "",
      dateISO: "",
      photos: [],
      hydrated: false,
      setStep: (step) => set({ step }),
      setLayout: (layoutId) => set({ layoutId }),
      setTheme: (themeId) => set({ themeId }),
      setFilter: (filterId) => set({ filterId }),
      setCountdown: (countdownSeconds) => set({ countdownSeconds }),
      setMirror: (mirror) => set({ mirror }),
      setFlash: (flash) => set({ flash }),
      setTitle: (title) => set({ title: title.slice(0, TITLE_MAX_LENGTH) }),
      setDate: (dateISO) => set({ dateISO }),
      addPhotos: (photos) =>
        set((state) => ({
          photos: [...state.photos, ...photos].slice(0, MAX_PHOTOS),
        })),
      replacePhoto: (index, photo) =>
        set((state) => {
          if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= state.photos.length
          ) {
            return state;
          }
          const photos = [...state.photos];
          photos[index] = photo;
          return { photos };
        }),
      setHydrated: (hydrated) => set({ hydrated }),
      resetSession: () =>
        set({ step: "setup", title: "", dateISO: "", photos: [] }),
      resetAll: () =>
        set({
          ...DEFAULT_SETTINGS,
          step: "setup",
          title: "",
          dateISO: "",
          photos: [],
          hydrated: true,
        }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 1,
      skipHydration: true,
      storage: safeStorage,
      partialize: ({
        layoutId,
        themeId,
        filterId,
        countdownSeconds,
        mirror,
        flash,
      }) => ({ layoutId, themeId, filterId, countdownSeconds, mirror, flash }),
      merge: (persisted, current) => {
        const parsed = settingsSchema.safeParse(persisted);
        return parsed.success
          ? { ...current, ...parsed.data, hydrated: true }
          : { ...current, hydrated: true };
      },
    },
  ),
);
