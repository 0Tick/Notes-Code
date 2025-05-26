import { useState, useCallback, useEffect } from "react";
import { errorToast } from "./use-toast";
import { NotesCode } from "../handwriting";
import { nanoid } from "nanoid";

// Declaration for the experimental showDirectoryPicker API
declare const showDirectoryPicker: (
  options?: any
) => Promise<FileSystemDirectoryHandle | undefined>;

// Checks if a given FileSystemDirectoryHandle represents a notebook directory
function isNotebook(handle: FileSystemDirectoryHandle): boolean {
  return handle.name.endsWith(".ncnb");
}

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
  }, []);

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
    notebookDirectory
      .getFileHandle("nc.json")
      .then((fileHandle) => {
        return fileHandle.getFile();
      })
      .then((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
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
            notebookDirectory
              .getDirectoryHandle("pages")
              .then((pagesDirHandle) => {
                return loadPage(notebook.lastActivePage, pagesDirHandle);
              })
              .then((cont) => {
                newPages.set(notebook.lastActivePage, cont);
                setNotebookConfig(notebook);
                return setCurrentPage(notebook.lastActivePage);
              })
              .catch((err) => {
                errorToast({
                  title: "Error loading page",
                  description:
                    "Something went wrong loading the last active page. Check the Console for details.",
                });
                console.debug(err.message, err.stack);
              });
          } else {
            errorToast({
              title: "Error loading notebook",
              description:
                "Something went wrong reading the Notebook. Either the file is corrupted/empty or the Notebook is not a valid Notebook.",
            });
          }
        };
        reader.readAsText(file);
      })
      .catch((err) => {
        errorToast({
          title: "Error loading notebook",
          description:
            "Something went wrong reading the Notebook. Is the Index file missing? Check console for more details.",
        });
        console.debug(err.message, err.stack);
      });
    refreshImagesDirectory(notebookDirectory).catch((err) => {
      console.error("Error refreshing images directory:", err);
    });
    refreshPagesDirectory(notebookDirectory).catch((err) => {
      console.error("Error refreshing pages directory:", err);
    });
  }, [notebookDirectory]);

  // Opens a notebook by name and sets the notebook directory handle
  const openBook = useCallback(
    (notebookName: string) => {
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

  // Loads a specific page from the pages directory
  const loadPage = useCallback(
    (
      page: string,
      pageDirHandle?: FileSystemDirectoryHandle,
      customPages?: Map<string, NotesCode.Document>,
      fullReload?: boolean
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
      return handle
        .getFileHandle(page)
        .then((pageHandle) => {
          return pageHandle.getFile();
        })
        .then((file) => {
          return new Promise((resolve: (value: string) => void, reject) => {
            const reader = new FileReader();

            // Handle successful load
            reader.onload = (e) => {
              if (typeof reader.result === "string") {
                resolve(reader.result);
              } else {
                reject(new Error("Unexpected result type"));
              }
            };

            // Handle errors
            reader.onerror = () => {
              reject(reader.error || new Error("File reading failed"));
            };

            // Initiate reading
            reader.readAsText(file);
          });
        })
        .then((result) => {
          let pageContent = NotesCode.Document.decode(
            new Uint8Array(Buffer.from(result, "base64"))
          );
          if (updatePages) {
            let newPages = new Map<string, NotesCode.Document>(customPages);
            newPages.set(page, pageContent);
            setPages(newPages);
          }
          return Promise.resolve(pageContent);
        });
    },
    [pagesDirectory, pages]
  );

  // Saves the content of a specific page to the pages directory
  const savePage = useCallback(
    (page: string, unload?: boolean, dir?: FileSystemDirectoryHandle) => {
      if (dir === undefined) {
        dir = pagesDirectory;
      }
      if (dir === undefined) {
        return Promise.reject("No pages directory set");
      }
      return dir
        .getFileHandle(page)
        .then((pageHandle) => {
          return pageHandle.createWritable({
            keepExistingData: false,
          });
        })
        .then((writable) => {
          let doc = pages.get(page);
          if (doc === undefined) {
            return Promise.reject(`Page '${page}' not found`);
          }
          let pageContent = Buffer.from(
            NotesCode.Document.encode(doc).finish()
          );
          writable.write(pageContent.toString("base64"));
          return writable.close();
        })
        .then(() => {
          if (unload) {
            let newPages = new Map<string, NotesCode.Document>(pages);
            newPages.delete(page);
            return Promise.resolve(newPages);
          }
          return Promise.resolve(pages);
        });
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
      return Promise.all(promises);
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
                  let pageContent = Buffer.from(
                    NotesCode.Document.encode(new NotesCode.Document()).finish()
                  );
                  stream.write(pageContent.toString("base64"));
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
      if (options === undefined) {
        options = {
          insert: "after",
          width: 800,
          height: 600,
          background: "default",
        };
      }
      let insert = options.insert || "after";
      let id = nanoid();
      return handle
        .getFileHandle(id, { create: true })
        .then((pageHandle) => {
          return pageHandle.createWritable({
            keepExistingData: false,
          });
        })
        .then((stream) => {
          let pageContent = Buffer.from(
            NotesCode.Document.encode(new NotesCode.Document()).finish()
          );
          stream.write(pageContent.toString("base64"));
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
            width: options.width || 600,
            height: options.height || 800,
            background: options.background || "default",
            nextPage: "",
            prevPage: "",
          };
          let currPage = newPgs.get(currentPage);
          if (currPage === undefined) {
            return Promise.reject("Current page not found");
          }
          switch (options.insert) {
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
      setPages(new Map<string, NotesCode.Document>());
    });
  }, [
    pages,
    saveNotebookConfig,
    savePage,
    setNotebookConfig,
    setCurrentPage,
    setPages,
  ]);

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
    createPage,
    savePages,
    reloadPages,
    setCurrentPage,
    deletePage,
    getPagesInOrder,
    setToReloadPages,
  };
}
