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
import InkCanvasV2, { InkCanvasV2Ref } from "./InkCanvasV2";
import { NotesCode } from "@/handwriting";
import { useFilesystemContext } from "@/components/filesystem-provider";
import { toast } from "@/hooks/use-toast";
import { PopoverPicker } from "@/components/popOverPicker";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  X,
  Home,
  PenTool,
  Eraser,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const canvasRef: React.Ref<InkCanvasV2Ref | undefined> = useRef(undefined);
  const addPageBtnRef = useRef<HTMLButtonElement>(null);
  const addPageDropdownRef = useRef<HTMLDivElement>(null);
  const [isNotesAppVisible, setIsNotesAppVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // Button click animation handler
  const handleButtonClick = (buttonId: string, callback?: () => void) => {
    setClickedButton(buttonId);
    setTimeout(() => setClickedButton(null), 200);
    if (callback) callback();
  };

  // Get button classes with animation
  const getButtonClasses = (buttonId: string, baseClasses: string) => {
    const isClicked = clickedButton === buttonId;
    return `${baseClasses} transition-all duration-200 ${
      isClicked ? 'scale-110 bg-blue-500 text-white shadow-lg shadow-blue-500/50' : ''
    }`;
  };

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
    handleButtonClick('addFirst');
    try {
      await createPage(undefined, { insert: "first" });
      toast({
        title: "Page added",
        description: "New page added as first page",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add page",
        variant: "destructive",
      });
    }
    setIsDropdownOpen(false);
  };
  const addLastHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleButtonClick('addLast');
    try {
      await createPage(undefined, { insert: "last" });
      toast({
        title: "Page added",
        description: "New page added as last page",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add page",
        variant: "destructive",
      });
    }
    setIsDropdownOpen(false);
  };
  const addAfterHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleButtonClick('addAfter');
    try {
      await createPage(undefined, { insert: "after" });
      toast({
        title: "Page added",
        description: "New page added after current page",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add page",
        variant: "destructive",
      });
    }
    setIsDropdownOpen(false);
  };
  const addBeforeHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleButtonClick('addBefore');
    try {
      await createPage(undefined, { insert: "before" });
      toast({
        title: "Page added",
        description: "New page added before current page",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add page",
        variant: "destructive",
      });
    }
    setIsDropdownOpen(false);
  };

  // Delete/clear/close
  const deletePageHandler = useCallback(async () => {
    if (currentPage) {
      try {
        await deletePage(currentPage);
        toast({
          title: "Page deleted",
          description: "Current page has been deleted",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete page",
          variant: "destructive",
        });
      }
    }
  }, [currentPage]);
  const clearPageHandler = useCallback(() => {
    if (currentPage === undefined) return;
    let newPages = structuredClone(pages);
    if (!newPages) return;
    newPages.set(currentPage, new NotesCode.Document());
    setPages(newPages);
    toast({
      title: "Page cleared",
      description: "All content has been removed from the current page",
    });
  }, [currentPage, pages]);
  const closeAppHandler = () => {
    setIsNotesAppVisible(false);
    setShowCanvasEditor(false);
  };

  const savePageHandler = () => {
    if (currentPage === undefined) return;
    try {
      savePage(currentPage);
      toast({
        title: "Page saved",
        description: "Current page has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    }
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
      <div className="flex h-screen bg-[#191919] text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 p-8">Loading...</div>
        </div>
      </div>
    );
  }
  if (pages !== undefined && pages?.size === 0) {
    return (
      <div className="flex h-screen bg-[#191919] text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 p-8">No page loaded.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#191919] text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#333] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={getButtonClasses('home', "text-gray-400 hover:text-white hover:bg-[#333]")}
                    onClick={() => handleButtonClick('home', closeAppHandler)}
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#333] text-white border-[#444]">
                  <p>Back to Home</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <h1 className="text-xl font-semibold">Notes Code</h1>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleButtonClick('prev', prevPageHandler)}
                    disabled={!hasPrevPage}
                    className={getButtonClasses('prev', "text-gray-400 hover:text-white hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#333] text-white border-[#444]">
                  <p>Previous Page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleButtonClick('next', nextPageHandler)}
                    disabled={!hasNextPage}
                    className={getButtonClasses('next', "text-gray-400 hover:text-white hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#333] text-white border-[#444]">
                  <p>Next Page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={addPageBtnRef}
                  variant="ghost"
                  size="sm"
                  className={getButtonClasses('addPage', "text-gray-400 hover:text-white hover:bg-[#333]")}
                  onClick={() => handleButtonClick('addPage')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#333] border-[#444] text-white">
                <DropdownMenuItem
                  onClick={addFirstHandler}
                  className="hover:bg-[#444] cursor-pointer"
                >
                  Add as First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={addLastHandler}
                  className="hover:bg-[#444] cursor-pointer"
                >
                  Add as Last
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={addAfterHandler}
                  className="hover:bg-[#444] cursor-pointer"
                >
                  Add After Current
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={addBeforeHandler}
                  className="hover:bg-[#444] cursor-pointer"
                >
                  Add Before Current
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-[#333] p-3 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleButtonClick('save', savePageHandler)}
                  className={getButtonClasses('save', "text-gray-400 hover:text-white hover:bg-[#333]")}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#333] text-white border-[#444]">
                <p>Save Page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleButtonClick('clear', clearPageHandler)}
                  className={getButtonClasses('clear', "text-gray-400 hover:text-white hover:bg-[#333]")}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#333] text-white border-[#444]">
                <p>Clear Page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleButtonClick('delete', deletePageHandler)}
                  className={getButtonClasses('delete', "text-gray-400 hover:text-white hover:bg-[#333]")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#333] text-white border-[#444]">
                <p>Delete Page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-4 w-px bg-[#333] mx-2" />

          <div className="flex items-center gap-2">
            <PopoverPicker color={strokeColor} onChange={setStrokeColor} />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleButtonClick('pencil', () => setErasing(false))}
                    className={getButtonClasses('pencil', `${
                      !erasing 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-gray-400 hover:text-white hover:bg-[#333]"
                    }`)}
                  >
                    <PenTool className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#333] text-white border-[#444]">
                  <p>Switch to Drawing Tool</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleButtonClick('eraser', () => setErasing(true))}
                    className={getButtonClasses('eraser', `${
                      erasing 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "text-gray-400 hover:text-white hover:bg-[#333]"
                    }`)}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#333] text-white border-[#444]">
                  <p>Switch to Eraser Tool</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg border border-[#333] overflow-hidden">
            <InkCanvasV2
              ref={canvasRef as React.Ref<InkCanvasV2Ref>}
              pageID={currentPage}
              erasing={erasing}
              defaultBackground="#FFFFFF"
              width={100000}
              height={50000}
              strokeDiameter={10}
              penInputOnly={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
