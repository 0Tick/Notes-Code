"use client";

import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  RefObject,
} from "react";
import { NotesCode } from "../handwriting";
import { useFilesystemContext } from "@/components/filesystem-provider";
import { ActionStack, Action } from "@/components/ActionStack";

type CanvasProps = {
  defaultBackground?: string;
  height?: number;
  width?: number;
  strokeDiameter?: number;
  penInputOnly?: boolean;
  erasing?: boolean;
  setErasing?: React.Dispatch<React.SetStateAction<boolean>>; // Add setErase prop
  pageID: string | undefined; // Add page prop
  setPage?: React.Dispatch<React.SetStateAction<NotesCode.Document>>; // Add setPage prop
  actionStack: RefObject<ActionStack>;
};

// Define the type for the exposed methods
export type InkCanvasV2Ref = {
  clearCanvas: () => void;
  resetPosition: () => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  handleOnlyPen: () => void;
  toggleErase: () => void;
  newZoom: (value: number) => void;
  // Add other methods you might want to expose
};

// Wrap the component with forwardRef
const InkCanvasV2: React.ForwardRefRenderFunction<
  InkCanvasV2Ref,
  CanvasProps
> = (
  {
    width = 1000,
    height = 500,
    strokeDiameter = 10,
    penInputOnly = true,
    erasing = false,
    pageID, // Accept page prop
    defaultBackground = "#FFFFFF",
    actionStack,
  }: CanvasProps,
  ref: React.ForwardedRef<InkCanvasV2Ref>
) => {
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
    strokeColor,
    setStrokeColor,
  } = useFilesystemContext();
  // ref is the second argument
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [style, setStyle] = useState({
    color: strokeColor,
    diameter: strokeDiameter,
    backgroundColor: defaultBackground,
  });
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<NotesCode.Point[]>([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [presenter, setPresenter] = useState(null);
  const [onlyPen, setOnlyPen] = useState(penInputOnly);
  const [erase, setErase] = useState(erasing);
  const [page, setPageDoc] = useState<NotesCode.Document | undefined>(
    undefined
  );

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const dontShow = useRef(false);

  const zoomSpeed = 20;

  // Use useImperativeHandle to expose methods
  useImperativeHandle(ref, () => ({
    clearCanvas,
    resetPosition,
    increaseZoom,
    decreaseZoom,
    handleOnlyPen,
    toggleErase,
    newZoom,
    // Expose other functions here
  }));

  useEffect(() => {
    if (!currentPage || !pages) return;
    let page = pages.get(currentPage);
    if (!page) return;
    setPageDoc(page);
  }, [currentPage, pages]);

  useEffect(() => {
    setStyle((prev) => ({
      ...prev,
      color: strokeColor,
    }));
  }, [strokeColor]);

  function erasePage() {
    if (!actionStack.current) return;
    class ErasePageAction implements Action {
      type = "erasePage";
      payload: { doc: NotesCode.Document | undefined; id: string } | undefined =
        undefined;
      prev = null;
      next = null;
      execute(state: any) {
        if (
          !state.pages ||
          !state.currentPage ||
          state.currentPage === undefined
        ) {
          console.error("Unable to erase page: No pages or current page set.");
          return;
        }
        this.payload = {
          doc: state.pages.get(state.currentPage),
          id: state.currentPage,
        };
        state.setPage(new NotesCode.Document({ strokes: [] }));
      }
      rollback(state: any) {
        if (state.setPage && this.payload?.doc) {
          state.setPage(structuredClone(this.payload?.doc), this.payload?.id);
        }
      }
    }
    actionStack.current?.addAction(new ErasePageAction());
  }

  // Canvas initialisieren und auf Fenstergröße reagieren
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const handleResize = () => {
      const container = canvasRef.current?.parentElement; // Referenz auf das übergeordnete Element
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Setze die Größe des Canvas basierend auf der Größe des Containers
        canvas.width = Math.min(containerWidth, width, window.innerWidth);
        canvas.height = Math.min(containerHeight, height, window.innerHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  // Ink-API Presenter anfordern (wenn verfügbar)
  useEffect(() => {
    if ("ink" in navigator && (navigator.ink as any).requestPresenter) {
      (navigator.ink as any)
        .requestPresenter({ presentationArea: canvasRef.current })
        .then((p: any) => {
          setPresenter(p);
        });
    }
  }, []);

  // Zeichnen mit Pointer-Events
  useEffect(() => {
    const canvas = canvasRef.current;

    const handlePointerDown = (evt: any) => {
      if (evt.pointerType !== "pen" && onlyPen) return;
      setDrawing(true);
      lastPointRef.current = {
        x: (evt.offsetX - offset.x) / zoom,
        y: (evt.offsetY - offset.y) / zoom,
      };
      setPoints([]);
    };

    const handlePointerMove = async (evt: any) => {
      if (!ctxRef.current) return;
      if (!drawing || (evt.pointerType !== "pen" && onlyPen)) return;
      const ctx = ctxRef.current;
      ctx.globalAlpha = erase ? 0.5 : 1;
      ctx.strokeStyle = style.color;
      ctx.lineWidth =
        evt.pointerType === "touch"
          ? calculateThickness(0.5)
          : calculateThickness(evt.pressure);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current!.x, lastPointRef.current!.y);
      ctx.lineTo(
        (evt.offsetX - offset.x) / zoom,
        (evt.offsetY - offset.y) / zoom
      );
      ctx.stroke();

      lastPointRef.current = {
        x: (evt.offsetX - offset.x) / zoom,
        y: (evt.offsetY - offset.y) / zoom,
      };
      setPoints((pts) => [
        ...pts,
        new NotesCode.Point({
          x: (evt.offsetX - offset.x) / zoom,
          y: (evt.offsetY - offset.y) / zoom,
          pressure: evt.pointerType === "touch" ? 0.5 : evt.pressure,
        }),
      ]);
      if (presenter) {
        await (presenter as any).updateInkTrailStartPoint(evt, style);
      }
    };

    const handlePointerUp = () => {
      setDrawing(false);
      if (!drawing || !pages || !currentPage || !page) return;
      lastPointRef.current = null;
      if (!erase) {
        dontShow.current = true;
        let prev = pages.get(currentPage);
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
        const deleteRadius = 10; // oder abhängig vom Pressure/Style
        const deletedStrokes: { stroke: NotesCode.Stroke; idx: number }[] = [];
        const newStrokes: NotesCode.Stroke[] = [];
        for (let i = 0; i < page.strokes.length; i++) {
          const stroke = page.strokes[i];
          // Use page prop
          // Behalte den Stroke, wenn **keiner** der Punkte nahe am Radierpfad ist
          const isNearEraser = stroke?.points?.some((p) =>
            points.some((d) => {
              const dx = (p.x || 0) - d.x;
              const dy = (p.y || 0) - d.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance < deleteRadius;
            })
          );
          if (isNearEraser) {
            deletedStrokes.push({ stroke: stroke as NotesCode.Stroke, idx: i });
          } else {
            newStrokes.push(stroke as NotesCode.Stroke);
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
        actionStack.current.addAction(
          new DeleteStrokesAction(deletedStrokes, newStrokes, currentPage)
        );
      }
    };

    if (!canvas) return;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    drawing,
    lastPointRef.current,
    style,
    presenter,
    points,
    onlyPen,
    offset,
    erase,
  ]);

  // Zoom und Offset mit Mausrad
  useEffect(() => {
    const canvas = canvasRef.current;
    const handleWheel = (event: any) => {
      setOffset((prev) => ({
        x:
          prev.x +
          (event.deltaX < 0 ? zoomSpeed : event.deltaX > 0 ? -zoomSpeed : 0),
        y:
          prev.y +
          (event.deltaY < 0 ? zoomSpeed : event.deltaY > 0 ? -zoomSpeed : 0),
      }));

      event.preventDefault();
    };
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [offset]);

  function calculateThickness(pressure: number) {
    return style.diameter * pressure;
  }

  const show = useCallback(() => {
    if (!ctxRef.current || !canvasRef.current || !page) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y);
    ctx.lineCap = "round";
    page.strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color || "#000000";
      let lastpoints: any = null;
      stroke?.points?.forEach((j) => {
        if (lastpoints != null) {
          ctx.beginPath();
          ctx.lineWidth = calculateThickness(j.pressure || 1);
          ctx.moveTo(lastpoints.x, lastpoints.y);
          ctx.lineTo(j.x || 0, j.y || 0);
          ctx.stroke();
        }
        lastpoints = { x: j.x, y: j.y };
      });
    });
  }, [page, offset, zoom]);

  useEffect(() => {
    if (dontShow.current) {
      dontShow.current = false;
      return;
    }
    show();
  }, [page, offset, zoom]);

  function increaseZoom() {
    setZoom((prev) => prev + 0.25);
  }

  function decreaseZoom() {
    if (zoom - 0.25 > 0) setZoom((prev) => prev - 0.25);
  }

  function handleOnlyPen() {
    // Toggles Touch and Mouse Inputs
    setOnlyPen(!onlyPen);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    erasePage();
  }

  function resetPosition() {
    setZoom(1);
    setOffset({ x: 0, y: 1 });
  }

  function newZoom(value: number) {
    setZoom(value);
  }

  function toggleErase() {
    setErase((prev) => !prev);
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

  useEffect(() => {
    setOnlyPen(penInputOnly);
  }, [penInputOnly]);

  useEffect(() => {
    setErase(erasing);
  }, [erasing]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        height={height}
        width={width}
        style={{ display: "block", background: style.backgroundColor }}
      />
    </div>
  );
};

export default forwardRef(InkCanvasV2); // Export the forwarded component
