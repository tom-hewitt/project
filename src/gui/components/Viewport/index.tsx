import { Canvas } from "@react-three/fiber";
import {
  createInstance,
  createMesh,
  rootObject,
  sceneObjectId,
} from "../../../project/sceneObject";
import styles from "./styles.module.css";
import { OrbitControls } from "@react-three/drei";
import { SceneObject } from "../../../3d/Object";
import React, { useContext, useEffect } from "react";
import { useStore } from "../../../project";
import { Drag, Droppable } from "../../dnd";
import { sceneClass } from "../../../project/class";
import { ThemeContext } from "../../Project";
import { isLight } from "../../utils";
import * as THREE from "three";

interface ViewportProps {
  id: sceneObjectId;
}

export default function Viewport({ id }: ViewportProps) {
  const sceneClass = useStore(
    (store) => store.project.classes[id]
  ) as sceneClass;

  if (!sceneClass.root) {
    throw new Error("Class is not a Scene");
  }

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

  const root = useStore(
    (store) => store.project.sceneObjects[sceneClass.root]
  ) as rootObject;

  const { light, setLight } = useContext(ThemeContext);

  useEffect(
    () => setLight(isLight(new THREE.Color(root.attributes.background))),
    [root.attributes.background]
  );

  return (
    <Droppable id={`viewport ${id}`} onDrop={onDrop}>
      {({ drop }) => (
        <Canvas
          className={styles.canvas}
          dpr={Math.max(window.devicePixelRatio, 2)}
          style={{
            backgroundColor: new THREE.Color(
              root.attributes.background
            ).getStyle(),
          }}
          onPointerMissed={() => selectObject(null)}
          {...drop}
        >
          <OrbitControls />
          <color attach="background" args={[root.attributes.background]} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />

          <SceneObject id={sceneClass.root} />
        </Canvas>
      )}
    </Droppable>
  );
}
