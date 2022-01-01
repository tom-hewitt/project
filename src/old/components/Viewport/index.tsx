import { Canvas } from "@react-three/fiber";
import {
  createInstance,
  createMesh,
  rootObject,
  sceneObjectId,
} from "../../project/sceneObject";
import styles from "./styles.module.css";
import { OrbitControls } from "@react-three/drei";
import { SceneObject } from "../../../3d/Object";
import React, { useContext, useEffect } from "react";
import { useStore } from "../../project";
import { Drag, Droppable } from "../../dragger/dnd";
import { ThemeContext } from "../Project";
import { isLight } from "../../utils";
import * as THREE from "three";

interface ViewportProps {
  rootId: sceneObjectId;
}

export default function Viewport({ rootId }: ViewportProps) {
  const execute = useStore((store) => store.execute);

  const selectObject = useStore((store) => store.selectObject);

  const root = useStore(
    (store) => store.project.sceneObjects[rootId]
  ) as rootObject;

  const { light, setLight } = useContext(ThemeContext);

  useEffect(
    () => setLight(isLight(new THREE.Color(root.attributes.background))),
    [root.attributes.background]
  );

  return (
    <Canvas
      className={styles.canvas}
      dpr={Math.max(window.devicePixelRatio, 2)}
      style={{
        backgroundColor: new THREE.Color(root.attributes.background).getStyle(),
      }}
      onPointerMissed={() => selectObject(null)}
    >
      <OrbitControls />
      <color attach="background" args={[root.attributes.background]} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <SceneObject id={rootId} />
    </Canvas>
  );
}
