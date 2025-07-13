import React, {
  FC,
  useRef,
  useEffect,
  useState,
  PointerEvent,
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
type DelegatedInkTrailPresenter = {
  updateInkTrailStartPoint: (evt: PointerEvent, style: any) => Promise<void>;
  presentationArea: HTMLCanvasElement | null;
};
type PageCreationInsertPosition = "first" | "last" | "before" | "after";
// --- Page Component ---
interface PageProps {
  pageID: string;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  onPointerEvent?: (
    e: PointerEvent<HTMLDivElement>,
    type: "down" | "move" | "up",
    pageID: string
  ) => void;
  strokeDiameter?: number;
  defaultBackground?: string;
  refObj: RefObject<{
    update: (pageData: NotesCode.Document | undefined, size: number) => void;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    ctxRef: RefObject<CanvasRenderingContext2D | null>;
  } | null>;
  presenterRef: RefObject<DelegatedInkTrailPresenter | null>;
}

export const Page: FC<PageProps> = ({
  pageID,
  pageWidth,
  pageHeight,
  scale,
  onPointerEvent,
  strokeDiameter = 10,
  defaultBackground = "#FFFFFF",
  refObj,
  presenterRef,
}) => {
  const {
    notebookConfig,
    notebookDirectory,
    pagesDirectory,
    imagesDirectory,
    pages,
    loadPage,
    savePage,
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
    loadImage,
    loadText,
    saveText,
  } = useFilesystemContext();
  const [pageData, setPageData] = useState<NotesCode.Document | undefined>(
    undefined
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  function calculateThickness(pressure: number, strokeDiameter: number) {
    return strokeDiameter * pressure;
  }

  useEffect(() => {
    if (canvasRef.current === null) return;
    ctxRef.current = canvasRef.current?.getContext("2d");
  }, []);

  useImperativeHandle(refObj, () => {
    return {
      update: updateCanvas,
      canvasRef: canvasRef,
      ctxRef: ctxRef,
    };
  });
  // Redraw strokes & images whenever pageData changes
  function updateCanvas(
    pageData: NotesCode.Document | undefined,
    scale: number
  ) {
    const canvas = canvasRef.current;
    if (!canvas || !pageData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // set logical size
    canvas.width = pageWidth;
    canvas.height = pageHeight;

    // clear
    ctx.clearRect(0, 0, pageWidth, pageHeight);
    // TODO draw Background here
    if (pageData === undefined) return;
    ctx.lineCap = "round";
    // draw strokes
    pageData.strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color || "#000000";
      let lastpoints: any = null;
      stroke?.points?.forEach((j) => {
        if (lastpoints != null) {
          ctx.beginPath();
          ctx.lineWidth = calculateThickness(
            j.pressure || 1,
            stroke.width || 5
          );
          ctx.moveTo(lastpoints.x, lastpoints.y);
          ctx.lineTo(j.x || 0, j.y || 0);
          ctx.stroke();
        }
        lastpoints = { x: j.x || 0, y: j.y || 0 };
      });
    });

    // draw images
    for (const imgObj of pageData.images) {
      if (typeof imgObj.image !== "string") continue;
      loadImage(imgObj.image).then((img) => {
        if (img === undefined) return;
        ctx.drawImage(
          img,
          (imgObj.x || 0) * scale,
          (imgObj.y || 0) * scale,
          (imgObj.scaleX || 1) * scale,
          (imgObj.scaleY || 1) * scale
        );
      });
    }
    setPageData(pageData);
  }

  // Wrapper pointer handlers
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) =>
    onPointerEvent?.(e, "down", pageID);
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) =>
    onPointerEvent?.(e, "move", pageID);
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) =>
    onPointerEvent?.(e, "up", pageID);

  function onPointerEnter(e: PointerEvent<HTMLDivElement>) {
    if ("ink" in navigator && (navigator.ink as any).requestPresenter) {
      (navigator.ink as any)
        .requestPresenter({ presentationArea: canvasRef.current })
        .then((p: any) => {
          presenterRef.current = p;
        });
    }
    setCurrentPage(pageID);
  }

  return (
    <div
      className="relative top-0 left-0 mx-4 mb-1 bg-white shadow-md shadow-black"
      style={{
        width: pageWidth * scale,
        height: pageHeight * scale,
        touchAction: "none", // TODO Make this dependant on if a tool is selected. No tool => Allow for scrolling
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={onPointerEnter}
    >
      <div
        className="origin-top-left will-change-transform overflow-hidden pointer-events-none"
        style={{
          transform: `scale(${scale})`,
          width: pageWidth,
          height: pageHeight,
        }}
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none"
          style={{
            width: `${pageWidth}px`,
            height: `${pageHeight}px`,
          }}
        />

        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ transform: `scale(${scale})` }}
        >
          {pageData !== undefined &&
            pageData.textBlocks.map((tb) => (
              <div
                key={tb.path}
                className="absolute whitespace-pre-wrap pointer-events-auto"
                style={{
                  left: tb.x || 0,
                  top: tb.y || 0,
                  width: tb.w || 0,
                  height: tb.h || 0,
                  fontSize: tb.fontSize || 0,
                  fontFamily: tb.fontFamily || "",
                  color: tb.color || "",
                  // if you want to prevent text from zooming too much, invert part of the scale:
                  // transform: `scale(${1/scale})`,
                  // transformOrigin: 'top left',
                }}
              >
                {}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// --- Notebook Component ---

export default function Notebook() {
  const PAGE_W = 800;
  const PAGE_H = 1000;
  const {
    pages,
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
    getPagesInOrder,
    notebookConfig,
    setPage,
    savePages,
    loadPage,
  } = useFilesystemContext();
  const [scale, setScale] = useState(1);
  const actionStack = useRef<ActionStack>(
    new ActionStack(10, {
      pages: pages,
      currentPage: currentPage,
      setPage: setPage,
    })
  );
  const refsMap = useRef<
    Map<
      string,
      RefObject<{
        update: (
          pageData: NotesCode.Document | undefined,
          size: number
        ) => void;
        canvasRef: React.RefObject<HTMLCanvasElement | null>;
        ctxRef: React.RefObject<CanvasRenderingContext2D | null>;
      } | null>
    >
  >(new Map());

  const [drawing, setDrawing] = useState(false);
  const presenter = useRef<DelegatedInkTrailPresenter | null>(null);
  const [erase, setErase] = useState(false);
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
  // Keep orderedPages in sync with pages and redraw on change
  useEffect(() => {
    if (pages === undefined || pages.size === 0) return;
    getPagesInOrder()
      .then((pgs) => setOrderedPages(pgs))
      .catch((err) => console.error(err.message, err.stack));
    // Rerender all Pages
    for (const [pageID, refObj] of refsMap.current) {
      let pageData = pages.get(pageID);
      if (pageData === undefined) {
        loadPage(pageID);
        continue;
      }
      refObj.current?.update(pageData, scale);
    }
  }, [pages]);

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

  function pointerDown(x: number, y: number, pointerType: string) {
    if (pointerType !== "pen" && onlyPen) return;
    setDrawing(true);
    lastPointRef.current = {
      x: x,
      y: y,
    };
    setPoints([]);
  }

  const pointerMove = (
    evt: any,
    pointerType: string,
    pressure: number,
    x: number,
    y: number,
    erase: boolean
  ) => {
    if (currentPage === undefined) return;
    const ctxRef = refsMap.current.get(currentPage)?.current?.ctxRef;
    if (ctxRef === undefined || !ctxRef.current) return;
    if (!drawing || (pointerType !== "pen" && onlyPen)) return;
    const ctx = ctxRef.current;
    ctx.globalAlpha = erase ? 0.5 : 1;
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
      st.diameter /= 2;
      presenter.current.updateInkTrailStartPoint(evt, st);
    }
  };

  const pointerUp = useCallback(() => {
    setDrawing(false);
    if (!drawing || !pages || !currentPage) return;
    lastPointRef.current = null;
    if (!erase) {
      dontShow.current = true;
      let prev = pages.get(currentPage);

      if (!prev) return;
      actionStack.current.addAction(
        new AddStrokeAction(
          new NotesCode.Stroke({
            points: points,
            color: style.color,
            width: style.diameter,
          }),
          currentPage
        )
      );
    } else {
      let page = pages.get(currentPage);
      if (page === undefined) return;
      const deletedStrokes: { stroke: NotesCode.Stroke; idx: number }[] = [];
      const newStrokes: NotesCode.Stroke[] = [];
      if (erase && points.length >= 2) {
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
          new DeleteStrokesAction(deletedStrokes, newStrokes, currentPage)
        );
      }
    }
  }, [erase, points, pages, currentPage]);

  const handlePointerEvent = useCallback(
    (e: any, type: "down" | "move" | "up", pageID: string) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const px = (e.clientX - rect.left) / scale;
      const py = (e.clientY - rect.top) / scale;
      const pointerType = e.nativeEvent.pointerType;
      const pressure = e.nativeEvent.pressure;
      switch (type) {
        case "down":
          pointerDown(px, py, pointerType);
          break;
        case "move":
          if (!drawing) return;
          pointerMove(e.nativeEvent, pointerType, pressure, px, py, erase);
          break;
        case "up":
          pointerUp();
          break;
      }
    },
    [erase, drawing, points]
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

  // Get button classes with animation
  const getButtonClasses = (buttonId: string, baseClasses: string) => {
    const isClicked = clickedButton === buttonId;
    return `${baseClasses} transition-all duration-200 ${
      isClicked
        ? "scale-110 bg-blue-500 text-white shadow-lg shadow-blue-500/50"
        : ""
    }`;
  };

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

  // Undo / Redo eventlisteners, Load stroke Sizes from Local Storage
  useEffect(() => {
    document.addEventListener("keyup", function (event) {
      if (event.ctrlKey && event.key === "z") {
        actionStack.current.undo();
        event.preventDefault();
      } else if (event.ctrlKey && event.key === "y") {
        actionStack.current.redo();
        event.preventDefault();
      }
    });
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
    <div className="h-screen w-screen">
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
                    handleButtonClick("pencil", () => setErase(false))
                  }
                  className={getButtonClasses(
                    "pencil",
                    `${
                      !erase
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
                    handleButtonClick("eraser", () => setErase(true))
                  }
                  className={getButtonClasses(
                    "eraser",
                    `${
                      erase
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
          <PopoverPicker color={strokeColor} onChange={setStrokeColor} />
        </div>
        <div className="flex items-center h-full gap-2 align-middle mr-0">
          {/* Add Page Dropdown */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                ref={addPageBtnRef}
                variant="ghost"
                size="sm"
                className={getButtonClasses(
                  "addPage",
                  "text-gray-400 hover:text-white hover:bg-[#333]"
                )}
                onClick={() => handleButtonClick("addPage")}
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
                            <h4 className="font-medium leading-none">Pen Size</h4>
                            <p className="text-sm text-gray-400">
                              Adjust the active pen size.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">{size.toFixed(0)}px</span>
                            </div>
                            <Slider
                              defaultValue={[size]}
                              max={50}
                              min={1}
                              step={1}
                              onValueChange={(value) => updateStrokeSize(value[0])}
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
      <div className="flex-1 overflow-auto h-[calc(100vh-3.5rem)] bg-gray-200">
        <div className="grid justify-items-center py-8">
          {orderedPages.map((pageId) => {
            let page = pages.get(pageId);
            let conf = notebookConfig?.pages.get(pageId);
            // Create a React ref for this page
            const pageRef = React.createRef<{
              update: (
                pageData: NotesCode.Document | undefined,
                size: number
              ) => void;
              canvasRef: React.RefObject<HTMLCanvasElement | null>;
              ctxRef: React.RefObject<CanvasRenderingContext2D | null>;
            }>();
            refsMap.current.set(pageId, pageRef);
            return (
              <Page
                key={pageId}
                pageID={pageId}
                pageWidth={conf?.width || PAGE_W}
                pageHeight={conf?.height || PAGE_H}
                scale={scale}
                onPointerEvent={handlePointerEvent}
                refObj={pageRef}
                presenterRef={presenter}
                strokeDiameter={style.diameter}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
