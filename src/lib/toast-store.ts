import { create } from "zustand";

export type ToastTone = "default" | "error";

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastTone) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

let toastCounter = 0;

function nextToastId() {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message, tone = "default") => {
    const id = nextToastId();
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message, tone }],
    }));
    if (typeof window !== "undefined") {
      window.setTimeout(() => get().dismissToast(id), 4500);
    }
    return id;
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
  },
  clearToasts: () => set({ toasts: [] }),
}));

export function toast(message: string, tone: ToastTone = "default") {
  return useToastStore.getState().showToast(message, tone);
}
