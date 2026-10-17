"use client";
import { create } from "zustand";

export interface Toast { id: number; message: string; tone: "info" | "success" | "error" }
interface ToastState { toasts: Toast[]; push: (message: string, tone?: Toast["tone"]) => void; dismiss: (id: number) => void }

let n = 0;
export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "info") => {
    const id = ++n;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
