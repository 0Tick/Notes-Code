import { NotesCode } from "@/handwriting";
import { RefObject, FC, useRef, useEffect, useImperativeHandle } from "react";
import { CanvasImage } from "./CanvasImage";
import { useFilesystemContext } from "./filesystem-provider";

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
}) => {
  const {
    // Note: We no longer need loadImage or imagesDirectory here
    selectedTool,
    pointerDownRef,
    currentPageRef,
    setCurrentPage,
  } = useFilesystemContext();

  const canvasref = useRef<HTMLCanvasElement>(null);

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
            console.log(p);
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

        {/* canvas for strokes */}
        <canvas
          ref={canvasref}
          className="pointer-events-none absolute"
          style={{ width: pageWidth, height: pageHeight }}
        />

        {/*container for text blocks */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* ... text block rendering logic ... */}
        </div>
      </div>
    </div>
  );
};
