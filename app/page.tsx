"use client";

import type React from "react";
declare const showDirectoryPicker: (
  options?: any
) => Promise<FileSystemDirectoryHandle | undefined>;
import { useState, useCallback, JSX, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Home,
  Inbox,
  FileText,
  Folder,
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  Settings,
  Menu,
  Star,
  X,
  MoreHorizontal,
  ChevronLeft,
  PenSquare,
  Save,
  FilePlus2,
  File,
  Folders,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NotesCode } from "../handwriting";
import { useToast, toast, errorToast } from "../hooks/use-toast";
import { useFilesystem } from "../hooks/use-filesystem";

export default function NotionClone() {
  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharedExpanded, setSharedExpanded] = useState(true);
  const [privateExpanded, setPrivateExpanded] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newNotebookName, setNewNotebookName] = useState("");
  const [newNotebookDescription, setNewNotebookDescription] = useState("");
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);

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
  } = useFilesystem();

  // Current date and time for greeting
  const currentDate = new Date();
  const hours = currentDate.getHours();
  let greeting = "Good morning";

  if (hours >= 12 && hours < 18) {
    greeting = "Good afternoon";
  } else if (hours >= 18) {
    greeting = "Good evening";
  }

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Handle search
  const handleSearchFocus = useCallback(() => {
    setSearchActive(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    if (!searchQuery) {
      setSearchActive(false);
    }
  }, [searchQuery]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchActive(false);
  }, []);

  // Toggle sections
  const toggleShared = useCallback(() => {
    setSharedExpanded(!sharedExpanded);
  }, [sharedExpanded]);

  const togglePrivate = useCallback(() => {
    setPrivateExpanded(!privateExpanded);
  }, [privateExpanded]);

  // Navigation
  const navigateTo = useCallback((page: string) => {
    setActivePage(page);
  }, []);

  // New page
  const openNewPageModal = useCallback(() => {
    setShowNewPageModal(true);
  }, []);

  const createNewPage = useCallback(() => {
    if (newPageTitle.trim()) {
      // In a real app, we would create the page here
      console.log("Creating new page:", newPageTitle);
      setNewPageTitle("");
      setShowNewPageModal(false);
    }
  }, [newPageTitle]);

  const openNewNotebookModal = useCallback(() => {
    setShowNewNotebookModal(true);
  }, []);

  const createNotebook = useCallback(() => {
    if (newNotebookName.trim()) {
      // In a real app, we would create the notebook here
      console.log("Creating new notebook:", newNotebookName);
      setNewNotebookName("");
      setNewNotebookDescription("");
      setShowNewNotebookModal(false);
      createNewNotebook(newNotebookName, "Notebook Description");
    }
  }, [newNotebookName]);

  // Recently visited pages data
  const recentPages = [
    {
      id: "schuler-ai",
      title: "SchülerAI LMS",
      icon: "image",
      date: "Mar 9",
      user: "S",
    },
    {
      id: "ki-ausblick",
      title: "KI-Ausblick und Perspektiven",
      icon: "file",
      date: "Mar 16",
      user: "S",
    },
    {
      id: "transformer",
      title: "Transformer",
      icon: "file",
      date: "Mar 16",
      user: "S",
    },
    {
      id: "computer-vision",
      title: "Computer Vision",
      icon: "file",
      date: "Mar 4",
      user: "S",
    },
    {
      id: "neuronale-netze",
      title: "Neuronale Netze",
      icon: "file",
      date: "Mar 4",
      user: "S",
    },
    {
      id: "forum",
      title: "Forum",
      icon: "forum",
      date: "Jan 25",
      user: "S",
    },
  ];

  // Calendar events data
  const events = [
    {
      id: 1,
      title: "My first meeting",
      time: "9 AM",
      location: "Office",
      day: "Today",
      date: "May 6",
    },
    {
      id: 2,
      title: "Lunch",
      time: "1 PM",
      location: "Restaurant",
      day: "Today",
      date: "May 6",
    },
    {
      id: 3,
      title: "Grocery shopping",
      time: "11 AM",
      location: "Store",
      day: "Wed",
      date: "May 7",
    },
    {
      id: 4,
      title: "Birthday celebration",
      time: "7 PM",
      location: "Restaurant",
      day: "Wed",
      date: "May 7",
    },
  ];

  return (
    <div className="flex h-screen bg-[#191919] text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-14" : "w-60"
        } border-r border-[#333] flex flex-col transition-all duration-200`}
      >
        <div className="p-3 flex items-center justify-between border-b border-[#333]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-500 rounded-md flex items-center justify-center text-xs cursor-pointer hover:bg-gray-600 transition">
                S
              </div>
              <span className="text-sm font-medium">Selo Inan's Notion</span>
              <ChevronDown className="h-3 w-3 cursor-pointer hover:text-gray-300" />
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-6 h-6 bg-gray-500 rounded-md flex items-center justify-center text-xs cursor-pointer hover:bg-gray-600 transition mx-auto">
              S
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              className="text-gray-400 hover:text-white transition"
              onClick={toggleSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {sidebarCollapsed && (
            <button
              className="text-gray-400 hover:text-white transition mx-auto"
              onClick={toggleSidebar}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-2 space-y-1">
          <div
            className={`flex items-center gap-2 p-2 rounded-md text-gray-400 hover:bg-[#333] cursor-pointer transition ${
              searchActive ? "bg-[#333] text-white" : ""
            }`}
            onClick={handleSearchFocus}
          >
            <Search className="h-4 w-4" />
            {!sidebarCollapsed && (
              <>
                {!searchActive && <span className="text-sm">Search</span>}
                {searchActive && (
                  <div className="flex-1 flex items-center">
                    <Input
                      type="text"
                      placeholder="Search"
                      className="h-6 bg-transparent border-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onBlur={handleSearchBlur}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        className="text-gray-400 hover:text-white"
                        onClick={clearSearch}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div
            className="flex items-center gap-2 p-2 rounded-md text-gray-400 hover:bg-[#333] cursor-pointer transition"
            onClick={() => navigateTo("notion-ai")}
          >
            <Star className="h-4 w-4" />
            {!sidebarCollapsed && <span className="text-sm">Notion AI</span>}
          </div>

          <div
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#333] cursor-pointer transition ${
              activePage === "home" ? "bg-[#333] text-white" : "text-gray-400"
            }`}
            onClick={() => navigateTo("home")}
          >
            <Home className="h-4 w-4" />
            {!sidebarCollapsed && <span className="text-sm">Home</span>}
          </div>

          <div
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-[#333] cursor-pointer transition ${
              activePage === "inbox" ? "bg-[#333] text-white" : "text-gray-400"
            }`}
            onClick={() => navigateTo("inbox")}
          >
            <Inbox className="h-4 w-4" />
            {!sidebarCollapsed && <span className="text-sm">Inbox</span>}
          </div>
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="mt-4 px-3">
              <div
                className="flex items-center justify-between text-xs text-gray-500 mb-1 cursor-pointer hover:text-gray-400 transition"
                onClick={toggleShared}
              >
                <span>Shared</span>
                {sharedExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>

              {sharedExpanded && (
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-gray-400 text-sm hover:bg-[#333] cursor-pointer transition ${
                      activePage === "schuler-ai" ? "bg-[#333] text-white" : ""
                    }`}
                    onClick={() => navigateTo("schuler-ai")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>SchülerAI LMS</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-gray-400 text-sm hover:bg-[#333] cursor-pointer transition ${
                      activePage === "plastic-fikirler"
                        ? "bg-[#333] text-white"
                        : ""
                    }`}
                    onClick={() => navigateTo("plastic-fikirler")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Plastic Fikirler Mecmuasi</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 px-3">
              <div
                className="flex items-center justify-between text-xs text-gray-500 mb-1 cursor-pointer hover:text-gray-400 transition"
                onClick={togglePrivate}
              >
                <span>Private</span>
                {privateExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>

              {privateExpanded && (
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-gray-400 text-sm hover:bg-[#333] cursor-pointer transition ${
                      activePage === "quick-note" ? "bg-[#333] text-white" : ""
                    }`}
                    onClick={() => navigateTo("quick-note")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Quick Note</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-gray-400 text-sm hover:bg-[#333] cursor-pointer transition ${
                      activePage === "personal-home"
                        ? "bg-[#333] text-white"
                        : ""
                    }`}
                    onClick={() => navigateTo("personal-home")}
                  >
                    <Home className="h-4 w-4" />
                    <span>Personal Home</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-gray-400 text-sm hover:bg-[#333] cursor-pointer transition ${
                      activePage === "reading-list"
                        ? "bg-[#333] text-white"
                        : ""
                    }`}
                    onClick={() => navigateTo("reading-list")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Reading List</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-gray-400 text-sm hover:bg-[#333] cursor-pointer transition ${
                      activePage === "schule" ? "bg-[#333] text-white" : ""
                    }`}
                    onClick={() => navigateTo("schule")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Schule</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-gray-400 text-sm hover:bg-[#333] cursor-pointer transition ${
                      activePage === "startup" ? "bg-[#333] text-white" : ""
                    }`}
                    onClick={() => navigateTo("startup")}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Startup</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-auto p-3 border-t border-[#333] flex items-center justify-between">
          <Dialog open={showNewPageModal} onOpenChange={setShowNewPageModal}>
            <DialogTrigger asChild>
              <div
                className={`flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition ${
                  sidebarCollapsed ? "justify-center" : ""
                }`}
                onClick={openNewPageModal}
              >
                <Plus className="h-4 w-4" />
                {!sidebarCollapsed && <span className="text-sm">New page</span>}
              </div>
            </DialogTrigger>
            <DialogContent className="bg-[#222] border-[#333] text-white">
              <DialogHeader>
                <DialogTitle>Create a new page</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Give your page a title. You can change this at any time.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Untitled"
                  className="bg-[#333] border-[#444] text-white focus-visible:ring-[#555]"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent text-gray-300 border-[#444] hover:bg-[#333] hover:text-white"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={createNewPage}
                  disabled={!newPageTitle.trim()}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={showNewNotebookModal}
            onOpenChange={setShowNewNotebookModal}
          >
            <DialogTrigger asChild>
              <div
                className={`flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition ${
                  sidebarCollapsed ? "justify-center" : ""
                }`}
                onClick={openNewNotebookModal}
              >
                <FilePlus2 className="h-4 w-4" />
                {!sidebarCollapsed && (
                  <span className="text-sm">New Notebook</span>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="bg-[#222] border-[#333] text-white">
              <DialogHeader>
                <DialogTitle>Create a new Notebook</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Give your notebook a name. You can change this at any time.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 gap-2">
                <Input
                  placeholder="Untitled"
                  className="bg-[#333] border-[#444] text-white focus-visible:ring-[#555] mb-4 "
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  autoFocus
                />
                <Input
                  placeholder="Notebook Description"
                  className="bg-[#333] border-[#444] text-white focus-visible:ring-[#555]"
                  value={newNotebookDescription}
                  onChange={(e) => setNewNotebookDescription(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent text-gray-300 border-[#444] hover:bg-[#333] hover:text-white"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={createNotebook}
                  disabled={!newNotebookName.trim()}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-white transition">
                  <Settings className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#333] text-white border-[#444]"
              >
                <p>Settings & Members</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">{greeting}, Selo Inan</h1>
          {directoryPickerAvailable && showDirectoryPicker !== undefined && (
            <>
              <Button
                onClick={() =>
                  showDirectoryPicker({ id: 0, mode: "readwrite" }).then(
                    (handle: FileSystemDirectoryHandle | undefined) => {
                      if (handle instanceof FileSystemDirectoryHandle) {
                        setTopDirectoryHandle(handle);
                        setDirectoryHandle(handle);
                        directoryStack.push(handle);
                      }
                    }
                  )
                }
                className="mb-4 bg-[#222] hover:bg-[#333] text-white"
              >
                Pick a directory
              </Button>
            </>
          )}
          {/* Files/Directory List */}
          {directoryHandle !== undefined && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Folders className="h-4 w-4" />
                <span>Folders</span>
              </div>
              <div className="flex flex-wrap flex-row overflow-y-auto overscroll-auto max-w-3xl gap-2 mb-4 text-gray-400 text-nowrap">
                {directoryHandle != topDirectoryHandle && (
                  <div
                    className="flex-shrink-0 flex-auto flex  justify-items-stretch items-center gap-2 p-2 rounded-md text-gray-400 hover:bg-[#333] cursor-pointer transition justify-content: space-between flex-grow"
                    key=".."
                    onClick={() => {
                      popDirectory();
                    }}
                  >
                    <Folder className="h-4 w-4" />
                    <span>..</span>
                  </div>
                )}
                {directoryFolders.map((item) => {
                  return (
                    <div
                      className="flex-shrink-0 flex-auto flex  justify-items-stretch items-center gap-2 p-2 rounded-md text-gray-400 hover:bg-[#333] cursor-pointer transition justify-content: space-between flex-grow"
                      key={item.name}
                      onClick={() => {
                        pushDirectory(item.name);
                      }}
                    >
                      <Folder className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="flex">Notebooks</span>
                </div>
                <div className="flex items-center flex-grow-0 border border-[#333] p-2 rounded-xl text-gray-400 hover:bg-[#333] cursor-pointer transition">
                  <FilePlus2 className="h-4 w-4" />
                  <Button
                    className="text-xs h-8 bg-transparent border-gray-600 text-gray-300 hover:bg-[#333] hover:text-white"
                    onClick={() => {
                      setShowNewNotebookModal(true);
                    }}
                  >
                    Create new Notebook
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap flex-row overflow-y-auto overscroll-auto max-w-3xl gap-2 mb-4 text-gray-400 text-nowrap">
                {directoryNotebooks.map((item) => {
                  return (
                    <div
                      className="flex-shrink-0 flex-auto flex  justify-items-stretch items-center gap-2 p-2 rounded-md text-gray-400 hover:bg-[#333] cursor-pointer transition justify-content: space-between flex-grow"
                      key={item.name}
                      onClick={() => {
                        if (
                          item.name !== undefined &&
                          directoryHandle !== undefined
                        ) {
                          openBook(item.name);
                        }
                      }}
                    >
                      <FileText className="w-2rem h-2rem" />
                      <span className="w-full text-center">{item.name}</span>
                    </div>
                  );
                })}
              </div>
              {pages.size > 0 && (
                <div className="flex flex-col gap-2 mb-4 text-gray-400 justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Pages</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-gray-400">
                    {[...pages.keys()].map((page) => {
                      return (
                        <div
                          key={page}
                          className="bg-[#222] rounded-lg p-4 hover:bg-[#2a2a2a] transition cursor-pointer group flex"
                        >
                          <Button
                            className="bg-white text-black hover:bg-gray-200 flex rounded-xl mr-2"
                            onClick={() => {
                              savePage(page);
                            }}
                          >
                            <Save className="h-4 w-4" />
                            <span className="text-sm">Save</span>
                          </Button>
                          <div className="flex-1 flex items-center justify-between">
                            {page}
                          </div>
                        </div>
                      );
                    })}
                    {pages.size > 5 && (
                      <div className="flex items-center gap-2 mb-4 text-gray-400">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="text-sm">More</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Recently visited */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Recently visited</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPages.map((page) => {
                return (
                  <div
                    key={page.id}
                    className="bg-[#222] rounded-lg p-4 hover:bg-[#2a2a2a] transition cursor-pointer group"
                    onClick={() => navigateTo(page.id)}
                  >
                    <div className="flex justify-between mb-4">
                      <div>
                        {page.icon === "image" && (
                          <Image
                            src="/placeholder.svg?height=40&width=120"
                            width={120}
                            height={40}
                            alt={page.title}
                            className="h-8 object-contain"
                          />
                        )}
                        {page.icon === "file" && (
                          <FileText className="h-6 w-6 text-gray-400" />
                        )}
                        {page.icon === "forum" && (
                          <div className="h-6 w-6 text-pink-500 flex items-center justify-center">
                            <span className="text-lg">🗣️</span>
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#333] border-[#444] text-white">
                          <DropdownMenuItem className="hover:bg-[#444] cursor-pointer">
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#444] cursor-pointer">
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#444] cursor-pointer text-red-400">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm font-medium">{page.title}</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center text-[10px]">
                        {page.user}
                      </div>
                      <span className="text-xs text-gray-400">{page.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Upcoming events</span>
            </div>

            <div className="bg-[#222] rounded-lg p-6 mb-4">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400 text-sm">
                      See your upcoming events and join meetings from Home.
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 text-blue-400 hover:text-blue-300"
                    >
                      Connect Notion Calendar
                    </Button>
                  </div>
                </div>

                <div className="flex-1 border-t md:border-t-0 md:border-l border-[#333] p-4">
                  {events.reduce((acc: JSX.Element[], event, index, array) => {
                    // Check if we need to add a day header
                    if (index === 0 || event.day !== array[index - 1].day) {
                      acc.push(
                        <div
                          key={`day-${event.day}`}
                          className={`${index > 0 ? "mt-6" : ""} mb-4`}
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {event.day}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.date}
                          </div>
                        </div>
                      );
                    }

                    // Add the event
                    acc.push(
                      <div
                        key={event.id}
                        className="mb-4 cursor-pointer hover:bg-[#2a2a2a] p-2 -mx-2 rounded transition"
                      >
                        <div className="text-sm">{event.title}</div>
                        <div className="text-xs text-gray-400">
                          {event.time} · {event.location}
                        </div>
                      </div>
                    );

                    return acc;
                  }, [] as JSX.Element[])}

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="text-xs h-8 bg-transparent border-gray-600 text-gray-300 hover:bg-[#333] hover:text-white"
                    >
                      Join meeting
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Home views */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Menu className="h-4 w-4" />
              <span className="text-sm">Home views</span>
            </div>

            <div className="bg-[#222] rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium">Activity</div>
                <div className="text-sm font-medium">Status</div>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-[#333] hover:bg-[#2a2a2a] -mx-6 px-6 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Wake up and freshen up</span>
                </div>
                <div className="text-sm text-gray-400">Done</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Button */}
      <div className="fixed bottom-6 right-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-12 w-12 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg"
                onClick={openNewPageModal}
              >
                <PenSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="bg-[#333] text-white border-[#444]"
            >
              <p>New page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
