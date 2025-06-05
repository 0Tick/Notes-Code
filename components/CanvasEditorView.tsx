"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  createRef,
  SetStateAction,
  Dispatch,
} from "react";
import { useFilesystem } from "@/hooks/use-filesystem";
import InkOneCanvas, { InkOneCanvasRef } from "./InkOneCanvas";
import { NotesCode } from "@/handwriting";
import { useFilesystemContext } from "@/components/filesystem-provider";
import { PopoverPicker } from "@/components/popOverPicker";

export default function CanvasEditorView() {
  // Use the custom filesystem hook
  const {
    directoryPickerAvailable,
    topDirectoryHandle,
    directoryFolders,
    directoryNotebooks,
    directoryHandle,
    directoryStack,
    notebookConfig,
    notebookDirectory,
    pagesDirectory,
    imagesDirectory,
    pages,
    setDirectoryHandle,
    setTopDirectoryHandle,
    popDirectory,
    pushDirectory,
    openBook,
    loadPage,
    savePage,
    createNewNotebook,
    removeDirectory,
    createDirectory,
    setPages,
    createPage,
    reloadPages,
    currentPage,
    setCurrentPage,
    deletePage,
    unloadNotebook,
    showCanvasEditor,
    setShowCanvasEditor,
    strokeColor,
    setStrokeColor,
  } = useFilesystemContext();
  const canvasRef: React.Ref<InkOneCanvasRef | undefined> = useRef(undefined);
  const addPageBtnRef = useRef<HTMLButtonElement>(null);
  const addPageDropdownRef = useRef<HTMLDivElement>(null);
  const [isNotesAppVisible, setIsNotesAppVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [erasing, setErasing] = useState(false);
  // Navigation handlers
  const prevPageHandler = () => {
    if (currentPage === undefined || notebookConfig === undefined) return;
    let prevPage = notebookConfig?.pages.get(currentPage)?.prevPage;
    if (prevPage === undefined) return;
    setCurrentPage(prevPage);
  };
  const nextPageHandler = () => {
    if (currentPage === undefined || notebookConfig === undefined) return;
    let nextPage = notebookConfig?.pages.get(currentPage)?.nextPage;
    if (nextPage === undefined) return;
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    if (currentPage === undefined) return;
    let conf = notebookConfig?.pages.get(currentPage);
    if (conf === undefined) return;
    let nextPage = conf?.nextPage;
    let prevPage = conf?.prevPage;
    setHasNextPage(nextPage !== "");
    setHasPrevPage(prevPage !== "");
  }, [currentPage, notebookConfig]);

  // Add page handlers
  const addPageBtnHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };
  const addFirstHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    await createPage(undefined, { insert: "first" });
    setIsDropdownOpen(false);
  };
  const addLastHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    createPage(undefined, { insert: "last" });
    setIsDropdownOpen(false);
  };
  const addAfterHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    createPage(undefined, { insert: "after" });
    setIsDropdownOpen(false);
  };
  const addBeforeHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    createPage(undefined, { insert: "before" });
    setIsDropdownOpen(false);
  };

  // Delete/clear/close
  const deletePageHandler = useCallback(async () => {
    if (currentPage) {
      return await deletePage(currentPage);
    }
  }, [currentPage]);
  const clearPageHandler = useCallback(() => {
    if (currentPage === undefined) return;
    let newPages = structuredClone(pages);
    if (!newPages) return;
    newPages.set(currentPage, new NotesCode.Document());
    setPages(newPages);
  }, [currentPage, pages]);
  const closeAppHandler = () => {
    setIsNotesAppVisible(false);
    setShowCanvasEditor(false);
  };

  const savePageHandler = () => {
    //debugger;
    if (currentPage === undefined) return;
    savePage(currentPage);
  };

  // Dropdown close on outside click
  useEffect(() => {
    if (typeof window !== "undefined") return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        addPageBtnRef.current &&
        !addPageBtnRef.current.contains(event.target as Node) &&
        addPageDropdownRef.current &&
        !addPageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  if (!isNotesAppVisible) return <></>;
  if (pages === undefined || (currentPage !== undefined && pages.size === 0)) {
    return (
      <div className="notes-app-wrapper fixed inset-0 bg-zinc-900/80 backdrop-blur-sm text-zinc-200 p-0 flex justify-center items-center font-sans z-50">
        <div className="text-center text-zinc-400 p-8">Loading...</div>
      </div>
    );
  }
  if (pages !== undefined && pages?.size === 0) {
    return (
      <div className="notes-app-wrapper fixed inset-0 bg-zinc-900/80 backdrop-blur-sm text-zinc-200 p-0 flex justify-center items-center font-sans z-50">
        <div className="text-center text-zinc-400 p-8">No page loaded.</div>
      </div>
    );
  }

  return (
    <div className="notes-app-wrapper fixed inset-0 bg-zinc-900/80 backdrop-blur-sm text-zinc-200 p-0 flex justify-center items-center font-sans z-50">
      <div className="app-container font-sans bg-zinc-800 w-full h-full flex flex-col overflow-hidden">
        <header className="app-header bg-sky-600 text-white p-3 text-center border-b border-zinc-700 shrink-0">
          <h1 className="m-0 text-xl">Notes Code</h1>
        </header>
        <main className="main-content p-3 flex flex-col flex-grow overflow-y-auto">
          <div className="controls toolbar-controls flex justify-start items-center px-2 py-1.5 bg-zinc-800 rounded-md mb-2 border-b border-zinc-700 shrink-0">
            <button
              onClick={prevPageHandler}
              title="Previous Page"
              disabled={!hasPrevPage}
              className={`bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base mr-1 hover:bg-zinc-700 hover:text-sky-500 ${
                !hasPrevPage ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              &#x2190;
            </button>
            <button
              onClick={nextPageHandler}
              title="Next Page"
              disabled={!hasNextPage}
              className={`bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base mr-1 hover:bg-zinc-700 hover:text-sky-500 ${
                !hasNextPage ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              &#x2192;
            </button>
            <div className="dropdown relative inline-block">
              <button
                ref={addPageBtnRef}
                onClick={addPageBtnHandler}
                className="dropdown-btn bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base mr-1 hover:bg-zinc-700 hover:text-sky-500"
                title="Add Page"
              >
                +
              </button>
              {isDropdownOpen && (
                <div
                  ref={addPageDropdownRef}
                  className="dropdown-content absolute bg-zinc-700 min-w-[160px] shadow-lg z-[100] rounded-md top-full left-0 mt-1"
                >
                  <a
                    href="#"
                    onClick={addFirstHandler}
                    className="text-zinc-200 px-3 py-2 block border-b border-zinc-600 text-sm hover:bg-sky-600 hover:text-white"
                  >
                    Add as First
                  </a>
                  <a
                    href="#"
                    onClick={addLastHandler}
                    className="text-zinc-200 px-3 py-2 block border-b border-zinc-600 text-sm hover:bg-sky-600 hover:text-white"
                  >
                    Add as Last
                  </a>
                  <a
                    href="#"
                    onClick={addAfterHandler}
                    className="text-zinc-200 px-3 py-2 block text-sm hover:bg-sky-600 hover:text-white last:border-b-0"
                  >
                    Add After Current
                  </a>
                  <a
                    href="#"
                    onClick={addBeforeHandler}
                    className="text-zinc-200 px-3 py-2 block text-sm hover:bg-sky-600 hover:text-white last:border-b-0"
                  >
                    Add Before Current
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={deletePageHandler}
              title="Delete Page"
              className="bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base mr-1 hover:bg-zinc-700 hover:text-sky-500"
            >
              &#x1F5D1;
            </button>
            <button
              onClick={savePageHandler}
              title="Save Page"
              className="bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base mr-1 hover:bg-zinc-700 hover:text-sky-500"
            >
              {" "}
              &#x1F4BE;
            </button>
            <button
              onClick={clearPageHandler}
              title="Clear Page"
              className="bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base mr-1 hover:bg-zinc-700 hover:text-sky-500"
            >
              🧽
            </button>
            <PopoverPicker
              color={strokeColor}
              onChange={
                setStrokeColor
              }
            />
            <button
              onClick={() => setErasing(!erasing)}
              title={erasing ? "Disable Eraser" : "Enable Eraser"}
              className={`bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base mr-1 hover:bg-zinc-700 hover:text-sky-500 ${
                erasing ? "bg-red-500" : ""
              }`}
            >
              🩹
            </button>
            <button
              onClick={closeAppHandler}
              title="Close Notes"
              className="bg-transparent text-zinc-200 border-none p-2 rounded cursor-pointer text-base ml-auto hover:bg-red-600 hover:text-white"
            >
              &#x2715;
            </button>
          </div>
          <div className="viewport bg-zinc-700/30 border border-zinc-600 rounded-md mb-0 flex flex-col flex-grow">
            <div className="page-content flex-grow p-2.5 flex flex-col">
              <InkOneCanvas
                ref={canvasRef as React.Ref<InkOneCanvasRef>}
                pageID={currentPage}
                erasing={erasing}
                defaultBackground="#222222"
                hideControls={true}
                width={1000}
                height={500}
                initialZoom={1}
                strokeDiameter={10}
                penInputOnly={false}
                colors={{"hallo": strokeColor}}
              />
            </div>
          </div>
        </main>
        <footer className="app-footer text-center p-2 bg-zinc-800 text-zinc-400 text-xs border-t border-zinc-700 shrink-0">
          <p className="m-0">&copy; 2025 Notes Code Demo</p>
        </footer>
      </div>
    </div>
  );
}
