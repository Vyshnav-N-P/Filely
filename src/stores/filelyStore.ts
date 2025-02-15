import { create } from "zustand"; 

export type FilelyState = {
  FILE: File | null;
};

export type Actions = {
  setFile: (file: File) => void;
  removeFile: () => void;
  
};

export const useFilelyStore = create<FilelyState & Actions>((set) => ({
  FILE: null,
  setFile: (file:File) => set(() => ({ FILE: file })),
  removeFile: () => set(() => ({ FILE: null })),
}));
