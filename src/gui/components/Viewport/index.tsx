import { Canvas } from "@react-three/fiber";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import {
  createInstance,
  createMesh,
  sceneObjectId,
} from "../../../project/sceneObject";
import styles from "./styles.module.css";
import { OrbitControls } from "@react-three/drei";
import { SceneObject } from "../Object";
import React, { createContext, useState } from "react";
import { useStore } from "../../../project";
import { Drag, Droppable } from "../../dnd";

interface ViewportProps {
  id: sceneObjectId;
  type: string;
}

interface ObjectRef {
  current: THREE.Object3D;
}

export default function Viewport({ id, type }: ViewportProps) {
  const sceneClass = useStore((store) =>
    type === "Level" ? store.project.levels[id] : store.project.sceneClasses[id]
  );

  const execute = useStore((store) => store.execute);

  const selectObject = useStore((store) => store.selectObject);

  const onDrop = ({ data }: Drag) => {
    switch (data.type) {
      case "Class": {
        execute(createInstance(data.id, sceneClass.root));
        break;
      }
      case "Model": {
        execute(createMesh(data.name, sceneClass.root));
      }
    }
  };

  return (
    <Droppable id={`viewport ${id}`} onDrop={onDrop}>
      {({ drop }) => (
        <Canvas
          className={styles.canvas}
          dpr={Math.max(window.devicePixelRatio, 2)}
          style={{
            backgroundColor: type === "Level" ? "#C4C4C4" : "#252525",
          }}
          onPointerMissed={() => selectObject(null)}
          {...drop}
        >
          <OrbitControls />
          <color
            attach="background"
            args={[type === "Level" ? 0xc4c4c4 : 0x252525]}
          />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />

          <SceneObject id={sceneClass.root} />
        </Canvas>
      )}
    </Droppable>
  );
}
