import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Text, Image, Transformer } from "react-konva";

const pushHistory = (undoRef, redoRef, shapes) => {
  undoRef.current.push(JSON.parse(JSON.stringify(shapes)));
  redoRef.current = [];
};
export default function CanvasArea({
  shapes,
  setShapes,
  selectedId,
  setSelectedId,
  undoStackRef,
  redoStackRef,
  videoRefs,
}) {
  const transformerRef = useRef();
  const stageRef = useRef();

  useEffect(() => {
    const stage = stageRef.current;
    const tr = transformerRef.current;

    if (selectedId) {
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        tr.nodes([selectedNode]);
        tr.getLayer().batchDraw();
      }
    } else {
      tr.nodes([]);
      tr.getLayer().batchDraw();
    }
  }, [selectedId, shapes]);

  const [images, setImages] = useState({});
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    shapes.forEach((shape) => {
      if (shape.type === "image" && !images[shape.id]) {
        const img = new window.Image();
        img.src = shape.src;
        img.onload = () => {
          setImages((prev) => ({ ...prev, [shape.id]: img }));
        };
      } else if (shape.type === "video" && !videoRefs.current[shape.id]) {
        const video = document.createElement("video");
        video.src = shape.src;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.playsInline = true;
        console.log(videoRefs.current[shape.id]);
        videoRefs.current[shape.id] = video;
        console.log(videoRefs.current[shape.id]);
        video.onloadeddata = () => {
          video.play();
          setUpdate(!update);
        };
      }
    });
  }, [shapes]);

  useEffect(() => {
    const layer = stageRef.current?.findOne("Layer");
    if (!layer) return;
    const anim = () => {
      layer.batchDraw();
      requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }, []);

  const handleTransformEnd = (e) => {
    pushHistory(undoStackRef, redoStackRef, shapes);

    const node = transformerRef.current.nodes()[0];
    const id = node.id();

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // reset scale
    node.scaleX(1);
    node.scaleY(1);

    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === id
          ? {
              ...shape,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            }
          : shape
      )
    );
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth - 200}
      height={window.innerHeight}
      style={{ background: "#eee" }}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) {
          setSelectedId(null);
        }
      }}
    >
      <Layer>
        {shapes.map((shape) => {
          if (shape.type === "text") {
            return (
              <Text
                key={shape.id}
                id={shape.id}
                {...shape}
                draggable
                onClick={() => setSelectedId(shape.id)}
                onDragEnd={(e) => {
                  pushHistory(undoStackRef, redoStackRef, shapes);
                  const updated = shapes.map((s) =>
                    s.id === shape.id
                      ? { ...s, x: e.target.x(), y: e.target.y() }
                      : s
                  );
                  setShapes(updated);
                }}
              />
            );
          } else if (shape.type === "image" && images[shape.id]) {
            return (
              <Image
                key={shape.id}
                id={shape.id}
                image={images[shape.id]}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rotation={shape.rotation}
                draggable
                onClick={() => setSelectedId(shape.id)}
                onDragEnd={(e) => {
                  pushHistory(undoStackRef, redoStackRef, shapes);
                  const updated = shapes.map((s) =>
                    s.id === shape.id
                      ? { ...s, x: e.target.x(), y: e.target.y() }
                      : s
                  );
                  setShapes(updated);
                }}
              />
            );
          } else if (shape.type === "video") {
            console.log("video is getting called", videoRefs.current[shape.id]);
            return (
              <Image
                key={shape.id}
                id={shape.id}
                image={videoRefs.current[shape.id]}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rotation={shape.rotation}
                draggable
                onClick={() => setSelectedId(shape.id)}
                onDragEnd={(e) => {
                  pushHistory(undoStackRef, redoStackRef, shapes);
                  const updated = shapes.map((s) =>
                    s.id === shape.id
                      ? { ...s, x: e.target.x(), y: e.target.y() }
                      : s
                  );
                  setShapes(updated);
                }}
              />
            );
          }
          return null;
        })}
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          onTransformEnd={handleTransformEnd}
        />
      </Layer>
    </Stage>
  );
}
