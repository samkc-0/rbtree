// components/graph.tsx
import { Vector3, Object3D, Plane } from "three";
import type { VertexType, EdgeType } from "@/types/graph";
import { Line } from "@react-three/drei/native";
import { useRef, useState, useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useGraph } from "@/stores/use-graph";

const BASE_RADIUS = 6;
const LONG_PRESS_DURATION = 500; // ms

type GraphProps = {
  vertices: VertexType[];
  edges: EdgeType[];
  position: { x: number; y: number; z: number };
};

function Vertex2D({
  x,
  y,
  z,
  value,
  uuid,
  nodeColor = "white",
  textColor = "white",
}: VertexType) {
  const r = value + BASE_RADIUS;
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const floorPlane = useRef<Plane>(new Plane(new Vector3(0, 0, 1), 0));
  const planeIntersectPoint = useRef<Vector3>(new Vector3());
  const ref = useRef<Object3D>(null!);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const didLongPress = useRef<boolean>(false);

  const {
    setVertexPosition,
    yankVertex,
    attachVertex,
    cancelYank,
    isYanked,
    canAttachTo,
    yankedVertexId,
  } = useGraph();

  const vertexIsYanked = isYanked(uuid);
  const canBeAttachedTo = canAttachTo(uuid);
  const somethingIsYanked = yankedVertexId !== null;

  // Determine visual color based on state
  const getColor = useCallback(() => {
    if (isDragging) return "silver";
    if (vertexIsYanked) return "orange";
    if (canBeAttachedTo) return "limegreen";
    return nodeColor;
  }, [isDragging, vertexIsYanked, canBeAttachedTo, nodeColor]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    didLongPress.current = false;

    // If something is yanked and we tap on a valid target, attach to it
    if (somethingIsYanked && canBeAttachedTo) {
      // For simplicity, default to "left" child - you could add UI to choose
      attachVertex(uuid, "left");
      return;
    }

    // If this vertex is yanked and we tap it, cancel the yank
    if (vertexIsYanked && uuid === yankedVertexId) {
      cancelYank();
      return;
    }

    // Start long press detection for yanking
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      yankVertex(uuid);
    }, LONG_PRESS_DURATION);

    setIsDragging(true);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    setIsDragging(false);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    // If we move while pressing, cancel the long press detection
    if (longPressTimer.current && isDragging) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!isDragging) return;

    event.ray.intersectPlane(floorPlane.current, planeIntersectPoint.current);
    setVertexPosition(
      uuid,
      planeIntersectPoint.current.x,
      planeIntersectPoint.current.y,
      z,
    );
  };

  // Visual indicator for attachment points
  const showAttachmentIndicator = canBeAttachedTo;

  return (
    <object3D
      ref={ref}
      onPointerMove={handlePointerMove}
      position={[x, y, z]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Main vertex cylinder */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 5]} />
        <meshBasicMaterial
          color={getColor()}
          transparent={vertexIsYanked}
          opacity={vertexIsYanked ? 0.7 : 1}
        />
      </mesh>

      {/* Attachment indicator ring */}
      {showAttachmentIndicator && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[r + 3, 1.5, 8, 32]} />
          <meshBasicMaterial color="limegreen" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Yanked indicator ring */}
      {vertexIsYanked && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[r + 3, 1.5, 8, 32]} />
          <meshBasicMaterial color="orange" transparent opacity={0.6} />
        </mesh>
      )}
    </object3D>
  );
}

// Renders edges that are part of the yanked subtree with different styling
function YankedEdge({
  edge,
  vertices,
  z,
}: {
  edge: EdgeType;
  vertices: VertexType[];
  z: number;
}) {
  const source = vertices.find((v) => v.uuid === edge.source);
  const target = vertices.find((v) => v.uuid === edge.target);

  if (!source || !target) return null;

  const start = new Vector3(source.x, source.y, z);
  const end = new Vector3(target.x, target.y, z);

  return (
    <Line
      points={[start, end]}
      color="orange"
      lineWidth={5}
      transparent
      opacity={0.6}
      dashed
      dashSize={3}
      gapSize={2}
    />
  );
}

export function Graph2D({ vertices, edges, position }: GraphProps) {
  const { disconnectedEdges, yankedVertexId } = useGraph();

  return (
    <group>
      {vertices.map((v) => (
        <Vertex2D
          key={v.uuid}
          x={v.x}
          y={v.y}
          z={position.z}
          uuid={v.uuid}
          value={v.value}
          nodeColor={v.nodeColor}
          textColor={v.textColor}
        />
      ))}

      {/* Regular edges */}
      {edges.map((e) => {
        const source = vertices.find((v) => v.uuid === e.source);
        if (!source) throw new Error(`badly formed edge: ${e}`);

        const target = vertices.find((v) => v.uuid === e.target);
        if (!target) throw new Error(`badly formed edge: ${e}`);

        const start = new Vector3(source.x, source.y, position.z);
        const end = new Vector3(target.x, target.y, position.z);

        return (
          <Line
            key={e.uuid}
            points={[start, end]}
            color="black"
            lineWidth={5}
          />
        );
      })}

      {/* Disconnected edges (yanked subtree) - rendered with different style */}
      {disconnectedEdges.map((e) => (
        <YankedEdge key={e.uuid} edge={e} vertices={vertices} z={position.z} />
      ))}
    </group>
  );
}

