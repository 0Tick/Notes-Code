import { useState, useCallback, useEffect } from "react";
import { errorToast } from "./use-toast";
import { NotesCode } from "../handwriting";
import { nanoid } from "nanoid";
import path from "path";

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

  // Effect to check for directory picker availability on mount
  useEffect(() => {
    setDirectoryPickerAvailable(showDirectoryPicker !== undefined);
  }, []);

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

  // Effect to update folders and notebooks when the directory handle changes
  useEffect(() => {
    updateDirectory();
    setNotebookDirectory(undefined);
  }, [directoryHandle]);

  // Updates the folders and notebooks in the current directory
  const updateDirectory = useCallback(() => {
    if (directoryHandle === undefined) {
      setDirectoryFolders([]);
      setDirectoryNotebooks([]);
      return;
    }
    let directoryEntries: {
      name: string;
      handle: FileSystemDirectoryHandle;
    }[] = [];
    let notebookEntries: { name: string; handle: FileSystemDirectoryHandle }[] =
      [];
    let getEntries = async () => {
      for await (const [
        key,
        value,
        //@ts-expect-error 2339
      ] of directoryHandle.entries() as Iterable<
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
    getEntries()
      .then(() => {
        directoryEntries.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
        notebookEntries.sort((a, b) =>
          a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1
        );
        setDirectoryFolders(directoryEntries);
        setDirectoryNotebooks(notebookEntries);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [directoryHandle]);

  // State for the stack of directory handles for navigation history
  const [directoryStack, setDirectoryStack] = useState<
    FileSystemDirectoryHandle[]
  >([]);

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
          console.log(err);
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
        errorToast({
          title: "Error finding Pages Directory",
          description:
            "Something went wrong finding the Pages Directory. Does it not exist?.",
        });
        return;
      }
      dir
        .getDirectoryHandle("pages")
        .then((handle) => {
          setPagesDirectory(handle);
        })
        .catch((err) => {
          errorToast({
            title: "Error finding Pages Directory",
            description:
              "Something went wrong finding the Pages Directory. Does it not exist?. Check the Console for details.",
          });
          console.log(err);
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
        errorToast({
          title: "Error getting Image Directory",
          description:
            "Something went wrong finding the Image Directory. Does it not exist?.",
        });
        return;
      }
      dir
        .getDirectoryHandle("img", { create: true })
        .then((handle) => {
          setImagesDirectory(handle);
        })
        .catch((err) => {
          errorToast({
            title: "Error loading Image Directory",
            description:
              "Something went wrong creating the ImageDirectory. Check the Console for details.",
          });
          console.log(err);
        });
    },
    [notebookDirectory]
  );

  // Effect to update image and pages directory handles when the notebook directory changes
  useEffect(() => {
    setPages(new Map<string, NotesCode.Document>());
    if (notebookDirectory === undefined) {
      setImagesDirectory(undefined);
      setPagesDirectory(undefined);
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
            setNotebookConfig(notebook);
            let handle = pagesDirectory;
            notebookDirectory
              .getDirectoryHandle("pages")
              .then((pagesDirHandle) => {
                loadPage(notebook.lastActivePage, pagesDirHandle);
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
        console.log(err);
      });
    refreshImagesDirectory(notebookDirectory);
    refreshPagesDirectory(notebookDirectory);
  }, [notebookDirectory]);

  // Opens a notebook by name and sets the notebook directory handle
  const openBook = useCallback(
    (notebookName: string) => {
      if (directoryHandle === undefined) {
        return;
      }
      directoryHandle
        .getDirectoryHandle(notebookName + ".ncnb")
        .then((dirHandle) => {
          setNotebookDirectory(dirHandle);
        });
    },
    [directoryHandle]
  );

  // State for the currently loaded pages of the notebook
  const [pages, setPages] = useState<Map<string, NotesCode.Document>>(
    new Map<string, NotesCode.Document>()
  );

  // Loads a specific page from the pages directory
  const loadPage = useCallback(
    (page: string, pageDirHandle?: FileSystemDirectoryHandle) => {
      let handle = pageDirHandle;
      if (handle === undefined) {
        handle = pagesDirectory;
      }
      if (handle === undefined) {
        errorToast({
          title: "Error loading Page",
          description:
            "Something went wrong finding the Page Directory. Does it not exist?. Check the Console for details.",
        });
        return;
      }
      if (pages.has(page)) {
        return;
      }
      handle
        .getFileHandle(page)
        .then((pageHandle) => {
          return pageHandle.getFile();
        })
        .then((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (reader.result !== null) {
              let pageContent = NotesCode.Document.decode(
                new Uint8Array(Buffer.from(reader.result.toString(), "base64"))
              );
              let newPages = new Map<string, NotesCode.Document>(pages);
              newPages.set(page, pageContent);
              setPages(newPages);
              console.debug("Successfully loaded page " + page);
            } else {
              errorToast({
                title: `Something went wrong reading page ${page}.`,
                description:
                  "Either the file is corrupted/empty or the Page is not a valid Page File. If this problem persists, please manually remove the faulty Page from the Notebook.",
              });
            }
          };
          reader.readAsText(file);
        })
        .catch((err) => {
          errorToast({
            title: "Error loading Page",
            description: `Something went wrong reading page "${page}". Does it not exist?. Check the Console for details. If this problem persists, please manually remove the faulty Page from the Notebook.`,
          });
          console.log(err);
        });
    },
    [pagesDirectory, pages]
  );

  // Saves the content of a specific page to the pages directory
  const savePage = useCallback(
    (page: string, unload?: boolean) => {
      if (pagesDirectory === undefined) {
        errorToast({
          title: "Error saving Page",
          description:
            "Something went wrong finding the Page Directory. Does it not exist?.",
        });
        return;
      }
      pagesDirectory
        .getFileHandle(page)
        .then((pageHandle) => {
          return pageHandle.createWritable({
            keepExistingData: false,
            //@ts-expect-error
            mode: "exclusive",
          });
        })
        .then((writable) => {
          let doc = pages.get(page);
          if (doc === undefined) {
            errorToast({
              title: "Error saving Page",
              description: "The page was already unloaded. Unable to save",
            });
            return;
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
            setPages(newPages);
          }
        })
        .catch((err) => {
          errorToast({
            title: "Error saving Page",
            description:
              "Something went wrong writing to the Page file. Check the Console for details.",
          });
          console.log(err);
        });
    },
    [pagesDirectory, pages]
  );

  const saveNotebookConfig = useCallback(() => {
    if (notebookConfig === undefined) {
      return;
    }
    let nConf = notebookConfig;
    //@ts-expect-error
    nConf.pages = Object.fromEntries(notebookConfig.pages);
    notebookDirectory
      ?.getFileHandle("nc.json")
      .then((fileHandle) => {
        return fileHandle.createWritable({
          keepExistingData: false,
          //@ts-expect-error
          mode: "exclusive",
        });
      })
      .then((writable) => {
        writable.write(JSON.stringify(nConf));
        return writable.close();
      });
  }, [notebookConfig, notebookDirectory]);

  const createNewNotebook = useCallback(
    (name: string, notebookDescription: string) => {
      directoryHandle
        ?.getDirectoryHandle(name + ".ncnb")
        .then(() => {
          errorToast({
            title: "Error creating Notebook",
            description:
              "This name already exists! Please try a different one.",
          });
        })
        .catch(() => {
          let firstPageName = nanoid();
          directoryHandle
            .getDirectoryHandle(name + ".ncnb", { create: true })
            .then((dirHandle) => {
              dirHandle
                .getFileHandle("nc.json", { create: true })
                .then((fileHandle) => {
                  return fileHandle.createWritable({
                    keepExistingData: false,
                    //@ts-expect-error
                    mode: "exclusive",
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
                  let pageContent = Buffer.from(
                    NotesCode.Document.encode(new NotesCode.Document()).finish()
                  );
                  pagesDirHandle
                    .getFileHandle(pageName, { create: true })
                    .then((pageHandle) => {
                      pageHandle
                        .createWritable({
                          keepExistingData: false,
                          //@ts-expect-error
                          mode: "exclusive",
                        })
                        .then((stream) => {
                          stream.write(pageContent.toString("base64"));
                          stream.close();
                        });
                    });
                })
                .then(() => {
                  setNotebookDirectory(dirHandle);
                  updateDirectory();
                });
            });
        });
    },
    [directoryHandle]
  );

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
    setDirectoryHandle,
    setTopDirectoryHandle,
    popDirectory,
    pushDirectory,
    openBook,
    loadPage,
    savePage,
    createNewNotebook,
  };
}
