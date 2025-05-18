"use client"

import React, { useRef, useEffect, useState } from "react";

const COLORS = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
};

const INITIAL_STYLE = { colorName: "red", color: "#FF0000", diameter: 10 };

function InkCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const canvasTwoRef = useRef(null);
  const ct2Ref = useRef(null);

  const [style, setStyle] = useState({ ...INITIAL_STYLE });
  const [colorNames, setColorNames] = useState(Object.keys(COLORS));
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [points, setPoints] = useState([]);
  const [page, setPage] = useState({ strokes: [] });
  const [isZoom, setIsZoom] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [presenter, setPresenter] = useState(null);

  const zoomSpeed = 20;

  // Canvas initialisieren und auf Fenstergröße reagieren
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const canvasTwo = canvasTwoRef.current;
    const ct2 = canvasTwo.getContext("2d");
    ct2Ref.current = ct2;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvasTwo.width = window.innerWidth;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ink-API Presenter anfordern (wenn verfügbar)
  useEffect(() => {
    if ("ink" in navigator && navigator.ink.requestPresenter) {
      navigator.ink.requestPresenter({ presentationArea: canvasRef.current }).then((p) => {
        setPresenter(p);
      });
    }
  }, []);

  // Zeichnen mit Pointer-Events
  useEffect(() => {
    const canvas = canvasRef.current;

    const handlePointerDown = (evt) => {
      if (evt.pointerType !== "pen") return;
      setDrawing(true);
      setLastPoint({ x: evt.offsetX, y: evt.offsetY });
      setPoints([]);
    };

    const handlePointerMove = async (evt) => {
      if (!drawing || evt.pointerType !== "pen") return;
      const ctx = ctxRef.current;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = calculateThickness(evt.pressure);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(evt.offsetX, evt.offsetY);
      ctx.stroke();
      setLastPoint({ x: evt.offsetX, y: evt.offsetY });
      setPoints((pts) => [...pts, [evt.offsetX, evt.offsetY, evt.pressure]]);

      if (presenter) {
        await presenter.updateInkTrailStartPoint(evt, style);
      }
    };

    const handlePointerUp = () => {
      if (!drawing) return;
      setDrawing(false);
      setLastPoint(null);
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

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [drawing, lastPoint, style, presenter, points]);

  // Zoom und Offset mit Mausrad
  useEffect(() => {
    const canvasTwo = canvasTwoRef.current;
    const handleWheel = (event) => {
      setOffset((prev) => ({
        x: prev.x + (event.deltaX < 0 ? zoomSpeed : event.deltaX > 0 ? -zoomSpeed : 0),
        y: prev.y + (event.deltaY < 0 ? zoomSpeed : event.deltaY > 0 ? -zoomSpeed : 0),
      }));
      event.preventDefault();
    };
    canvasTwo.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvasTwo.removeEventListener("wheel", handleWheel);
  }, []);

  // Offset-Änderung triggert show()
  useEffect(() => {
    show();
    // eslint-disable-next-line
  }, [offset, isZoom, page]);

  function calculateThickness(pressure) {
    return style.diameter * pressure;
  }

  function show() {
    const ct2 = ct2Ref.current;
    const canvasTwo = canvasTwoRef.current;
    ct2.setTransform(1, 0, 0, 1, 0, 0);
    ct2.clearRect(0, 0, canvasTwo.width, canvasTwo.height);
    if (isZoom) ct2.setTransform(2, 0, 0, 2, offset.x, offset.y);
    else ct2.setTransform(1, 0, 0, 1, 0, 0);
    ct2.lineCap = "round";
    page.strokes.forEach((stroke) => {
      ct2.strokeStyle = stroke.color;
      let lastpoints = null;
      stroke.points.forEach((j) => {
        if (lastpoints != null) {
          ct2.beginPath();
          ct2.lineWidth = calculateThickness(j[2]);
          ct2.moveTo(lastpoints.x, lastpoints.y);
          ct2.lineTo(j[0], j[1]);
          ct2.stroke();
        }
        lastpoints = { x: j[0], y: j[1] };
      });
    });
  }

  /* function handleShow() {
    show();
  } */

  function handleZoom() {
    setIsZoom((prev) => !prev);
  }

  function handleChangeColor() {
    // Zyklisch durch die Farben wechseln
    const currentColor = colorNames[0];
    const newColorNames = [...colorNames.slice(1), currentColor];
    setColorNames(newColorNames);
    console.log(newColorNames);
    setStyle((prev) => ({
      ...prev,
      color: COLORS[newColorNames[0]],
      colorName: newColorNames[0],
    }));
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        height={500}
        style={{ display: "block", background: "#222", width: "100%" }}
      />
      {/* <button onClick={handleShow}>Anzeigen</button> */}
      <button onClick={handleZoom}>Zoomen</button>
      <button
        onClick={handleChangeColor}
        style={{ backgroundColor: style.color, color: "#fff", marginLeft: 8 }}
      >
        {style.colorName}
      </button>
      <canvas
        ref={canvasTwoRef}
        height={500}
        style={{ display: "block", background: "#222", width: "100%", marginTop: 8 }}
      />
    </div>
  );
}

export default InkCanvas;