**`useFilesystem` Custom Hook**

This custom hook is designed to manage interactions with the browser's File System Access API, specifically for an application that deals with "notebooks" stored as directories. It handles directory navigation, reading/writing notebook configuration, managing notebook pages (loading, saving, creating, deleting), and creating new notebooks or directories.

**How to Use `useFilesystem` Hook:**

In your React component:
```javascript
import { useFilesystem } from './path-to-your-hook/useFilesystem'; // Adjust path

function MyNotebookApp() {
  const {
    // State variables
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

    // Functions
    setDirectoryHandle,      // Usually for internal use or specific scenarios
    setTopDirectoryHandle,   // Usually for internal use or specific scenarios
    popDirectory,
    pushDirectory,
    openBook,
    loadPage,
    savePage,
    createNewNotebook,
    removeDirectory,
    createDirectory,
    createPage,
    reloadPages,
    setCurrentPage,
    deletePage,
    getPagesInOrder,
    setToReloadPages,      // Usually for internal use or specific scenarios
  } = useFilesystem();

  // Example: Open directory picker if available
  const handleSelectDirectory = async () => {
    if (directoryPickerAvailable && typeof showDirectoryPicker !== 'undefined') {
      try {
        const handle = await showDirectoryPicker();
        if (handle) {
          setTopDirectoryHandle(handle); // Set the root for browsing
          setDirectoryHandle(handle);    // Set the current directory
        }
      } catch (err) {
        console.error("Error picking directory:", err);
        // Potentially show errorToast
      }
    } else {
      alert("Directory Picker API is not available in your browser or it's an older version.");
    }
  };

  // ... rest of your component logic using the hook's state and functions
}
```

**Dependencies:**

*   `react`: For `useState`, `useCallback`, `useEffect`.
*   `./use-toast`: A custom hook for displaying toast notifications (specifically `errorToast`).
*   `../handwriting`: Contains `NotesCode.Document` for encoding/decoding page content.
*   `nanoid`: For generating unique IDs.
*   Browser environment with support for the File System Access API (experimental `showDirectoryPicker` and `navigator.storage.getDirectory`).

---

**External Helper Function Documentation**

### `isNotebook(handle: FileSystemDirectoryHandle): boolean`

*   **Description:** Checks if a given `FileSystemDirectoryHandle` represents a notebook directory. Notebook directories are identified by having a name that ends with ".ncnb".
*   **Parameters:**
    *   `handle`: `FileSystemDirectoryHandle` - The directory handle to inspect.
*   **Returns:** `boolean` - `true` if the directory name ends with ".ncnb", `false` otherwise.
*   **Usage Example:**
    ```javascript
    // Assuming 'dirHandle' is a FileSystemDirectoryHandle
    if (isNotebook(dirHandle)) {
      console.log(dirHandle.name + " is a notebook.");
    }
    ```

---

**Functions Returned by `useFilesystem` Hook**

### 1. `updateDirectory(handle?: FileSystemDirectoryHandle): Promise<void>`

*   **Description:** Scans the specified directory (or the current `directoryHandle` if none is provided) and updates the `directoryFolders` and `directoryNotebooks` state arrays with the found subdirectories and notebook directories respectively. Entries are sorted alphabetically.
*   **Parameters:**
    *   `handle` (optional): `FileSystemDirectoryHandle` - The directory handle to scan. If undefined, it uses the current `directoryHandle` from the hook's state.
*   **Returns:** `Promise<void>` - A promise that resolves when the directory listing has been updated, or rejects if an error occurs (e.g., the handle is invalid or inaccessible).
*   **Side Effects:**
    *   Updates the `directoryFolders` state.
    *   Updates the `directoryNotebooks` state.
*   **Usage Example:**
    ```javascript
    // To update the current directory listing
    updateDirectory().then(() => {
      console.log("Directory listing updated.");
    }).catch(err => console.error("Failed to update directory:", err));

    // To update a specific directory (e.g., after creating a new one)
    // const newDirHandle = await createDirectory("MyNewFolder");
    // if (newDirHandle) await updateDirectory(newDirHandle);
    ```

### 2. `popDirectory(): void`

*   **Description:** Navigates up one level in the directory history stack. If already at the root of the stack, it remains there.
*   **Parameters:** None.
*   **Returns:** `void`.
*   **Side Effects:**
    *   Updates the `directoryStack` state by removing the last entry (if more than one exists).
    *   Updates the `directoryHandle` state to the new current directory.
