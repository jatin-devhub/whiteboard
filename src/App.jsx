import { useState, useRef, useEffect } from "react";
import CanvasArea from "./components/CanvasArea";
import Toolbar from "./components/Toolbar";

export default function App() {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const videoRefs = useRef({});

  useEffect(() => {
    const saved = localStorage.getItem("canvasState");
    if (saved) {
      setShapes(JSON.parse(saved));
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <Toolbar
        shapes={shapes}
        setShapes={setShapes}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        undoStackRef={undoStackRef}
        redoStackRef={redoStackRef}
        videoRefs={videoRefs}
      />
      <CanvasArea
        shapes={shapes}
        setShapes={setShapes}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        undoStackRef={undoStackRef}
        redoStackRef={redoStackRef}
        videoRefs={videoRefs}
      />
    </div>
  );
}
