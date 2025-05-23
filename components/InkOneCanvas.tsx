"use client"

import React, { useRef, useEffect, useState } from "react";

const COLORS: { [ key: string]: string} = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
};

type Stroke = {
  points: [number, number, number][];
  color: string;
  width: number;
}

const INITIAL_STYLE = { colorName: "red", color: "#FF0000", diameter: 10 };

function InkOneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [style, setStyle] = useState({ ...INITIAL_STYLE });
  const [colorNames, setColorNames] = useState(Object.keys(COLORS));
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<[number, number, number][]>([]);
  const [page, setPage] = useState<{strokes:Stroke[]}>({ strokes: [] });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [presenter, setPresenter] = useState(null);
  const [onlyPen, setOnlyPen] = useState(true);

  const lastPointRef = useRef<{x: number, y: number} | null>(null);

  const zoomSpeed = 20;

  // Canvas initialisieren und auf Fenstergröße reagieren
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;


    const handleResize = () => {
      canvas.width = window.innerWidth;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ink-API Presenter anfordern (wenn verfügbar)
  useEffect(() => {
    if ("ink" in navigator && (navigator.ink as any).requestPresenter) {
      (navigator.ink as any).requestPresenter({ presentationArea: canvasRef.current }).then((p: any) => {
        setPresenter(p);
      });
    }
  }, []);

  // Zeichnen mit Pointer-Events
  useEffect(() => {
    const canvas = canvasRef.current;

    const handlePointerDown = (evt: any) => {
      if (evt.pointerType !== "pen"  && onlyPen) return;
      setDrawing(true);
      lastPointRef.current = {
        x: (evt.offsetX - offset.x) / zoom,
        y: (evt.offsetY - offset.y) / zoom,
      };
      setPoints([]);
    };

    const handlePointerMove = async (evt: any) => {
      if (!ctxRef.current) return;
      if (!drawing || evt.pointerType !== "pen" && onlyPen) return;
      const ctx = ctxRef.current;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = calculateThickness(evt.pressure);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current!.x, lastPointRef.current!.y );
      ctx.lineTo((evt.offsetX - offset.x) / zoom, (evt.offsetY - offset.y) / zoom);
      ctx.stroke();
      lastPointRef.current = { 
        x: ( evt.offsetX - offset.x ) / zoom , 
        y: ( evt.offsetY - offset.y ) / zoom 
      };
      setPoints((pts) => [...pts, [(evt.offsetX - offset.x) / zoom, (evt.offsetY - offset.y ) / zoom, evt.pressure]]);

      if (presenter) {
        await (presenter as any).updateInkTrailStartPoint(evt, style);
      }
    };

    const handlePointerUp = () => {
      if (!drawing) return;
      setDrawing(false);
      lastPointRef.current = null;
      setPage((prev) => ({
        strokes: [
          ...prev.strokes,
          {
            points: points,
            color: style.color,
            width: style.diameter,
          },
        ],
      }));
      setPoints([]);
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
  }, [drawing, lastPointRef.current, style, presenter, points, onlyPen, offset]);

  // Zoom und Offset mit Mausrad
  useEffect(() => {
    const canvas = canvasRef.current;
    const handleWheel = (event: any) => {
      setOffset((prev) => ({
        x: prev.x + (event.deltaX < 0 ? zoomSpeed : event.deltaX > 0 ? -zoomSpeed : 0),
        y: prev.y + (event.deltaY < 0 ? zoomSpeed : event.deltaY > 0 ? -zoomSpeed : 0),
      }));
      show();
      event.preventDefault();
    };
    if (!canvas) return
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // Offset-Änderung triggert show()
  useEffect(() => {
    show();
    // eslint-disable-next-line
  }, [offset, zoom, page]);

  function calculateThickness(pressure: number) {
    return style.diameter * pressure;
  }

  function show() {
    if (!ctxRef.current || !canvasRef.current) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y);
    ctx.lineCap = "round";
    page.strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color;
      let lastpoints: any = null;
      stroke.points.forEach((j) => {
        if (lastpoints != null) {
          ctx.beginPath();
          ctx.lineWidth = calculateThickness(j[2]);
          ctx.moveTo(lastpoints.x, lastpoints.y);
          ctx.lineTo(j[0], j[1]);
          ctx.stroke();
        }
        lastpoints = { x: j[0], y: j[1] };
      });
    });
  }

  /* function handleShow() {
    show();
  } */

  function increaseZoom() {
    setZoom((prev) => prev + 0.25);
  }

  function decreaseZoom() {
    if (zoom - 0.25 > 0) setZoom((prev) => prev - 0.25);
  }

  function handleChangeColor() {
    // Zyklisch durch die Farben wechseln
    const currentColor = colorNames[0];
    const newColorNames = [...colorNames.slice(1), currentColor];
    setColorNames(newColorNames);
    setStyle((prev) => ({
      ...prev,
      color: COLORS[newColorNames[0]],
      colorName: newColorNames[0],
    }));
  }

  function handleOnlyPen() {
    // Toggles Touch and Mouse Inputs
    setOnlyPen(!onlyPen);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if(!canvas || !ctx) return;
    ctx.clearRect(0,0,canvas.width, canvas.height)
    page.strokes = [];
  }

  function resetPosition() {
    setZoom(1);
    setOffset({x: 0, y: 1});
    show();
  }



  return (
    <div>
      <canvas
        ref={canvasRef}
        height={500}
        style={{ display: "block", background: "#222", width: "100%" }}
      />
      {/* <button onClick={handleShow}>Anzeigen</button> */}
      <button onClick={increaseZoom}>Reinzoomen</button>
      <button onClick={decreaseZoom}>Herauszoomen</button>
      <button
        onClick={handleChangeColor}
        style={{ backgroundColor: style.color, color: "#fff", marginLeft: 8 }}
      >
        {style.colorName}
      </button>
      <button 
        onClick={handleOnlyPen} 
        style={{color: onlyPen ? "#00FF00": "#FF0000"}}>
          {onlyPen ? "Nur Stifteingaben akzeptieren": "Alle Eingaben akzeptieren"}
          </button>
      <button onClick={clearCanvas}>Canvas leeren</button>
      <button onClick={resetPosition}>Position zurücksetzen</button>
    </div>
  );
}

export default InkOneCanvas;