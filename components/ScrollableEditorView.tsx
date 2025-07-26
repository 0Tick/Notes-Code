import React, {
  FC,
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  RefObject,
  useCallback,
} from "react";
import { NotesCode } from "@/handwriting";
import { useFilesystemContext } from "@/components/filesystem-provider";
import { Action, ActionStack } from "./ActionStack";
import {
  Eraser,
  Home,
  Pen,
  PenTool,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PopoverPicker } from "./popOverPicker";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Slider } from "./ui/slider";
import { FileDropZone } from "./invisibleDropper";
import { Page, DelegatedInkTrailPresenter } from "./pageComponent";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "./ui/input";
type PageCreationInsertPosition = "first" | "last" | "before" | "after";

// --- Notebook Component ---

export default function Notebook() {
  const PAGE_W = 800;
  const PAGE_H = 1000;
  const {
    pages,
    createPage,
    currentPage,
    deletePage,
    unloadNotebook,
    showCanvasEditor,
    setShowCanvasEditor,
    strokeColor,
    setStrokeColor,
    getPagesInOrder,
    notebookConfig,
    setPage,
    savePages,
    loadPage,
    importImage,
    imagesDirectory,
    currentPageRef,
    selectedTool,
    pointerDownRef,
    autosaveStart,
    loadImage,
    redrawAllPages,
    setRedrawAllPages,
    redrawPage,
    setRedrawPage,
  } = useFilesystemContext();
  const [scale, setScale] = useState(1);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("after");
  const [newPageWidth, setNewPageWidth] = useState("815");
  const [newPageHeight, setNewPageHeight] = useState("1152");
  const [pageOrientation, setPageOrientation] = useState<
    "portrait" | "landscape"
  >("portrait");
  const actionStack = useRef<ActionStack>(
    new ActionStack(10, {
      pages: pages,
      currentPage: currentPage,
      setPage: setPage,
    })
  );

  const drawing = useRef(false);
  const presenter = useRef<DelegatedInkTrailPresenter | null>(null);
  const [onlyPen, setOnlyPen] = useState(false);
  const [points, setPoints] = useState<NotesCode.Point[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const dontShow = useRef(false);
  const [style, setStyle] = useState({
    color: strokeColor,
    diameter: 8,
    backgroundColor: "#222222",
  });

  useEffect(() => {
    setStyle((s) => ({
      ...s,
      color: strokeColor,
    }));
  }, [strokeColor]);

  // update actionStack state when pages or currentPage changes
  useEffect(() => {
    actionStack.current.state.pages = pages;
    actionStack.current.state.currentPage = currentPage;
    actionStack.current.state.setPage = setPage;
  }, [pages, currentPage, setPage]);

  let [orderedPages, setOrderedPages] = useState<string[]>([]);

  function erasePage() {
    if (!actionStack.current) return;
    class ErasePageAction implements Action {
      type = "erasePage";
      payload: { doc: NotesCode.Document | undefined; id: string };
      prev = null;
      next = null;
      constructor(id: string) {
        this.payload = { doc: pages.get(id), id: id };
      }
      execute(state: any) {
        state.setPage(
          new NotesCode.Document({ strokes: [] }),
          this.payload?.id
        );
      }
      rollback(state: any) {
        if (state.setPage && this.payload.doc) {
          state.setPage(structuredClone(this.payload?.doc), this.payload.id);
        }
      }
    }
    if (currentPage === undefined || pages === undefined) return;
    actionStack.current?.addAction(new ErasePageAction(currentPage));
    autosaveStart();
  }

  function checkLineIntersection(
    p1: NotesCode.Point,
    p2: NotesCode.Point,
    q1: NotesCode.Point,
    q2: NotesCode.Point
  ) {
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;
    const { x: a1, y: b1 } = q1;
    const { x: a2, y: b2 } = q2;
    const denominator =
      (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
    // Parallel oder identisch → kein Schnittpunkt
    if (denominator === 0) {
      return false;
    }

    const sNumerator =
      (p1.y - q1.y) * (q2.x - q1.x) - (p1.x - q1.x) * (q2.y - q1.y);
    const s = sNumerator / denominator;

    const tNumerator = p1.x + s * (p2.x - p1.x) - q1.x;
    const tDenominator = q2.x - q1.x;
    const t =
      tDenominator !== 0
        ? tNumerator / tDenominator
        : (p1.y + s * (p2.y - p1.y) - q1.y) / (q2.y - q1.y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) return true;

    return false;
  }

  function calculateThickness(pressure: number) {
    return style.diameter * pressure;
  }

  class AddStrokeAction implements Action {
    type = "addStroke";
    payload: { stroke: NotesCode.Stroke; id: string };
    constructor(stroke: NotesCode.Stroke, id: string) {
      this.payload = { stroke: stroke, id: id };
    }
    prev = null;
    next = null;
    execute(state: {
      setPage: (page: NotesCode.Document, id?: string) => void;
      pages: Map<string, NotesCode.Document>;
    }) {
      if (!state.setPage || !state.pages) return;
      let page = state.pages.get(this.payload.id);
      if (!page) return;
      page = structuredClone(page);
      page.strokes.push(structuredClone(this.payload.stroke));
      state.setPage(page, this.payload.id);
    }
    rollback(state: {
      setPage: (page: NotesCode.Document, id?: string) => void;
      pages: Map<string, NotesCode.Document>;
    }) {
      if (!state.setPage || !state.pages) return;
      let page = state.pages.get(this.payload.id);
      if (!page) return;
      page = structuredClone(page);
      page.strokes.splice(page.strokes.length - 1, 1);
      state.setPage(page, this.payload.id);
    }
  }

  class DeleteStrokesAction implements Action {
    type = "deleteStrokes";
    prev = null;
    next = null;
    payload: {
      deletedStrokes: { stroke: NotesCode.Stroke; idx: number }[];
      newStrokes: NotesCode.Stroke[];
      id: string;
    };
    constructor(
      deletedStrokes: { stroke: NotesCode.Stroke; idx: number }[],
      newStrokes: NotesCode.Stroke[],
      id: string
    ) {
      this.payload = {
        deletedStrokes: deletedStrokes,
        newStrokes: newStrokes,
        id: id,
      };
    }
    execute(state: {
      setPage: (page: NotesCode.Document, id?: string) => Promise<any>;
      pages: Map<string, NotesCode.Document>;
    }) {
      if (!state.setPage || !state.pages) return;
      let page = state.pages.get(this.payload.id);
      if (!page) return;
      let newPage = new NotesCode.Document({
        ...page,
        strokes: structuredClone(this.payload.newStrokes),
      });
      state.setPage(newPage, this.payload.id);
    }
    rollback(state: {
      setPage: (page: NotesCode.Document, id?: string) => Promise<any>;
      pages: Map<string, NotesCode.Document>;
    }) {
      if (!state.setPage || !state.pages) return;
      let page = state.pages.get(this.payload.id);
      if (!page) return;
      let newPage = structuredClone(page);
      this.payload.deletedStrokes.sort((a, b) => a.idx - b.idx);
      for (let deleted of this.payload.deletedStrokes) {
        newPage.strokes.splice(deleted.idx, 0, deleted.stroke);
      }
      state.setPage(newPage, this.payload.id);
    }
  }

  function pointerDown(
    x: number,
    y: number,
    pointerType: string,
    pageID: string,
    pressure: number
  ) {
    if (pointerType !== "pen" && onlyPen) return;
    drawing.current = true;
    pointerDownRef.current = true;
    lastPointRef.current = {
      x: x,
      y: y,
    };
    currentPageRef.current = pageID;
    const firstPoint = new NotesCode.Point({
      x: x,
      y: y,
      pressure: pointerType === "touch" ? 0.5 : pressure,
    });
    setPoints([firstPoint]);
  }

  const pointerMove = (
    evt: PointerEvent,
    pointerType: string,
    pressure: number,
    x: number,
    y: number,
    canvas: RefObject<HTMLCanvasElement | null>
  ) => {
    if (
      currentPageRef.current === null ||
      selectedTool.current == "scroll" ||
      canvas.current === null
    )
      return;
    const ctx = canvas.current.getContext("2d");
    if (ctx === undefined || ctx === null) return;
    if (!drawing.current || (pointerType !== "pen" && onlyPen)) return;
    ctx.globalAlpha = selectedTool.current == "eraser" ? 0.5 : 1;
    ctx.strokeStyle = style.color;
    ctx.lineWidth =
      pointerType === "touch"
        ? calculateThickness(0.5)
        : calculateThickness(pressure);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current!.x, lastPointRef.current!.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = {
      x: x,
      y: y,
    };
    setPoints((pts) => [
      ...pts,
      new NotesCode.Point({
        x: x,
        y: y,
        pressure: pointerType === "touch" ? 0.5 : pressure,
      }),
    ]);
    if (presenter.current !== null) {
      let st = structuredClone(style);
      st.diameter =
        pointerType === "touch"
          ? calculateThickness(0.5)
          : calculateThickness(pressure);
      if (st.diameter < 1) st.diameter = 1;
      presenter.current.updateInkTrailStartPoint(evt, st);
    }
  };

  const pointerUp = useCallback(() => {
    if (!drawing.current || !pages || !currentPageRef.current) return;
    drawing.current = false;
    lastPointRef.current = null;
    if (selectedTool.current == "pen") {
      dontShow.current = true;
      let prev = pages.get(currentPageRef.current);

      if (!prev) return;
      actionStack.current.addAction(
        new AddStrokeAction(
          new NotesCode.Stroke({
            points: points,
            color: style.color,
            width: style.diameter,
          }),
          currentPageRef.current
        )
      );
      autosaveStart();
    } else if (selectedTool.current == "eraser") {
      let page = pages.get(currentPageRef.current);
      if (page === undefined) return;
      const deletedStrokes: { stroke: NotesCode.Stroke; idx: number }[] = [];
      const newStrokes: NotesCode.Stroke[] = [];
      if (points.length >= 2) {
        const eraserSegments: [NotesCode.Point, NotesCode.Point][] = [];
        for (let i = 1; i < points.length; i++) {
          eraserSegments.push([points[i - 1], points[i]]);
        }
        for (let idx = 0; idx < page.strokes.length; idx++) {
          const stroke = page.strokes[idx];
          if (stroke.points === undefined || stroke.points === null) return;
          if (!stroke.points || stroke.points.length < 2)
            newStrokes.push(stroke as NotesCode.Stroke);
          let checkStroke = (stroke: NotesCode.Stroke) => {
            for (let i = 1; i < stroke.points.length; i++) {
              const strokeSegStart = stroke.points[i - 1];
              const strokeSegEnd = stroke.points[i];
              for (const [eStart, eEnd] of eraserSegments) {
                if (
                  checkLineIntersection(
                    strokeSegStart as NotesCode.Point,
                    strokeSegEnd as NotesCode.Point,
                    eStart,
                    eEnd
                  )
                ) {
                  deletedStrokes.push({
                    stroke: stroke as NotesCode.Stroke,
                    idx: idx,
                  }); // Schnitt gefunden → stroke löschen
                  return;
                }
              }
            }
            newStrokes.push(stroke as NotesCode.Stroke); // kein Schnitt → stroke behalten
          };
          checkStroke(stroke as NotesCode.Stroke);
        }
        actionStack.current.addAction(
          new DeleteStrokesAction(
            deletedStrokes,
            newStrokes,
            currentPageRef.current
          )
        );
        autosaveStart();
      }
    }
  }, [points, pages, currentPage]);

  const handlePointerEvent = useCallback(
    (
      e: React.PointerEvent<HTMLDivElement>,
      type: "down" | "move" | "up",
      pageID: string,
      canvas: RefObject<HTMLCanvasElement | null>
    ) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const px = (e.clientX - rect.left) / scale;
      const py = (e.clientY - rect.top) / scale;
      const pointerType = e.nativeEvent.pointerType;
      const pressure = e.nativeEvent.pressure;
      switch (type) {
        case "down":
          pointerDown(px, py, pointerType, pageID, pressure);
          break;
        case "move":
          if (!drawing.current && pageID !== currentPageRef.current) {
            lastPointRef.current = {
              x: px,
              y: py,
            };
            return;
          }
          pointerMove(e.nativeEvent, pointerType, pressure, px, py, canvas);
          break;
        case "up":
          pointerUp();
          break;
      }
    },
    [points]
  );

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  const addPageBtnRef = useRef<HTMLButtonElement>(null);
  const addPageDropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  // Button click animation handler
  const handleButtonClick = (buttonId: string, callback?: () => void) => {
    setClickedButton(buttonId);
    setTimeout(() => setClickedButton(null), 200);
    if (callback) callback();
  };

  const openNewPageModal = useCallback(() => {
    setShowNewPageModal(true);
  }, []);

  // Get button classes with animation
  const getButtonClasses = (buttonId: string, baseClasses: string) => {
    const isClicked = clickedButton === buttonId;
    return `${baseClasses} transition-all duration-200 ${
      isClicked
        ? "scale-110 bg-blue-500 text-white shadow-lg shadow-blue-500/50"
        : ""
    }`;
  };

  const createNewPage = useCallback(() => {
    if (newPageTitle) {
      // Validate or assert newPageTitle as PageCreationInsertPosition
      const insertPosition: PageCreationInsertPosition = newPageTitle as PageCreationInsertPosition;
      console.log("Creating new page with insert mode:", insertPosition);
      createPage(undefined, {
        insert: insertPosition,
        width: parseInt(newPageWidth, 10),
        height: parseInt(newPageHeight, 10),
        background: "default",
      }).then(() => {
        setNewPageTitle("after");
        setShowNewPageModal(false);
        setNewPageWidth("815");
        setNewPageHeight("1152");
        setPageOrientation("portrait");
      });
    }
  }, [newPageTitle, newPageWidth, newPageHeight, pageOrientation, createPage]);

  function createPageWithToast(insert: PageCreationInsertPosition) {
    createPage(undefined, { insert: insert })
      .then(() => {
        let description = "New page added";
        switch (insert) {
          case "first":
            description = "New page added as first page";
            break;
          case "last":
            description = "New page added as last page";
            break;
          case "after":
            description = "New page added after current page";
            break;
          case "before":
            description = "New page added before current page";
            break;
        }
        toast({
          title: "Page added",
          description: description,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to add page",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsDropdownOpen(false);
      });
  }

  const addFirstHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleButtonClick("addFirst");
    createPageWithToast("first");
  };
  const addLastHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleButtonClick("addLast");
    createPageWithToast("last");
  };
  const addAfterHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleButtonClick("addAfter");
    createPageWithToast("after");
  };
  const addBeforeHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    handleButtonClick("addBefore");
    createPageWithToast("before");
  };
  const savePageHandler = () => {
    if (currentPage === undefined) return;
    try {
      savePages(false);
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
  const clearPageHandler = () => {
    erasePage();
    toast({
      title: "Page cleared",
      description: "All content has been removed from the current page",
    });
  };
  const closeAppHandler = () => {
    setShowCanvasEditor(false);
    unloadNotebook();
  };

  const [strokeSizes, setStrokeSizes] = useState<number[]>([]);
  const [currentStroke, setCurrentStrokeSize] = useState(2);

  // Inside Notebook component -> onDrop function

  const onDrop = useCallback(
    (acceptedFiles: FileList) => {
      if (imagesDirectory === undefined || currentPage === undefined) return;

      for (let i = 0; i < acceptedFiles.length; i++) {
        const item = acceptedFiles.item(i);
        if (item == null || !item.type.startsWith("image/")) continue;

        importImage(item, imagesDirectory)
          .then((id) => {
            if (!id) throw new Error("Image import failed to return an ID.");

            // Load the image to get its dimensions
            return loadImage(id, imagesDirectory).then((img) => {
              if (!img || img.naturalWidth === 0) {
                throw new Error(
                  "Failed to load image or image has no dimensions."
                );
              }

              const page = pages.get(currentPage);
              if (!page) return;

              const pageConf = notebookConfig?.pages.get(currentPage);
              const pageWidth = pageConf?.width || PAGE_W;
              const pageHeight = pageConf?.height || PAGE_H;

              // --- This is the key logic ---
              let initialScale = 1.0; // Default to 1 (original size)

              const isWiderThanPage = img.naturalWidth > pageWidth;
              const isTallerThanPage = img.naturalHeight > pageHeight;

              // Only calculate a new scale if the image is too big for the page.
              if (isWiderThanPage || isTallerThanPage) {
                const widthRatio = pageWidth / img.naturalWidth;
                const heightRatio = pageHeight / img.naturalHeight;
                // Use the smaller ratio to ensure the entire image fits while maintaining aspect ratio.
                initialScale = Math.min(widthRatio, heightRatio);
              }
              // --- End of key logic ---

              const newPage = structuredClone(page);
              newPage.images.push({
                image: id,
                x: 0,
                y: 0,
                // Use the calculated "fit-to-page" scale, or 1.0 if it already fits.
                scaleX: initialScale,
                scaleY: initialScale,
              });

              setPage(newPage, currentPage);

              toast({
                title: "Image Imported",
                description: "The image has been added to the current page.",
              });
            });
          })
          .catch((e) => {
            console.error(
              "Error processing dropped image:",
              e.message,
              e.stack
            );
            toast({
              title: "Error",
              description: "Failed to import image.",
              variant: "destructive",
            });
          });
      }
    },
    // Ensure all dependencies are here
    [
      imagesDirectory,
      currentPage,
      pages,
      notebookConfig,
      importImage,
      loadImage,
      setPage,
      PAGE_W,
      PAGE_H,
    ]
  );
  // Undo / Redo eventlisteners, Load stroke Sizes from Local Storage
  useEffect(() => {
    document.addEventListener("keyup", function (event) {
      if (event.ctrlKey && event.key === "z") {
        actionStack.current.undo();
        autosaveStart();
        event.preventDefault();
      } else if (event.ctrlKey && event.key === "y") {
        actionStack.current.redo();
        autosaveStart();
        event.preventDefault();
      }
    });
    document.addEventListener(
      "wheel",
      function (event) {
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.deltaY > 0) {
            zoomOut();
            setRedrawAllPages(true);
          } else if (event.deltaY < 0) {
            zoomIn();
            setRedrawAllPages(true);
          }
        }
      },
      { passive: false }
    );
    let strokes = localStorage.getItem("strokes");
    if (strokes === null) {
      localStorage.setItem(
        "strokes",
        JSON.stringify({ sizes: [3, 6, 10], current: currentStroke })
      );
    } else {
      let strokesObj: { sizes: number[]; current: number } =
        JSON.parse(strokes);
      setStrokeSizes(strokesObj.sizes);
      setCurrentStrokeSize(strokesObj.current);
    }
  }, []);

  // Keep orderedPages in sync with pages and redraw on change
  useEffect(() => {
    if (pages === undefined || pages.size === 0 || notebookConfig === undefined)
      return;
    getPagesInOrder()
      .then((pgs) => {
        setOrderedPages(pgs);
      })
      .catch((err) => console.error(err.message, err.stack));
  }, [pages, notebookConfig]);

  useEffect(() => {
    console.log("Current page:", currentPage);
  }, [currentPage]);

  function updateStrokeSize(newSize: number) {
    const newStrokeSizes = [...strokeSizes];
    // Update the size at the currently active index
    newStrokeSizes[currentStroke] = Math.round(newSize);
    setStrokeSizes(newStrokeSizes);

    // Update the drawing style immediately
    setStyle((s) => ({
      ...s,
      diameter: Math.round(newSize),
    }));

    // Persist to localStorage
    localStorage.setItem(
      "strokes",
      JSON.stringify({ sizes: newStrokeSizes, current: currentStroke })
    );
  }

  function setStroke(i: number) {
    setCurrentStrokeSize(i);
    localStorage.setItem(
      "strokes",
      JSON.stringify({ sizes: strokeSizes, current: i })
    );
    setStyle((s) => ({
      ...s,
      diameter: strokeSizes[i],
    }));
  }

  if (!!!showCanvasEditor) {
    return <></>;
  }
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
    <div className="h-screen w-screen overflow-hidden">
      {/* Toolbar */}
      <div className="static z-1 flex top-0 m-auto h-14 width-100 items-center bg-[#191919] gap-2 self-stretch">
        <div className="flex justify-evenly h-full m-1 rounded-md ">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className={getButtonClasses(
                    "home",
                    "self-center text-gray-400 hover:text-white hover:bg-[#333]"
                  )}
                  onClick={() => handleButtonClick("home", closeAppHandler)}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#333] text-white border-[#444]">
                <p>Back to Home</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button onClick={zoomOut} className="ml-3">
            –
          </button>
          <span
            className="zoom-label items-center place-self-center m-2 cursor-pointer"
            onClick={() => {
              setScale(1);
            }}
          >
            {(scale * 100).toFixed(0)}%
          </span>
          <button onClick={zoomIn}>+</button>
          <div className="w-4"></div>
          <Button
            onClick={() => {
              actionStack.current.undo();
              autosaveStart();
            }}
            className={`${
              actionStack.current.canUndo() ? "text-white" : "text-gray-400"
            } self-center bg-transparent hover:bg-[#333]`}
          >
            ↶
          </Button>
          <div className="w-1"></div>
          <Button
            onClick={() => {
              actionStack.current.redo();
              autosaveStart();
            }}
            className={`${
              actionStack.current.canRedo() ? "text-white" : "text-gray-400"
            } self-center bg-transparent hover:bg-[#333]`}
          >
            ↷
          </Button>
        </div>
        <div className="flex items-center h-full gap-2 place-self-center m-auto ">
          {/* Switch to Pencil*/}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleButtonClick(
                      "pencil",
                      () =>
                        (selectedTool.current =
                          selectedTool.current == "pen" ? "scroll" : "pen")
                    )
                  }
                  className={getButtonClasses(
                    "pencil",
                    `${
                      selectedTool.current == "pen"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-400 hover:text-white hover:bg-[#333]"
                    }`
                  )}
                >
                  <PenTool className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#333] text-white border-[#444]">
                <p>Switch to Drawing Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Switch to Eraser*/}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleButtonClick(
                      "eraser",
                      () =>
                        (selectedTool.current =
                          selectedTool.current == "eraser"
                            ? "scroll"
                            : "eraser")
                    )
                  }
                  className={getButtonClasses(
                    "eraser",
                    `${
                      selectedTool.current == "eraser"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-400 hover:text-white hover:bg-[#333]"
                    }`
                  )}
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
        <div className="flex items-center h-full gap-2 align-middle mr-0">
          <Dialog open={showNewPageModal} onOpenChange={setShowNewPageModal}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={getButtonClasses(
                  "addPage",
                  "text-gray-400 hover:text-white hover:bg-[#333]"
                )}
                onClick={() => handleButtonClick("addPage")}
                disabled={!notebookConfig}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#222] border-[#333] text-white">
              <DialogHeader>
                <DialogTitle>Create a new page</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose the dimensions and orientation for your new page.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="page-preset" className="text-right">
                    Preset
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      if (value === "a4") {
                        setNewPageWidth("815");
                        setNewPageHeight("1152");
                      } else if (value === "letter") {
                        setNewPageWidth("816");
                        setNewPageHeight("1056");
                      } else if (value === "a3") {
                        setNewPageWidth("1152");
                        setNewPageHeight("1630");
                      } else if (value === "a5") {
                        setNewPageWidth("576");
                        setNewPageHeight("815");
                      }
                      setPageOrientation("portrait");
                    }}
                    defaultValue="a4"
                  >
                    <SelectTrigger className="w-[180px] bg-[#333] border-[#444]">
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#333] border-[#444] text-white">
                      <SelectItem value="a3">A3</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="a5">A5</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      value={newPageWidth}
                      onChange={(e) => setNewPageWidth(e.target.value)}
                      className="bg-[#333] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      value={newPageHeight}
                      onChange={(e) => setNewPageHeight(e.target.value)}
                      className="bg-[#333] border-[#444] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label>Orientation</Label>
                  <RadioGroup
                    className="flex gap-4 mt-2"
                    onValueChange={(value: "portrait" | "landscape") => {
                      if (pageOrientation === "portrait" && value === "landscape") {
                        setNewPageWidth(newPageHeight);
                        setNewPageHeight(newPageWidth);
                      } else if (pageOrientation === "landscape" && value === "portrait") {
                        setNewPageWidth(newPageHeight);
                        setNewPageHeight(newPageWidth);
                      }
                      setPageOrientation(value);
                    }}
                    value={pageOrientation}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="portrait" id="r1" />
                      <Label htmlFor="r1">Portrait</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="landscape" id="r2" />
                      <Label htmlFor="r2">Landscape</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Insert Position</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full mt-2 bg-[#333] text-white hover:bg-[#444]">
                        {{
                           first: "Position: First",
                           last: "Position: Last",
                           before: "Position: Before Current",
                           after: "Position: After Current",
                         }[newPageTitle] || "Select Position"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-[#333] border-[#444] text-white">
                      <DropdownMenuItem onClick={() => setNewPageTitle("first")}>
                        First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewPageTitle("last")}>
                        Last
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setNewPageTitle("before")}
                      >
                        Before Current
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewPageTitle("after")}>
                        After Current
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                  disabled={!["first", "last", "before", "after"].includes(newPageTitle)}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <PopoverPicker color={strokeColor} onChange={setStrokeColor} />
          {/* Stroke Size Selector */}
          {strokeSizes.map((size, i) => {
            const isActive = i === currentStroke;
            return (
              <TooltipProvider key={i}>
                <Tooltip>
                  {isActive ? (
                    // ACTIVE STROKE: Show a Popover to adjust the size
                    <Popover>
                      <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={getButtonClasses(
                              `stroke-${i}`,
                              "relative flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                            )}
                          >
                            <div
                              className="w-3/4 rounded-full"
                              style={{
                                height: `${Math.max(2, size / 1.5)}px`,
                                backgroundColor: "currentColor",
                              }}
                            />
                          </Button>
                        </TooltipTrigger>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 bg-[#333] border-[#444] text-white">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">
                              Pen Size
                            </h4>
                            <p className="text-sm text-gray-400">
                              Adjust the active pen size.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">
                                {size.toFixed(0)}px
                              </span>
                            </div>
                            <Slider
                              defaultValue={[size]}
                              max={50}
                              min={1}
                              step={1}
                              onValueChange={(value) =>
                                updateStrokeSize(value[0])
                              }
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    // INACTIVE STROKE: Show a button to select it
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleButtonClick(`stroke-${i}`, () => setStroke(i))
                        }
                        className={getButtonClasses(
                          `stroke-${i}`,
                          "relative flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-[#333]"
                        )}
                      >
                        <div
                          className="w-3/4 rounded-full"
                          style={{
                            height: `${Math.max(2, size / 1.5)}px`,
                            backgroundColor: "currentColor",
                          }}
                        />
                      </Button>
                    </TooltipTrigger>
                  )}
                  <TooltipContent className="bg-[#333] text-white border-[#444]">
                    <p>
                      {isActive
                        ? `Current size: ${size}px (Click to edit)`
                        : `Set stroke size to ${size}px`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          {/* Divider for visual separation */}
          <div className="h-6 w-px bg-gray-600 mx-1"></div>
          {/* Erase Page Button */}
          <TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleButtonClick("clear", clearPageHandler)}
                    className={getButtonClasses(
                      "clear",
                      "text-gray-400 hover:text-white hover:bg-[#333]"
                    )}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#333] text-white border-[#444]">
                  <p>Clear Page</p>
                </TooltipContent>
              </Tooltip>
              {/* Save Page Button */}
            </TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleButtonClick("save", savePageHandler)}
                  className={getButtonClasses(
                    "save",
                    "text-gray-400 hover:text-white hover:bg-[#333]"
                  )}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#333] text-white border-[#444]">
                <p>Save Page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Delete Page Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleButtonClick("delete", deletePageHandler)}
                  className={getButtonClasses(
                    "delete",
                    "text-gray-400 hover:text-white hover:bg-[#333]"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#333] text-white border-[#444]">
                <p>Delete Page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Scrollable notebook */}
      <FileDropZone onFilesDrop={onDrop}>
        <div className="flex-1 overflow-auto h-[calc(100vh-3.5rem)] bg-gray-200">
          <div className="grid justify-items-center py-8">
            {pages !== undefined &&
              pages.size > 0 &&
              orderedPages.map((pageId) => {
                let page = pages.get(pageId);
                let conf = notebookConfig?.pages.get(pageId);
                return (
                  <Page
                    key={pageId}
                    pageID={pageId}
                    pageWidth={conf?.width || PAGE_W}
                    pageHeight={conf?.height || PAGE_H}
                    scale={scale}
                    onPointerEvent={handlePointerEvent}
                    presenterRef={presenter}
                    strokeDiameter={style.diameter}
                    pageData={page}
                  />
                );
              })}
          </div>
        </div>
      </FileDropZone>
    </div>
  );
}