*   **Usage Example:**
    ```javascript
    // In a "Go Up" button's onClick handler
    popDirectory();
    ```

### 3. `pushDirectory(name: string): void`

*   **Description:** Navigates into a subdirectory of the current `directoryHandle`.
*   **Parameters:**
    *   `name`: `string` - The name of the subdirectory to enter.
*   **Returns:** `void` (The underlying `getDirectoryHandle` is a Promise, but this function doesn't return it directly; it handles success/error internally).
*   **Side Effects:**
    *   Updates the `directoryStack` state by adding the new directory handle.
    *   Updates the `directoryHandle` state to the new subdirectory handle.
    *   Logs an error to the console if the subdirectory cannot be accessed.
*   **Usage Example:**
    ```javascript
    // When a user clicks on a folder named "MyFolder"
    pushDirectory("MyFolder");
    ```

### 4. `refreshPagesDirectory(notebookDir?: FileSystemDirectoryHandle): Promise<void>`

*   **Description:** Attempts to get a handle for the "pages" subdirectory within the given notebook directory (or the current `notebookDirectory` state).
*   **Parameters:**
    *   `notebookDir` (optional): `FileSystemDirectoryHandle` - The main directory handle of the notebook. Defaults to the current `notebookDirectory` state.
*   **Returns:** `Promise<void>` - A promise that resolves when the `pagesDirectory` state is successfully set, or rejects if the notebook directory is not set or the "pages" directory cannot be accessed.
*   **Side Effects:**
    *   Updates the `pagesDirectory` state.
*   **Usage Example:**
    ```javascript
    // Usually called internally when a notebook is opened
    // but can be used if you have a notebook handle
    // refreshPagesDirectory(someNotebookHandle).catch(err => console.error(err));
    ```

### 5. `refreshImagesDirectory(notebookDir?: FileSystemDirectoryHandle): Promise<void>`

*   **Description:** Attempts to get a handle for the "img" subdirectory within the given notebook directory (or the current `notebookDirectory` state). If the "img" directory doesn't exist, it will be created.
*   **Parameters:**
    *   `notebookDir` (optional): `FileSystemDirectoryHandle` - The main directory handle of the notebook. Defaults to the current `notebookDirectory` state.
*   **Returns:** `Promise<void>` - A promise that resolves when the `imagesDirectory` state is successfully set, or rejects if the notebook directory is not set or the "img" directory cannot be accessed/created.
*   **Side Effects:**
    *   Updates the `imagesDirectory` state.
    *   May create an "img" directory if it doesn't exist.
*   **Usage Example:**
    ```javascript
    // Usually called internally when a notebook is opened
    // refreshImagesDirectory(someNotebookHandle).catch(err => console.error(err));
    ```

### 6. `openBook(notebookName: string): Promise<void>`

*   **Description:** Opens a notebook. This involves getting the directory handle for the notebook (e.g., "MyNotes.ncnb"), setting it as the `notebookDirectory`, which then triggers an effect to load its configuration (`nc.json`) and its last active page.
*   **Parameters:**
    *   `notebookName`: `string` - The name of the notebook (e.g., "MyNotes", without the ".ncnb" extension).
*   **Returns:** `Promise<void>` - A promise that resolves once the `notebookDirectory` state is set, or rejects if the current `directoryHandle` is not set or the notebook directory cannot be accessed.
*   **Side Effects:**
    *   Calls `unloadNotebook()` to save and clear any previously opened notebook.
    *   Sets the `notebookDirectory` state. This, in turn, triggers effects to:
        *   Load `nc.json` and set `notebookConfig`.
        *   Load the `lastActivePage` and set `currentPage`.
        *   Refresh `pagesDirectory` and `imagesDirectory`.
*   **Usage Example:**
    ```javascript
    // When a user clicks on a notebook named "ProjectX"
    openBook("ProjectX")
      .then(() => console.log("Notebook opened successfully"))
      .catch(err => errorToast({ title: "Error Opening Notebook", description: err.message }));
    ```

### 7. `loadPage(page: string, pageDirHandle?: FileSystemDirectoryHandle, customPages?: Map<string, NotesCode.Document>, fullReload?: boolean): Promise<NotesCode.Document>`

*   **Description:** Loads the content of a specific page file from the filesystem. If the page is already in the `pages` state map and `fullReload` is not true, it returns the cached version. Otherwise, it reads the file, decodes it, and (optionally) updates the `pages` state.
*   **Parameters:**
    *   `page`: `string` - The unique ID (filename) of the page to load.
    *   `pageDirHandle` (optional): `FileSystemDirectoryHandle` - The directory handle where page files are stored. Defaults to the `pagesDirectory` state.
    *   `customPages` (optional): `Map<string, NotesCode.Document>` - If provided, this map is used for caching instead of the hook's internal `pages` state. This is useful for operations that need to work on a temporary set of pages.
    *   `fullReload` (optional): `boolean` - If `true`, forces the page to be re-read from the disk even if it's already in the cache. Defaults to `false`.
*   **Returns:** `Promise<NotesCode.Document>` - A promise that resolves with the decoded page content (`NotesCode.Document` instance), or rejects if an error occurs (e.g., directory not set, file not found, read error).
*   **Side Effects:**
    *   If `customPages` is not provided and `fullReload` is false (or the page wasn't cached), it updates the `pages` state with the loaded page.
*   **Usage Example:**
    ```javascript
    // Load a page with ID "page123"
    loadPage("page123")
      .then(pageContent => {
        // Use pageContent
      })
      .catch(err => console.error("Failed to load page:", err));

    // Force reload a page
    loadPage("page123", undefined, undefined, true)
      .then(pageContent => {
        // Use fresh pageContent
      });
    ```

### 8. `savePage(page: string, unload?: boolean, dir?: FileSystemDirectoryHandle): Promise<Map<string, NotesCode.Document>>`

*   **Description:** Saves the content of a specific page (from the `pages` state map) to its corresponding file in the filesystem.
*   **Parameters:**
    *   `page`: `string` - The unique ID (filename) of the page to save.
    *   `unload` (optional): `boolean` - If `true`, the page will be removed from the `pages` state map after successfully saving. Defaults to `false`.
    *   `dir` (optional): `FileSystemDirectoryHandle` - The directory handle where the page file should be saved. Defaults to the `pagesDirectory` state.
*   **Returns:** `Promise<Map<string, NotesCode.Document>>` - A promise that resolves with the (potentially modified if `unload` is true) `pages` state map, or rejects if an error occurs (e.g., directory not set, page not found in state, write error).
*   **Side Effects:**
    *   Writes the encoded page content to a file.
    *   If `unload` is `true`, removes the page from the `pages` state.
*   **Usage Example:**
    ```javascript
    // Save page "page123"
    // Assuming its content is already in the 'pages' state managed by the hook
    savePage("page123")
      .then(() => console.log("Page saved."))
      .catch(err => console.error("Failed to save page:", err));

    // Save and unload page "page123"
    savePage("page123", true)
      .then(updatedPagesMap => {
        // 'pages' state in the hook is now updated (page123 removed)
      });
    ```

### 9. `saveNotebookConfig(): Promise<void>`

*   **Description:** Saves the current `notebookConfig` state to the "nc.json" file within the `notebookDirectory`.
*   **Parameters:** None.
*   **Returns:** `Promise<void>` - A promise that resolves on successful save, or rejects if `notebookConfig` or `notebookDirectory` is not set, or a write error occurs.
*   **Side Effects:**
    *   Writes the JSON stringified `notebookConfig` to "nc.json".
*   **Usage Example:**
    ```javascript
    // Usually called automatically by an effect when notebookConfig changes,
    // but can be called manually if needed.
    saveNotebookConfig()
      .then(() => console.log("Notebook config saved."))
      .catch(err => console.error("Failed to save notebook config:", err));
    ```
    *Note: This function is also triggered automatically by an `useEffect` hook when `notebookConfig` changes.*

### 10. `savePages(unload: boolean): Promise<any[]>`

*   **Description:** Iterates through all pages currently in the `pages` state map and saves each one using the `savePage` function.
*   **Parameters:**
    *   `unload`: `boolean` - Passed directly to each `savePage` call. If `true`, each page will be unloaded from the `pages` state after being saved.
*   **Returns:** `Promise<any[]>` - A promise that resolves with an array of results from all the `savePage` promises when all pages have been processed.
*   **Side Effects:**
    *   Calls `savePage` for each page in the `pages` state.
    *   May modify the `pages` state if `unload` is true.
*   **Usage Example:**
    ```javascript
    // Save all currently loaded pages
    savePages(false) // false: keep them in memory
      .then(() => console.log("All loaded pages saved."))
      .catch(err => console.error("Error saving some pages:", err));

    // Save and unload all loaded pages (e.g., before closing a notebook)
    savePages(true)
      .then(() => console.log("All loaded pages saved and unloaded."));
    ```

### 11. `reloadPages(fullReload?: boolean): Promise<void>`

*   **Description:** This complex function manages which pages are kept in memory. It determines a "window" of active pages around the `currentPage` (e.g., 2 pages before and 2 after). Pages outside this window that are currently loaded are saved and unloaded. Pages within this window that are not loaded (or if `fullReload` is true) are loaded from disk.
*   **Parameters:**
    *   `fullReload` (optional): `boolean` - If `true`, pages within the active window will be re-loaded from disk even if already in memory. Defaults to `false`.
*   **Returns:** `Promise<void>` - A promise that resolves when all necessary saving, unloading, and loading operations are complete. Rejects if `notebookConfig` or `currentPage` is not set.
*   **Side Effects:**
    *   Calls `savePage` (with `unload=true`) for pages that are no longer in the active window.
    *   Calls `loadPage` for pages in the active window that need to be loaded/reloaded.
    *   Modifies the `pages` state.
*   **Usage Example:**
    ```javascript
    // Usually triggered by setToReloadPages(true)
    // Manually:
    reloadPages()
      .then(() => console.log("Pages reloaded/managed."))
      .catch(err => console.error("Failed to reload pages:", err));
    ```
    *Note: This function is also triggered automatically by an `useEffect` hook when `toReloadPages` state is set to `true`.*

### 12. `traversePages(forward: boolean, n: number, page: string): Promise<string[]>`

*   **Description:** Traverses the linked list of pages defined in `notebookConfig.pages` starting from a given `page`. It moves `n` steps in the specified direction (`forward` or backward).
*   **Parameters:**
    *   `forward`: `boolean` - `true` to traverse towards `nextPage`, `false` to traverse towards `prevPage`.
    *   `n`: `number` - The maximum number of pages to traverse.
    *   `page`: `string` - The ID of the starting page.
*   **Returns:** `Promise<string[]>` - A promise that resolves with an array of page IDs encountered during traversal (including the starting page). The order in the array reflects the traversal direction. Resolves with just the starting page if `notebookConfig` is not set, `n` is 0, or the end of the list is reached.
*   **Usage Example:**
    ```javascript
    // Get the current page and the next 2 pages
    if (currentPage && notebookConfig) {
      traversePages(true, 3, currentPage) // 3 because it includes current + 2 next
        .then(pageIds => console.log("Next pages:", pageIds));
    }
    ```

### 13. `createNewNotebook(name: string, notebookDescription: string): Promise<FileSystemDirectoryHandle | undefined>`

*   **Description:** Creates a new notebook. This involves:
    1.  Checking if a directory with the name `name.ncnb` already exists (rejects if it does).
    2.  Creating the `name.ncnb` directory.
    3.  Creating an `nc.json` configuration file with a default first page.
    4.  Creating "img" and "pages" subdirectories.
    5.  Creating an initial empty page file.
    6.  Updating the directory listing.
    7.  Setting state to trigger opening this newly created notebook.
*   **Parameters:**
    *   `name`: `string` - The desired name for the notebook (e.g., "My New Book"). The ".ncnb" extension will be appended.
    *   `notebookDescription`: `string` - A description for the notebook.
*   **Returns:** `Promise<FileSystemDirectoryHandle | undefined>` - A promise that resolves with the `FileSystemDirectoryHandle` of the newly created notebook's root directory. It might resolve to `undefined` in some error paths within its promise chain, or reject if the `directoryHandle` is not set or the name already exists.
*   **Side Effects:**
    *   Creates multiple files and directories on the user's filesystem.
    *   Calls `updateDirectory()`.
    *   Sets `toLoadNotebook` state, which triggers `openBook` for the new notebook.
*   **Usage Example:**
    ```javascript
    createNewNotebook("Vacation Plans", "Notebook for planning my next vacation")
      .then(notebookHandle => {
        if (notebookHandle) {
          console.log("Notebook created:", notebookHandle.name);
          // The hook will automatically try to open it.
        } else {
          console.log("Notebook creation might have had an issue or name conflict.");
        }
      })
      .catch(err => errorToast({ title: "Creation Failed", description: err.message }));
    ```

### 14. `removeDirectory(item: string, handle?: FileSystemDirectoryHandle): Promise<void>`

*   **Description:** Removes a specified file or directory (recursively for directories) from the filesystem.
*   **Parameters:**
    *   `item`: `string` - The name of the file or directory to remove.
    *   `handle` (optional): `FileSystemDirectoryHandle` - The parent directory handle from which to remove the item. Defaults to the current `directoryHandle` state.
*   **Returns:** `Promise<void>` - A promise that resolves on successful removal or rejects if an error occurs (e.g., handle not set, item not found, permission issues).
*   **Side Effects:**
    *   Deletes files/directories from the user's filesystem.
    *   Calls `updateDirectory()` to refresh the listing.
*   **Usage Example:**
    ```javascript
    // Remove a folder named "OldStuff" from the current directory
    removeDirectory("OldStuff")
      .then(() => console.log("Folder removed."))
      .catch(err => errorToast({ title: "Deletion Failed", description: err.message }));

    // Remove a notebook (which is a directory)
    removeDirectory("MyOldNotebook.ncnb")
      .then(() => console.log("Notebook removed."))
      .catch(err => errorToast({ title: "Deletion Failed", description: err.message }));
    ```

### 15. `createDirectory(name: string, handle?: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle | undefined>`

*   **Description:** Creates a new subdirectory within a specified directory.
*   **Parameters:**
    *   `name`: `string` - The name for the new directory.
    *   `handle` (optional): `FileSystemDirectoryHandle` - The parent directory handle where the new directory should be created. Defaults to the current `directoryHandle` state.
*   **Returns:** `Promise<FileSystemDirectoryHandle | undefined>` - A promise that resolves with the `FileSystemDirectoryHandle` of the newly created directory. It might resolve to `undefined` on some internal errors or reject if the handle is not set or the directory cannot be created (e.g., name conflict, permissions).
*   **Side Effects:**
    *   Creates a directory on the user's filesystem.
    *   Calls `updateDirectory()` to refresh the listing.
*   **Usage Example:**
    ```javascript
    createDirectory("MyNewFolder")
      .then(newDirHandle => {
        if (newDirHandle) {
          console.log("Directory created:", newDirHandle.name);
        }
      })
      .catch(err => errorToast({ title: "Creation Failed", description: err.message }));
    ```

### 16. `createPage(handle?: FileSystemDirectoryHandle, options?: { insert?: PageCreationInsertPosition; width?: number; height?: number; background?: string; }): Promise<string | undefined>`

*   **Description:** Creates a new page within the currently open notebook. This involves:
    1.  Creating a new page file with a unique ID in the `pagesDirectory`.
    2.  Updating the `notebookConfig.pages` map to include the new page, linking it correctly based on the `insert` option relative to the `currentPage`.
*   **Parameters:**
    *   `handle` (optional): `FileSystemDirectoryHandle` - The directory handle for "pages". Defaults to the `pagesDirectory` state.
    *   `options` (optional): An object to configure the new page:
        *   `insert` (optional): `PageCreationInsertPosition` (`"first" | "last" | "before" | "after"`) - Where to insert the new page relative to the `currentPage`. Defaults to `"after"`.
        *   `width` (optional): `number` - Width of the new page. Defaults to 800.
        *   `height` (optional): `number` - Height of the new page. Defaults to 600.
        *   `background` (optional): `string` - Background style/identifier for the new page. Defaults to `"default"`.
*   **Returns:** `Promise<string | undefined>` - A promise that resolves with the unique ID (filename) of the newly created page. It might resolve to `undefined` on internal errors, or reject if essential context (like `pagesDirectory`, `notebookConfig`, or `currentPage`) is missing, or if file creation fails.
*   **Side Effects:**
    *   Creates a new page file.
    *   Updates the `notebookConfig` state with the new page information and linkages.
    *   Sets `toReloadPages` to `true`, which will trigger `reloadPages` to manage loaded pages.
*   **Usage Example:**
    ```javascript
    // Create a new page after the current page
    createPage(undefined, { insert: "after", width: 1024, height: 768, background: "grid" })
      .then(newPageId => {
        if (newPageId) {
          console.log("New page created with ID:", newPageId);
          // The hook will automatically reload pages, and you might want to setCurrentPage(newPageId).
        }
      })
      .catch(err => errorToast({ title: "Page Creation Failed", description: err.message }));
    ```

### 17. `setCurrentPage(pageId: string | undefined): void`

*   **Description:** Sets the `currentPage` state to the provided `pageId`. This typically triggers effects to load the new page if not already loaded and update the `notebookConfig.lastActivePage`.
*   **Parameters:**
    *   `pageId`: `string | undefined` - The ID of the page to set as current, or `undefined` to clear the current page.
*   **Returns:** `void`.
*   **Side Effects:**
    *   Updates the `currentPage` state.
    *   If `currentPage` is set and `notebookConfig` exists, updates `notebookConfig.lastActivePage`.
    *   Sets `toReloadPages` to `true`.
*   **Usage Example:**
    ```javascript
    // Navigate to page "pageId123"
    setCurrentPage("pageId123");
    ```

### 18. `deletePage(page: string): Promise<void>`

*   **Description:** Deletes a page from the notebook. This involves:
    1.  Updating the `notebookConfig.pages` map to remove the specified page and re-link its previous and next pages.
    2.  Determining a new `currentPage` (e.g., the next page, previous page, or another existing page).
    3.  Deleting the page file from the `pagesDirectory`.
    4.  Updating `notebookConfig` state with the new linkages and `lastActivePage`.
    5.  Updating `currentPage` state.
    6.  Removing the page from the in-memory `pages` state map.
*   **Parameters:**
    *   `page`: `string` - The unique ID (filename) of the page to delete.
*   **Returns:** `Promise<void>` - A promise that resolves on successful deletion, or rejects if essential context is missing, the page is not found, or a file system error occurs.
*   **Side Effects:**
    *   Deletes a page file.
    *   Updates `notebookConfig` state.
    *   Updates `currentPage` state.
    *   Updates `pages` state.
*   **Usage Example:**
    ```javascript
    // Delete the current page
    if (currentPage) {
      deletePage(currentPage)
        .then(() => console.log("Page deleted successfully."))
        .catch(err => errorToast({ title: "Deletion Failed", description: err.message }));
    }
    ```

### 19. `getPagesInOrder(): Promise<string[]>`

*   **Description:** Retrieves an array of all page IDs in the current notebook, sorted according to their `prevPage` and `nextPage` links in the `notebookConfig`. It starts from the `lastActivePage`, traverses to the beginning, and then traverses from that first page to the end.
*   **Parameters:** None.
*   **Returns:** `Promise<string[]>` - A promise that resolves with an array of page IDs in their sequential order. Rejects if `notebookConfig` or `currentPage` (used to find `lastActivePage`) is not set.
*   **Side Effects:** None directly, but relies on `traversePages`.
*   **Usage Example:**
    ```javascript
    getPagesInOrder()
      .then(orderedPageIds => {
        console.log("All pages in order:", orderedPageIds);
        // Useful for generating a table of contents or navigation.
      })
      .catch(err => console.error("Could not get pages in order:", err));
    ```

### 20. `unloadNotebook(): Promise<void>`

*   **Description:** Properly closes the currently open notebook. This involves:
    1.  Saving all modified pages currently in the `pages` state map (and unloading them from memory).
    2.  Saving the `notebookConfig`.
    3.  Clearing all notebook-specific state (`notebookConfig`, `currentPage`, `pages`).
*   **Parameters:** None.
*   **Returns:** `Promise<void>` - A promise that resolves once all saving and clearing operations are complete. It uses `Promise.allSettled` for saving operations, so it will resolve even if some individual saves fail (errors would be caught and logged by `savePage`/`saveNotebookConfig`).
*   **Side Effects:**
    *   Calls `savePage` for all loaded pages.
    *   Calls `saveNotebookConfig`.
    *   Resets `notebookConfig`, `currentPage`, and `pages` states to their initial/empty values.
*   **Usage Example:**
    ```javascript
    // Before opening a new notebook or closing the application view
    unloadNotebook()
      .then(() => console.log("Notebook unloaded."));
    ```
    *Note: This function is also called internally by `openBook` and by an `useEffect` when `directoryHandle` changes.*

### State Setters (Less Commonly Used Directly)

The hook also returns some state setter functions. While available, they are often managed internally by other functions within the hook. Direct use should be for specific, advanced scenarios or when integrating with external triggers.

*   **`setDirectoryHandle(handle: FileSystemDirectoryHandle | undefined): void`**
    *   Sets the current directory handle. Triggers `unloadNotebook` and `updateDirectory`.
*   **`setTopDirectoryHandle(handle: FileSystemDirectoryHandle | undefined): void`**
    *   Sets the top-level directory handle (e.g., the one chosen by `showDirectoryPicker`).
*   **`setToReloadPages(reload: boolean): void`**
    *   Sets a flag that, when `true`, triggers the `reloadPages` function via an effect. This is the preferred way to initiate a page reload/management cycle.
