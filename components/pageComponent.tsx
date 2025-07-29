import { NotesCode } from "@/handwriting";
import { RefObject, FC, useRef, useEffect, useCallback } from "react";
import { CanvasImage } from "./CanvasImage";
import { useFilesystemContext } from "./filesystem-provider";
import CodeBlock from "./CodeBlock";

export type DelegatedInkTrailPresenter = {
  updateInkTrailStartPoint: (evt: PointerEvent, style: any) => Promise<void>;
  presentationArea: HTMLCanvasElement | null;
};
// --- Page Component ---
interface PageProps {
  pageID: string;
  pageWidth: number;
  pageHeight: number;
  scale: number;
  onPointerEvent: (
    e: React.PointerEvent<HTMLDivElement>,
    type: "down" | "move" | "up",
    pageID: string, //
    canvas: RefObject<HTMLCanvasElement | null>
  ) => void;
  strokeDiameter?: number;
  defaultBackground?: string;
  presenterRef: RefObject<DelegatedInkTrailPresenter | null>;
  pageData: NotesCode.Document | undefined;
  selectionRect: { x: number; y: number; width: number; height: number } | null;
  selectionBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
}
function calculateThickness(pressure: number, stroke: NotesCode.Stroke) {
  return (stroke.width || 5) * pressure;
}

export const Page: FC<PageProps> = ({
  pageID,
  pageData,
  pageWidth,
  pageHeight,
  scale,
  onPointerEvent,
  presenterRef,
  selectionRect,
  selectionBoundingBox,
  onContextMenu,
}) => {
  const {
    // Note: We no longer need loadImage or imagesDirectory here
    selectedTool,
    pointerDownRef,
    currentPageRef,
    setCurrentPage,
    setPages,
  } = useFilesystemContext();

  const canvasref = useRef<HTMLCanvasElement>(null);

  const handleHeightChange = useCallback((path: string, height: number) => {
    setPages((prevPages) => {
      if (!prevPages) return prevPages;
      const page = prevPages.get(pageID);
      if (!page) return prevPages;
      const textBlock = page.textBlocks.find((tb) => tb.path === path);
      if (textBlock && textBlock.h !== height) {
        let newPage = structuredClone(page);
        let newTextBlocks = [...page.textBlocks].filter(
          (tb) => tb.path !== path
        );
        newTextBlocks.push({ ...textBlock, h: height });
        newPage.textBlocks = newTextBlocks;
        let newPages = structuredClone(prevPages);
        newPages.set(pageID, newPage);
        return newPages;
      }
      return prevPages;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = pageWidth;
    canvas.height = pageHeight;

    ctx.clearRect(0, 0, pageWidth, pageHeight);

    if (!pageData?.strokes) return;

    ctx.lineCap = "round";
    pageData.strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color || "#000000";
      let lastpoints: any = null;
      stroke?.points?.forEach((j) => {
        if (lastpoints != null) {
          ctx.beginPath();
          ctx.lineWidth = calculateThickness(
            j.pressure || 1,
            stroke as NotesCode.Stroke
          );
          ctx.moveTo(lastpoints.x, lastpoints.y);
          ctx.lineTo(j.x || 0, j.y || 0);
          ctx.stroke();
        }
        lastpoints = { x: j.x || 0, y: j.y || 0 };
      });
    });
  }, [pageData, scale, pageWidth, pageHeight]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (currentPageRef.current !== pageID) {
      currentPageRef.current = pageID;
    }
    onPointerEvent(e, "down", pageID, canvasref);
    setCurrentPage(pageID);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (currentPageRef.current !== pageID) {
      if (pointerDownRef.current == false) {
        currentPageRef.current = pageID;
        setCurrentPage(pageID);
        onPointerEvent(e, "move", pageID, canvasref);
      }
    } else {
      onPointerEvent(e, "move", pageID, canvasref);
    }
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerEvent(e, "up", pageID, canvasref);
    pointerDownRef.current = false;
  };
  const onPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      !(
        (selectedTool.current == "pen" || selectedTool.current == "eraser") &&
        pointerDownRef.current
      ) &&
      presenterRef.current !== null &&
      presenterRef.current.presentationArea !== canvasref.current
    ) {
      if ("ink" in navigator && (navigator.ink as any).requestPresenter) {
        (navigator.ink as any)
          .requestPresenter({ presentationArea: canvasref.current })
          .then((p: any) => {
            presenterRef.current = p;
          });
      }
      currentPageRef.current = pageID;
      setCurrentPage(pageID);
    }
  };

  return (
    <div
      className="relative top-0 left-0 mx-4 mb-1 bg-white shadow-md shadow-black"
      style={{
        width: pageWidth * scale,
        height: pageHeight * scale,
        touchAction: selectedTool.current == "scroll" ? "manipulation" : "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={onPointerEnter}
      onContextMenu={onContextMenu}
      onDrag={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragStartCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="origin-top-left will-change-transform overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          width: pageWidth,
          height: pageHeight,
        }}
      >
        {/* Container for all images */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {pageData !== undefined &&
            pageData.images.map((imageMeta) => (
              <CanvasImage
                key={imageMeta.image}
                imageMeta={imageMeta as NotesCode.Image}
              />
            ))}
        </div>
        {/*container for text blocks */}
        <div>
          {pageData &&
            pageData.textBlocks &&
            pageData.textBlocks.map((textBlock) => {
              return (
                <CodeBlock
                  key={textBlock.path}
                  textBlock={textBlock}
                  theme="github-dark"
                  onHeightChange={(height) =>
                    handleHeightChange(textBlock.path as string, height)
                  }
                />
              );
            })}
        </div>
        {/* canvas for strokes */}
        <canvas
          ref={canvasref}
          className="pointer-events-none absolute"
          style={{ width: pageWidth, height: pageHeight }}
        />

        {/* Selection Rectangle */}
        {selectionRect && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}

        {/* Selection Bounding Box */}
        {selectionBoundingBox && (
          <div
            className="absolute border-2 border-dashed border-green-500 pointer-events-none"
            style={{
              left: selectionBoundingBox.x,
              top: selectionBoundingBox.y,
              width: selectionBoundingBox.width,
              height: selectionBoundingBox.height,
            }}
          />
        )}
      </div>
    </div>
  );
};
