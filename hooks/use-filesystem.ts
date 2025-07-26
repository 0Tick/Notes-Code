import { useState, useCallback, useEffect, useRef } from "react";
import { errorToast } from "./use-toast";
import { NotesCode } from "../handwriting";
import { nanoid } from "nanoid";
import { getHighlighter } from "@/lib/highlighter";

// Declaration for the experimental showDirectoryPicker API
declare const showDirectoryPicker: (
  options?: any
) => Promise<FileSystemDirectoryHandle | undefined>;

// Checks if a given FileSystemDirectoryHandle represents a notebook directory
function isNotebook(handle: FileSystemDirectoryHandle): boolean {
  return handle.name.endsWith(".ncnb");
}

//TODO Rewrite to use proper functional design patterns
// Custom hook for managing filesystem interactions and state
export function useFilesystem() {
  // State to track if the directory picker API is available
  const [directoryPickerAvailable, setDirectoryPickerAvailable] =
    useState(false);

  // Effect to check for directory picker availability on mount and initialize storage directory
  useEffect(() => {
    setDirectoryPickerAvailable(showDirectoryPicker !== undefined);
    if (
      navigator.storage &&
      navigator.storage.getDirectory !== undefined &&
      directoryHandle === undefined
    ) {
      navigator.storage.getDirectory().then((dirHandle) => {
        setTopDirectoryHandle(dirHandle);
        setDirectoryHandle(dirHandle);
        setDirectoryStack([dirHandle]);
      });
    }
    getHighlighter();
  }, []);

  const [showCanvasEditor, setShowCanvasEditor] = useState(false);
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const [erasing, setErasing] = useState<boolean>(false);
  // State to trigger a reload of the currently active pages
  const [toReloadPages, setToReloadPages] = useState<boolean>(false);

  // State for the top-level directory handle selected by the user
  const [topDirectoryHandle, setTopDirectoryHandle] = useState<
    FileSystemDirectoryHandle | undefined
  >(undefined);
  // State for the list of folders in the current directory
  const [directoryFolders, setDirectoryFolders] = useState<
    { name: string; handle: FileSystemDirectoryHandle }[]
  >([]);
  // State for the list of notebooks in the current directory
  const [directoryNotebooks, setDirectoryNotebooks] = useState<
    { name: string; handle: FileSystemDirectoryHandle }[]
  >([]);
  // State for the current directory handle
  const [directoryHandle, setDirectoryHandle] = useState<
    FileSystemDirectoryHandle | undefined
  >(undefined);

  // Updates the folders and notebooks in the current directory
  const updateDirectory = useCallback(
    (handle?: FileSystemDirectoryHandle) => {
      if (handle === undefined) {
        handle = directoryHandle;
      }
      if (handle === undefined) {
        setDirectoryFolders([]);
        setDirectoryNotebooks([]);
        return Promise.resolve();
      }
      let directoryEntries: {
        name: string;
        handle: FileSystemDirectoryHandle;
      }[] = [];
      let notebookEntries: {
        name: string;
        handle: FileSystemDirectoryHandle;
      }[] = [];
      let getEntries = async () => {
        for await (const [
          key,
          value,
          //@ts-expect-error 2339
        ] of handle.entries() as Iterable<
          [string, FileSystemDirectoryHandle | FileSystemFileHandle]
        >) {
          if (value instanceof FileSystemDirectoryHandle) {
            if (isNotebook(value)) {
              notebookEntries.push({
                name: key.replace(".ncnb", ""),
                handle: value,
              });
            } else {
              directoryEntries.push({
                name: key,
                handle: value,
              });
            }
          }
        }
      };
      return getEntries()
        .then(() => {
          directoryEntries.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          );
          notebookEntries.sort((a, b) =>
            a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1
          );
          setDirectoryFolders(directoryEntries);
          setDirectoryNotebooks(notebookEntries);
          return Promise.resolve();
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    [directoryHandle]
  );

  // State for the stack of directory handles for navigation history
  const [directoryStack, setDirectoryStack] = useState<
    FileSystemDirectoryHandle[]
  >([]);
  // State for the name of the notebook to be opened
  const [openBookName, setOpenBookName] = useState<string | undefined>(
    undefined
  );

  // Pops the last directory from the stack and sets it as the current directory
  const popDirectory = useCallback(() => {
    let newStack = [...directoryStack];
    if (directoryStack.length > 1) {
      newStack.pop();
    }
    setDirectoryHandle(newStack[newStack.length - 1]);
    setDirectoryStack(newStack);
  }, [directoryStack]);

  // Pushes a new directory onto the stack and sets it as the current directory
  const pushDirectory = useCallback(
    (name: string) => {
      if (directoryHandle === undefined) {
        return;
      }
      directoryHandle
        .getDirectoryHandle(name)
        .then((handle) => {
          setDirectoryStack([...directoryStack, handle]);
          setDirectoryHandle(handle);
        })
        .catch((err) => {
          console.debug(err.message, err.stack);
        });
    },
    [directoryStack, directoryHandle]
  );

  // State for the configuration of the currently opened notebook
  const [notebookConfig, setNotebookConfig] = useState<{
    version: string;
    description: string;
    lastActivePage: string;
    pages: Map<
      string,
      {
        width: number;
        height: number;
        background: string;
        nextPage: string;
        prevPage: string;
      }
    >;
  }>();
  // State for the base directory handle of the currently opened notebook
  const [notebookDirectory, setNotebookDirectory] = useState<
    FileSystemDirectoryHandle | undefined
  >(undefined);
  // State for the pages directory handle of the currently opened notebook
  const [pagesDirectory, setPagesDirectory] = useState<
    FileSystemDirectoryHandle | undefined
  >(undefined);
  // State for the images directory handle of the currently opened notebook
  const [imagesDirectory, setImagesDirectory] = useState<
    FileSystemDirectoryHandle | undefined
  >(undefined);
  // State for the files directory handle of the currently opened notebook
  const [filesDirectory, setFilesDirectory] = useState<
    FileSystemDirectoryHandle | undefined
  >(undefined);

  // Refreshes the handle for the pages directory
  const refreshPagesDirectory = useCallback(
    (notebookDir?: FileSystemDirectoryHandle) => {
      let dir = notebookDir;
      if (notebookDirectory === undefined) {
        dir = notebookDirectory;
      }
      if (dir === undefined) {
        return Promise.reject("No notebook directory set");
      }
      return dir.getDirectoryHandle("pages").then((handle) => {
        setPagesDirectory(handle);
        return handle;
      });
    },
    [notebookDirectory]
  );

  // Refreshes the handle for the images directory
  const refreshImagesDirectory = useCallback(
    (notebookDir?: FileSystemDirectoryHandle) => {
      let dir = notebookDir;
      if (notebookDirectory === undefined) {
        dir = notebookDirectory;
      }
      if (dir === undefined) {
        return Promise.reject("No notebook directory set");
      }
      return dir.getDirectoryHandle("img", { create: true }).then((handle) => {
        setImagesDirectory(handle);
        return handle;
      });
    },
    [notebookDirectory]
  );

  // Refreshes the handle for the files directory
  const refreshFilesDirectory = useCallback(
    (notebookDir?: FileSystemDirectoryHandle) => {
      let dir = notebookDir;
      if (notebookDirectory === undefined) {
        dir = notebookDirectory;
      }
      if (dir === undefined) {
        return Promise.reject("No notebook directory set");
      }
      return dir
        .getDirectoryHandle("files", { create: true })
        .then((handle) => {
          setFilesDirectory(handle);
          return handle;
        });
    },
    [notebookDirectory]
  );

  // Effect to update image and pages directory handles and load notebook config when the notebook directory changes
  useEffect(() => {
    let newPages = new Map<string, NotesCode.Document>();
    if (notebookDirectory === undefined) {
      unloadNotebook();
      return;
    }
    new Promise(async (resolve, reject) => {
      let directories = await Promise.all([
        refreshImagesDirectory(notebookDirectory),
        refreshPagesDirectory(notebookDirectory),
        refreshFilesDirectory(notebookDirectory),
      ]);
      let [imageDirHandle, textDirHandle, filesDirHandle] = directories;
      let fileHandle = await notebookDirectory.getFileHandle("nc.json");
      let file = await fileHandle.getFile();
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (reader.result !== null) {
          let notebook: {
            version: string;
            description: string;
            lastActivePage: string;
            pages: Map<
              string,
              {
                width: number;
                height: number;
                background: string;
                nextPage: string;
                prevPage: string;
              }
            >;
          } = JSON.parse(reader.result.toString());
          notebook.pages = new Map<
            string,
            {
              width: number;
              height: number;
              background: string;
              nextPage: string;
              prevPage: string;
            }
          >(Object.entries(notebook.pages));
          let pagesDirHandle = await notebookDirectory.getDirectoryHandle(
            "pages"
          );
          let cont = await loadPage(
            notebook.lastActivePage,
            pagesDirHandle,
            undefined,
            undefined,
            imageDirHandle,
            filesDirHandle
          );
          newPages.set(notebook.lastActivePage, cont);
          setNotebookConfig(notebook);
          currentPageRef.current = notebook.lastActivePage;
          setCurrentPage(notebook.lastActivePage);
        }
      };
      reader.readAsText(file);
    }).catch((err: any) => {
      errorToast({
        title: "Error loading notebook",
        description:
          "Something went wrong reading the Notebook. Is the Index file missing? Check console for more details.",
      });
      console.debug(err.message, err.stack);
    });
  }, [notebookDirectory]);

  // Opens a notebook by name and sets the notebook directory handle
  const openBook = useCallback(
    async (notebookName: string) => {
      if (directoryHandle === undefined) {
        return Promise.reject("No directory handle set");
      }
      return unloadNotebook()
        .catch(() => {})
        .finally(() => {
          return directoryHandle
            .getDirectoryHandle(notebookName + ".ncnb")
            .then((dirHandle) => {
              setNotebookDirectory(dirHandle);
              return Promise.resolve();
            });
        });
    },
    [directoryHandle]
  );

  // State for the currently loaded pages of the notebook
  const [pages, setPages] = useState<Map<string, NotesCode.Document>>(
    new Map<string, NotesCode.Document>()
  );

  const [currentPage, setCurrentPage] = useState<string | undefined>(undefined);

  // Effect to update notebook config with the last active page when the current page changes
  useEffect(() => {
    if (currentPage !== undefined && notebookConfig !== undefined) {
      setNotebookConfig({
        version: notebookConfig.version,
        description: notebookConfig.description,
        lastActivePage: currentPage,
        pages: notebookConfig.pages,
      });
      setToReloadPages(true);
    }
  }, [currentPage]);

  const setPage = useCallback(
    (page: NotesCode.Document, id?: string) => {
      if (!id) id = currentPage;
      if (!id || !pages) return;
      return Promise.resolve(
        setPages((pages) => {
          let newPages = structuredClone(pages);
          newPages.set(id, page);
          return newPages;
        })
      );
    },
    [currentPage, pages]
  );

  // Loads a specific page from the pages directory
  const loadPage = useCallback(
    async (
      page: string,
      pageDirHandle?: FileSystemDirectoryHandle,
      customPages?: Map<string, NotesCode.Document>,
      fullReload?: boolean,
      imageDirHandle?: FileSystemDirectoryHandle,
      textDirHandle?: FileSystemDirectoryHandle
    ) => {
      let handle = pageDirHandle;
      if (handle === undefined) {
        handle = pagesDirectory;
      }
      if (handle === undefined) {
        return Promise.reject("No pages directory set");
      }
      let updatePages = false;
      if (customPages === undefined && !fullReload) {
        customPages = pages;
        updatePages = true;
      }
      if (pages.has(page) && !fullReload) {
        let p = pages.get(page);
        if (p === undefined) {
          return Promise.reject("Page not found");
        }
        return Promise.resolve(p);
      }
      let pageHandle = await handle.getFileHandle(page);
      let file = await pageHandle.getFile();
      let result = await new Promise(
        (resolve: (value: ArrayBuffer) => void, reject) => {
          const reader = new FileReader();

          // Handle successful load
          reader.onload = (e) => {
            if (typeof reader.result === "object") {
              resolve(reader.result as ArrayBuffer);
            } else {
              reject(new Error("Unexpected result type"));
            }
          };

          // Handle errors
          reader.onerror = () => {
            reject(reader.error || new Error("File reading failed"));
          };

          // Initiate reading
          reader.readAsArrayBuffer(file);
        }
      );
      let pageContent = NotesCode.Document.decode(new Uint8Array(result));
      if (updatePages) {
        let newPages = new Map<string, NotesCode.Document>(customPages);
        newPages.set(page, pageContent);
        setPages(newPages);
      }
      let contentLoadingPromises = [];
      for (let img of pageContent.images) {
        if (img === undefined || img.image === undefined || img.image === null)
          continue;
        contentLoadingPromises.push(
          loadImage(img.image, imageDirHandle).catch((e) => {
            console.error(e.message, e.stack);
          })
        );
      }
      for (let txt of pageContent.textBlocks) {
        if (txt === undefined || txt.path === undefined || txt.path === null)
          continue;
        contentLoadingPromises.push(
          loadText(txt.path, textDirHandle).catch((e) => {
            console.error(e.message, e.stack);
          })
        );
      }
      await Promise.allSettled(contentLoadingPromises);
      return pageContent;
    },
    [pagesDirectory, pages, imagesDirectory, filesDirectory]
  );

  // Saves the content of a specific page to the pages directory
  const savePage = useCallback(
    async (page: string, unload?: boolean, dir?: FileSystemDirectoryHandle) => {
      if (dir === undefined) {
        dir = pagesDirectory;
      }
      if (dir === undefined) {
        return Promise.reject("No pages directory set");
      }
      let pageHandle = await dir.getFileHandle(page);
      let writable = await pageHandle.createWritable({
        keepExistingData: false,
      });
      let doc = pages.get(page);
      if (doc === undefined) {
        return Promise.reject(`Page '${page}' not found`);
      }
      let pageContent = NotesCode.Document.encode(doc).finish();
      await writable.write(pageContent);
      await writable.close();
      if (unload) {
        let newPages = new Map<string, NotesCode.Document>(pages);
        newPages.delete(page);
        return Promise.resolve(newPages);
      }
      return Promise.resolve(pages);
    },
    [pagesDirectory, pages]
  );

  // Saves the notebook configuration to nc.json
  const saveNotebookConfig = useCallback(() => {
    if (notebookConfig === undefined) {
      return Promise.reject("No notebook config set");
    }
    if (notebookDirectory === undefined) {
      return Promise.reject("No notebook directory set");
    }
    let nConf = structuredClone(notebookConfig);
    //@ts-expect-error
    nConf.pages = Object.fromEntries(nConf.pages);
    return notebookDirectory
      .getFileHandle("nc.json")
      .then((fileHandle) => {
        return fileHandle.createWritable({
          keepExistingData: false,
        });
      })
      .then((writable) => {
        writable.write(JSON.stringify(nConf));
        return writable.close();
      });
  }, [notebookConfig, notebookDirectory]);

  // Effect to autosave notebook config whenever it changes
  useEffect(() => {
    if (notebookConfig !== undefined) {
      saveNotebookConfig().catch((err) => {
        console.debug(
          "Failed to autosave notebook config:",
          err.message,
          err.stack
        );
      });
    }
  }, [notebookConfig]);

  // Saves all currently loaded pages
  const savePages = useCallback(
    (unload: boolean) => {
      if (pagesDirectory === undefined) {
        return Promise.reject("No pages directory set");
      }
      let promises: Promise<any>[] = [];
      pages.forEach((_, key) => {
        promises.push(savePage(key, unload, pagesDirectory));
      });
      return Promise.allSettled(promises);
    },
    [pagesDirectory, pages]
  );

  // Reloads the currently active pages based on the notebook configuration and unloads pages out of Range
  const reloadPages = useCallback(
    (fullReload?: boolean) => {
      if (
        notebookConfig === undefined ||
        currentPage === undefined ||
        pages === undefined
      ) {
        return Promise.reject("Config or current page not set");
      }
      let nbConf = notebookConfig;
      return Promise.all([
        traversePages(true, 2, currentPage),
        traversePages(false, 2, currentPage),
      ]).then((currentActivePagesTuple) => {
        currentActivePagesTuple[0] = currentActivePagesTuple[0].filter(
          (page) => page !== currentPage
        );
        currentActivePagesTuple[1].filter((page) => page !== currentPage);
        const mergedActivePages = [
          ...currentActivePagesTuple[0],
          currentPage,
          ...currentActivePagesTuple[1],
        ];
        let promises: Promise<any>[] = [];
        pages.keys().forEach((key) => {
          if (!mergedActivePages.find((page) => page === key)) {
            promises.push(savePage(key, true));
          }
        });
        return Promise.all(promises).then(() => {
          let newPages = new Map<string, NotesCode.Document>();
          let promises: Promise<any>[] = [];
          mergedActivePages.forEach((page) => {
            if (!pages.has(page) || fullReload) {
              promises.push(
                loadPage(page, pagesDirectory, undefined, fullReload).then(
                  (cont) => {
                    newPages.set(page, cont);
                    return Promise.resolve();
                  }
                )
              );
            }
          });
          return Promise.all(promises).then(() => {
            for (let [key, value] of newPages) {
              let val = pages.get(key);
              if (val === undefined || val.toJSON() === value.toJSON()) {
                pages.set(key, value);
                break;
              }
            }
          });
        });
      });
    },
    [notebookConfig, currentPage, pages]
  );

  // Traverses the linked list of pages in a given direction
  const traversePages = useCallback(
    (forward: boolean, n: number, page: string): Promise<string[]> => {
      if (
        !notebookConfig ||
        n === 0 ||
        notebookConfig === undefined ||
        currentPage === undefined
      ) {
        return Promise.resolve([page]);
      }
      let oldPage = page;
      //@ts-expect-error
      page = forward
        ? notebookConfig.pages.get(page)?.nextPage
        : notebookConfig.pages.get(page)?.prevPage;
      if (page === undefined || page === "") {
        return Promise.resolve([oldPage]);
      }
      return traversePages(forward, n - 1, page).then((rec) => {
        return forward ? [oldPage, ...rec] : [...rec, oldPage];
      });
    },
    [notebookConfig, currentPage, pages]
  );

  // Creates a new notebook with a default page and configuration
  const createNewNotebook = useCallback(
    (name: string, notebookDescription: string) => {
      if (directoryHandle === undefined) {
        return Promise.reject("No directory handle set");
      }
      return directoryHandle
        .getDirectoryHandle(name + ".ncnb")
        .then(() => {
          return Promise.reject("Name already exists");
        })
        .catch(() => {
          let firstPageName = nanoid();
          return directoryHandle
            .getDirectoryHandle(name + ".ncnb", { create: true })
            .then((dirHandle) => {
              dirHandle
                .getFileHandle("nc.json", { create: true })
                .then((fileHandle) => {
                  return fileHandle.createWritable({
                    keepExistingData: false,
                  });
                })
                .then((writable) => {
                  let notebook: {
                    version: string;
                    description: string;
                    lastActivePage: string;
                    pages: Object;
                  } = {
                    version: "0.0.1",
                    description: notebookDescription,
                    lastActivePage: firstPageName,
                    pages: {
                      [firstPageName]: {
                        width: 800,
                        height: 600,
                        background: "default",
                        nextPage: "",
                        prevPage: "",
                      },
                    },
                  };
                  writable.write(JSON.stringify(notebook));
                  return writable.close();
                })
                .then(() => {
                  return dirHandle.getDirectoryHandle("img", { create: true });
                })
                .then(() => {
                  return dirHandle.getDirectoryHandle("files", {
                    create: true,
                  });
                })
                .then(() => {
                  return dirHandle.getDirectoryHandle("pages", {
                    create: true,
                  });
                })
                .then((pagesDirHandle) => {
                  let pageName = firstPageName;
                  return pagesDirHandle.getFileHandle(pageName, {
                    create: true,
                  });
                })
                .then((pageHandle) => {
                  return pageHandle.createWritable({
                    keepExistingData: false,
                  });
                })
                .then((stream) => {
                  let pageContent = NotesCode.Document.encode(
                    new NotesCode.Document()
                  ).finish();
                  stream.write(pageContent);
                  return stream.close();
                })
                .then(() => {
                  updateDirectory();
                  setToLoadNotebook(name);
                  return dirHandle;
                });
            });
        });
    },
    [directoryHandle]
  );

  // Effect to open a notebook when openBookName state changes
  useEffect(() => {
    if (openBookName !== undefined) {
      openBook(openBookName).catch((err) => {
        console.debug("Error opening book:", err.message, err.stack);
      });
      setOpenBookName(undefined);
    }
  }, [openBookName]);

  // Removes a directory or file from the current directory
  const removeDirectory = useCallback(
    (item: string, handle?: FileSystemDirectoryHandle) => {
      if (handle === undefined) {
        handle = directoryHandle;
      }
      if (handle === undefined) {
        return Promise.reject("No handle provided/set");
      }
      return handle
        .removeEntry(item, { recursive: true })
        .then(() => {
          updateDirectory();
          return Promise.resolve();
        })
        .catch((err) => {
          updateDirectory();
          return Promise.reject(err);
        });
    },
    [directoryHandle]
  );

  // Creates a new directory within the current directory
  const createDirectory = useCallback(
    (name: string, handle?: FileSystemDirectoryHandle) => {
      if (handle === undefined) {
        handle = directoryHandle;
      }
      if (handle === undefined) {
        return Promise.reject("No handle provided/set");
      }
      return handle
        .getDirectoryHandle(name, { create: true })
        .then((dirHandle) => {
          updateDirectory();
          return dirHandle;
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    [directoryHandle]
  );

  type PageCreationInsertPosition = "first" | "last" | "before" | "after";
  // Creates a new page and inserts it into the notebook's page list
  const createPage = useCallback(
    (
      handle?: FileSystemDirectoryHandle,
      options?: {
        insert?: PageCreationInsertPosition;
        width?: number;
        height?: number;
        background?: string;
      }
    ) => {
      if (handle === undefined) {
        handle = pagesDirectory;
      }
      if (
        handle === undefined ||
        notebookConfig === undefined ||
        currentPage === undefined
      ) {
        return Promise.reject(
          "No " +
            (handle === undefined ? "handle," : "") +
            (notebookConfig === undefined ? "Notebook config," : "") +
            (currentPage === undefined ? "Active Page," : "") +
            "available"
        );
      }
      
      const defaultOptions = {
        insert: "after" as PageCreationInsertPosition,
        width: 815,
        height: 1152,
        background: "default",
      };

      const finalOptions = { ...defaultOptions, ...options };
      if (isNaN(finalOptions.width)) finalOptions.width = defaultOptions.width;
      if (isNaN(finalOptions.height)) finalOptions.height = defaultOptions.height;

      let id = nanoid();
      return handle
        .getFileHandle(id, { create: true })
        .then((pageHandle) => {
          return pageHandle.createWritable({
            keepExistingData: false,
          });
        })
        .then((stream) => {
          let pageContent = NotesCode.Document.encode(
            new NotesCode.Document()
          ).finish();
          stream.write(pageContent);
          return stream.close();
        })
        .then(() => {
          let newPgs = new Map<
            string,
            {
              width: number;
              height: number;
              background: string;
              nextPage: string;
              prevPage: string;
            }
          >(notebookConfig.pages);
          let newPage = {
            width: finalOptions.width,
            height: finalOptions.height,
            background: finalOptions.background,
            nextPage: "",
            prevPage: "",
          };
          let currPage = newPgs.get(currentPage);
          if (currPage === undefined) {
            return Promise.reject("Current page not found");
          }
          switch (finalOptions.insert) {
            case "first":
              let prevPageConf = newPgs.get(currentPage);
              if (prevPageConf === undefined) {
                return Promise.reject("Current page not found");
              }
              let prevPageID = currentPage;
              while (
                prevPageConf !== undefined &&
                prevPageConf.prevPage !== "" &&
                newPgs.has(prevPageConf.prevPage)
              ) {
                let next = newPgs.get(prevPageConf.prevPage);
                prevPageID = prevPageConf.prevPage;
                prevPageConf = next;
              }
              newPage.nextPage = prevPageID;
              if (prevPageConf === undefined) {
                return Promise.reject("Error inserting page");
              }
              prevPageConf.prevPage = id;
              newPgs.set(id, newPage);
              newPgs.set(prevPageID, prevPageConf);
              break;
            case "last":
              let nextPageConf = newPgs.get(currentPage);
              if (nextPageConf === undefined) {
                return Promise.reject("Current page not found");
              }
              let nextPageID = currentPage;
              while (
                nextPageConf !== undefined &&
                nextPageConf.nextPage !== "" &&
                newPgs.has(nextPageConf.nextPage)
              ) {
                let next = newPgs.get(nextPageConf.nextPage);
                nextPageID = nextPageConf.nextPage;
                nextPageConf = next;
              }
              newPage.prevPage = nextPageID;
              if (nextPageConf === undefined) {
                return Promise.reject("Error inserting page");
              }
              nextPageConf.nextPage = id;
              newPgs.set(id, newPage);
              newPgs.set(nextPageID, nextPageConf);
              break;
            case "before":
              let oldPrevPageID = currPage.prevPage;
              currPage.prevPage = id;
              newPage.nextPage = currentPage;
              if (oldPrevPageID !== "") {
                let prevPage = newPgs.get(oldPrevPageID);
                if (prevPage === undefined) {
                  return Promise.reject("Error inserting page");
                }
                prevPage.nextPage = id;
                newPage.prevPage = oldPrevPageID;
                newPgs.set(oldPrevPageID, prevPage);
              }
              newPgs.set(id, newPage);
              newPgs.set(currentPage, currPage);
              break;
            case "after":
              let oldNextPageID = currPage.nextPage;
              currPage.nextPage = id;
              newPage.prevPage = currentPage;
              if (oldNextPageID !== "") {
                let nextPage = newPgs.get(oldNextPageID);
                if (nextPage === undefined) {
                  return Promise.reject("Error inserting page");
                }
                nextPage.prevPage = id;
                newPage.nextPage = oldNextPageID;
                newPgs.set(oldNextPageID, nextPage);
              }
              newPgs.set(id, newPage);
              newPgs.set(currentPage, currPage);
              break;
          }
          let conf = structuredClone(notebookConfig);
          conf.pages = newPgs;
          setNotebookConfig(conf);
          setToReloadPages(true);
          return Promise.resolve(id);
        });
    },
    [pagesDirectory, notebookConfig, currentPage, pages, setToReloadPages]
  );

  // Deletes a page from the notebook and updates the page linkage
  const deletePage = useCallback(
    (page: string) => {
      if (
        notebookConfig === undefined ||
        pagesDirectory === undefined ||
        currentPage === undefined ||
        pages === undefined
      ) {
        console.debug(notebookConfig, pagesDirectory, currentPage, pages);
        return Promise.reject(
          "Something went wrong deleting the page (Unloaded/Missing)"
        );
      }
      let newConf = structuredClone(notebookConfig.pages);
      let pageConf = notebookConfig.pages.get(page);
      if (pageConf === undefined) {
        return Promise.reject("Page not found");
      }
      if (pageConf.prevPage !== "") {
        let prevPage = notebookConfig.pages.get(pageConf.prevPage);
        if (prevPage === undefined) {
          console.error(
            `Previous page not found '${pageConf.prevPage}' while attempting to delete page '${page}' is the file missing? Please check you index`
          );
        } else {
          prevPage.nextPage = pageConf.nextPage;
          newConf.set(pageConf.prevPage, prevPage);
        }
      }
      if (pageConf.nextPage !== "") {
        let nextPage = notebookConfig.pages.get(pageConf.nextPage);
        if (nextPage === undefined) {
          console.error(
            `Next page not found '${pageConf.nextPage}' while attempting to delete page '${page}' is the file missing? Please check you index`
          );
        } else {
          nextPage.prevPage = pageConf.prevPage;
          newConf.set(pageConf.nextPage, nextPage);
        }
      }
      if (notebookConfig.pages.size === 1) {
        return Promise.resolve();
      }
      let inheriter = currentPage;
      if (inheriter === page) {
        inheriter = pageConf.nextPage;
      }
      if (inheriter === "") {
        inheriter = pageConf.prevPage;
      }
      if (inheriter === "" && notebookConfig.pages.size > 1) {
        inheriter = notebookConfig.pages.keys().next().value || "";
      }
      if (inheriter === "") {
        return Promise.reject("No inheriter found");
      }
      return pagesDirectory.removeEntry(page).then(() => {
        newConf.delete(page);
        setNotebookConfig({
          version: notebookConfig.version,
          description: notebookConfig.description,
          lastActivePage: inheriter,
          pages: newConf,
        });
        setCurrentPage(inheriter);
        currentPageRef.current = inheriter;
        let newPagesState = new Map<string, NotesCode.Document>(pages);
        newPagesState.delete(page);
        setPages(newPagesState);
        return Promise.resolve();
      });
    },
    [notebookConfig, pagesDirectory, currentPage, pages, setToReloadPages]
  );

  // Unloads the current notebook, saving pages and config
  const unloadNotebook = useCallback(() => {
    let promises: Promise<any>[] = [];
    pages.forEach((_, key) => {
      promises.push(savePage(key, true));
    });
    promises.push(saveNotebookConfig().catch((e) => {}));
    return Promise.allSettled(promises).finally(() => {
      setNotebookConfig(undefined);
      setCurrentPage(undefined);
      currentPageRef.current = null;
      setPages(new Map<string, NotesCode.Document>());
      setImageCache(new Map<string, HTMLImageElement>());
      setTextCache(new Map<string, string>());
    });
  }, [pages, saveNotebookConfig, savePage]);

  // Effect to unload the notebook and update the directory when the directory handle changes
  useEffect(() => {
    unloadNotebook();
    updateDirectory();
  }, [directoryHandle]);

  // State to trigger loading a notebook by name
  const [toLoadNotebook, setToLoadNotebook] = useState<string | null>(null);
  useEffect(() => {
    if (toLoadNotebook !== null) {
      openBook(toLoadNotebook).catch((e) => {
        console.error(e.message, e.stack);
      });
      setToLoadNotebook(null);
    }
  }, [toLoadNotebook, openBook]);
  // Effect to reload pages when toReloadPages state is true
  useEffect(() => {
    if (toReloadPages === true && reloadPages !== undefined) {
      reloadPages()
        .then(() => {
          setToReloadPages(false);
        })
        .catch((e) => {
          console.error(e.message, e.stack);
          setToReloadPages(true);
        });
    }
  }, [toReloadPages, reloadPages, notebookConfig]);

  // Gets all page IDs in their correct order
  const getPagesInOrder = useCallback(() => {
    if (notebookConfig === undefined || currentPage === undefined) {
      return Promise.reject("No notebook config or current page set");
    }
    return traversePages(
      false,
      notebookConfig.pages.size,
      notebookConfig.lastActivePage
    ).then((pg) => {
      return traversePages(true, notebookConfig.pages.size + 1, pg[0]);
    });
  }, [notebookConfig, currentPage]);

  // Cache for images
  let [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(
    new Map<string, HTMLImageElement>()
  );
  // Loads an image from the images directory
  const loadImage = useCallback(
    (path: string, imgDirHandle?: FileSystemDirectoryHandle) => {
      if (imgDirHandle === undefined) {
        imgDirHandle = imagesDirectory;
      }
      if (imgDirHandle === undefined) {
        return Promise.reject("No images directory set");
      }
      if (imageCache.has(path)) {
        return Promise.resolve(imageCache.get(path) as HTMLImageElement);
      }
      return imgDirHandle
        .getFileHandle(path)
        .then((imgHandle) => {
          return imgHandle.getFile();
        })
        .then((file) => {
          return new Promise(
            (resolve: (value: HTMLImageElement) => void, reject) => {
              const reader = new FileReader();

              // Handle successful load
              reader.onload = (e) => {
                let img = new Image();
                img.src = reader.result as string;
                setImageCache((oldCache) => {
                  oldCache.set(path, img);
                  return oldCache;
                });
                resolve(img);
              };

              // Handle errors
              reader.onerror = () => {
                reject(reader.error || new Error("File reading failed"));
              };

              // Initiate reading
              reader.readAsDataURL(file);
            }
          );
        });
    },
    [imagesDirectory]
  );

  const importImage = useCallback(
    (image: File, imgDirHandle?: FileSystemDirectoryHandle) => {
      if (imgDirHandle === undefined) {
        imgDirHandle = imagesDirectory;
      }
      if (imgDirHandle === undefined) {
        return Promise.reject("No images directory set");
      }
      let ending = image.name.split(".").pop();
      if (ending === undefined)
        return Promise.reject("Unsupported file type: No file extension");
      let id = nanoid() + "." + ending;
      return new Promise((resolve: (value: ArrayBuffer) => void, reject) => {
        const reader = new FileReader();

        // Handle successful load
        reader.onload = (e) => {
          if (typeof reader.result !== "object")
            reject(
              new Error("Unexpected result type: " + typeof reader.result)
            );
          resolve(reader.result as ArrayBuffer);
        };

        // Handle errors
        reader.onerror = () => {
          reject(reader.error || new Error("File reading failed"));
        };

        // Initiate reading
        reader.readAsArrayBuffer(image);
      }).then((data) => {
        return imgDirHandle
          .getFileHandle(id, { create: true })
          .then((imgHandle) => {
            return imgHandle.createWritable({
              keepExistingData: false,
            });
          })
          .then(async (writable) => {
            await writable.write(data);
            await writable.close();
            return id;
          });
      });
    },
    [imagesDirectory, currentPage]
  );

  let [textCache, setTextCache] = useState<Map<string, string>>(
    new Map<string, string>()
  );
  // Loads a text/code file from the pages directory
  const loadText = useCallback(
    (path: string, txtDirHandle?: FileSystemDirectoryHandle) => {
      if (txtDirHandle === undefined) {
        txtDirHandle = filesDirectory;
      }
      if (txtDirHandle === undefined) {
        return Promise.reject("No files directory set");
      }
      if (textCache.has(path)) {
        return Promise.resolve(textCache.get(path) as string);
      }
      return txtDirHandle
        .getFileHandle(path)
        .then((txtHandle) => {
          return txtHandle.getFile();
        })
        .then((file) => {
          return new Promise((resolve: (value: string) => void, reject) => {
            const reader = new FileReader();

            // Handle successful load
            reader.onload = (e) => {
              let txt = reader.result as string;
              setTextCache((oldCache) => {
                let newCache = structuredClone(oldCache);
                newCache.set(path, txt);
                return newCache;
              });
              resolve(txt);
            };

            // Handle errors
            reader.onerror = () => {
              reject(reader.error || new Error("File reading failed"));
            };

            // Initiate reading
            reader.readAsText(file);
          });
        });
    },
    [filesDirectory]
  );

  // Saves a text/code file to the files directory
  const saveText = useCallback(
    (path: string, txt: string, txtDirHandle?: FileSystemDirectoryHandle) => {
      if (txtDirHandle === undefined) {
        txtDirHandle = filesDirectory;
      }
      if (txtDirHandle === undefined) {
        return Promise.reject("No files directory set");
      }
      return txtDirHandle
        .getFileHandle(path, { create: true })
        .then((txtHandle) => {
          return txtHandle.createWritable({
            keepExistingData: false,
          });
        })
        .then((writable) => {
          writable.write(txt);
          return writable.close();
        });
    },
    [filesDirectory]
  );

  const selectedTool = useRef("pen");
  const currentPageRef = useRef<string | null>(null);
  const pointerDownRef = useRef<boolean>(false);

  const autosaveDuration = 3000; // Maybe user configurable?
  const autosaveCurrentTimeout = useRef<NodeJS.Timeout | null>(null);

  const [redrawAllPages, setRedrawAllPages] = useState(false);
  const [redrawPage, setRedrawPage] = useState<string | null>(null);

  const autosaveStart = useCallback(() => {
    if (autosaveCurrentTimeout.current !== null) {
      clearTimeout(autosaveCurrentTimeout.current);
    }
    autosaveCurrentTimeout.current = setTimeout(() => {
      savePages(false);
      autosaveCurrentTimeout.current = null;
    }, autosaveDuration);
  }, [savePages]);

  // Returns the state variables and functions provided by the hook
  return {
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
    currentPage,
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
    savePages,
    reloadPages,
    setCurrentPage,
    currentPageRef,
    deletePage,
    getPagesInOrder,
    setToReloadPages,
    unloadNotebook,
    showCanvasEditor,
    setShowCanvasEditor,
    strokeColor,
    setStrokeColor,
    erasing,
    setErasing,
    loadImage,
    loadText,
    saveText,
    filesDirectory,
    setPage,
    importImage,
    selectedTool,
    pointerDownRef,
    autosaveStart,
    redrawAllPages,
    setRedrawAllPages,
    redrawPage,
    setRedrawPage,
  };
}
