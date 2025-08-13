import { v4 as uuidv4 } from "uuid";

const pushHistory = (undoRef, redoRef, shapes) => {
  undoRef.current.push(JSON.parse(JSON.stringify(shapes)));
  redoRef.current = [];
};

export default function Toolbar({
  shapes,
  setShapes,
  selectedId,
  setSelectedId,
  undoStackRef,
  redoStackRef,
  videoRefs,
}) {
  const addText = () => {
    pushHistory(undoStackRef, redoStackRef, shapes);
    const newShape = {
      id: "uuidv4()",
      type: "text",
      text: "Hello World",
      x: 50,
      y: 50,
      width: 200,
      height: 30,
      rotation: 0,
      fontSize: 20,
    };
    setShapes([...shapes, newShape]);
  };

  const addImage = () => {
    pushHistory(undoStackRef, redoStackRef, shapes);
    const newShape = {
      id: uuidv4(),
      type: "image",
      src: "https://picsum.photos/200",
      x: 80,
      y: 80,
      width: 200,
      height: 150,
      rotation: 0,
    };
    setShapes([...shapes, newShape]);
  };

  const addVideo = () => {
    pushHistory(undoStackRef, redoStackRef, shapes);
    setShapes([
      ...shapes,
      {
        id: uuidv4(),
        type: "video",
        src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm",
        x: 100,
        y: 100,
        width: 320,
        height: 180,
        rotation: 0,
      },
    ]);
  };

  const moveSelected = (dx, dy) => {
    if (!selectedId) return;
    pushHistory(undoStackRef, redoStackRef, shapes);
    setShapes(
      shapes.map((shape) =>
        shape.id === selectedId
          ? { ...shape, x: shape.x + dx, y: shape.y + dy }
          : shape
      )
    );
  };

  const undo = () => {
    if (undoStackRef.current.length > 0) {
      const prev = undoStackRef.current.pop();
      redoStackRef.current.push(JSON.parse(JSON.stringify(shapes)));
      setShapes(prev);
    }
  };

  const redo = () => {
    if (redoStackRef.current.length > 0) {
      const next = redoStackRef.current.pop();
      undoStackRef.current.push(JSON.parse(JSON.stringify(shapes)));
      setShapes(next);
    }
  };

  const playVideo = () => {
    if (selectedId && videoRefs.current[selectedId]) {
      videoRefs.current[selectedId].play();
    }
  };

  const pauseVideo = () => {
    if (selectedId && videoRefs.current[selectedId]) {
      videoRefs.current[selectedId].pause();
    }
  };

  const stopVideo = () => {
    if (selectedId && videoRefs.current[selectedId]) {
      videoRefs.current[selectedId].pause();
      videoRefs.current[selectedId].currentTime = 0;
    }
  };

  const bringForward = () => {
    if (!selectedId) return;
    const index = shapes.findIndex((s) => s.id === selectedId);
    if (index === shapes.length - 1) return;
    pushHistory(undoStackRef, redoStackRef, shapes);
    const newShapes = [...shapes];
    const [moved] = newShapes.splice(index, 1);
    newShapes.splice(index + 1, 0, moved);
    setShapes(newShapes);
  };

  const sendBackward = () => {
    if (!selectedId) return;
    const index = shapes.findIndex((s) => s.id === selectedId);
    if (index === 0) return;
    pushHistory(undoStackRef, redoStackRef, shapes);
    const newShapes = [...shapes];
    const [moved] = newShapes.splice(index, 1);
    newShapes.splice(index - 1, 0, moved);
    setShapes(newShapes);
  };

  const saveCanvas = () => {
    localStorage.setItem("canvasState", JSON.stringify(shapes));
    alert("Canvas saved!");
  };

  const loadCanvas = () => {
    const saved = localStorage.getItem("canvasState");
    if (saved) {
      const parsed = JSON.parse(saved);
      setShapes(parsed);
      alert("Canvas loaded!");
    } else {
      alert("No saved canvas found.");
    }
  };

  return (
    <div style={{ width: 200, background: "#ccc", padding: 10 }}>
      <button onClick={addText}>Add Text</button>
      <br />
      <button onClick={addImage}>Add Image</button>
      <br />
      <button onClick={addVideo}>Add Video</button>
      <br />
      <hr />
      <button onClick={playVideo}>Play</button>
      <button onClick={pauseVideo}>Pause</button>
      <button onClick={stopVideo}>Stop</button>
      <hr />
      <div>Move Selected:</div>
      <button onClick={() => moveSelected(0, -10)}>⬆ Up</button>
      <button onClick={() => moveSelected(0, 10)}>⬇ Down</button>
      <button onClick={() => moveSelected(-10, 0)}>⬅ Left</button>
      <button onClick={() => moveSelected(10, 0)}>➡ Right</button>
      <hr />
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <hr />
      <div>Layer Order:</div>
      <button onClick={bringForward}>Bring Forward</button>
      <button onClick={sendBackward}>Send Backward</button>
      <hr />
      <div>Save / Load:</div>
      <button onClick={saveCanvas}>Save</button>
      <button onClick={loadCanvas}>Load</button>
    </div>
  );
}
