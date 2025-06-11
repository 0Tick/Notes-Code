'use client';
import React, { createContext, useContext } from "react";
import { useFilesystem } from "@/hooks/use-filesystem";

const FilesystemContext = createContext<ReturnType<typeof useFilesystem> | null>(null);

export const FilesystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fs = useFilesystem();
  return (
    <FilesystemContext.Provider value={fs}>
      {children}
    </FilesystemContext.Provider>
  );
};

export function useFilesystemContext() {
  const ctx = useContext(FilesystemContext);
  if (!ctx) throw new Error("useFilesystemContext must be used within a FilesystemProvider");
  return ctx;
}