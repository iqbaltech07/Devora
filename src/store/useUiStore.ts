import { create } from "zustand";
import { ToastMessage } from "./types";

interface UiState {
  activeModal: "project-detail" | "profile-edit" | "invite-modal" | null;
  modalData: Record<string, unknown> | null;
  drawerOpen: boolean;
  toasts: ToastMessage[];
  openModal: (modal: UiState["activeModal"], data?: Record<string, unknown> | null) => void;
  closeModal: () => void;
  toggleDrawer: (open?: boolean) => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  modalData: null,
  drawerOpen: false,
  toasts: [],
  openModal: (activeModal, modalData = null) =>
    set({ activeModal, modalData: modalData ?? null }),
  closeModal: () =>
    set({ activeModal: null, modalData: null }),
  toggleDrawer: (open) =>
    set((state) => ({
      drawerOpen: typeof open === "boolean" ? open : !state.drawerOpen,
    })),
  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
