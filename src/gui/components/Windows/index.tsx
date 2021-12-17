import { motion } from "framer-motion";
import { ReactNode, useContext } from "react";
import { useStore } from "../../../project";
import { sceneClass } from "../../../project/class";
import { ThemeContext } from "../../Project";
import Viewport from "../Viewport";
import { ClassWindow } from "./Class";
import SceneWindow from "./Scene";
import styles from "./styles.module.css";

export function Canvas() {
  const tab = useStore((store) =>
    store.selectedTab !== undefined
      ? store.openTabs[store.tabs[store.selectedTab]]
      : undefined
  );

  if (tab) {
    return (
      <div className={styles.canvas}>
        <Viewport id={tab.id} />
      </div>
    );
  } else {
    return <div className={styles.empty}></div>;
  }
}

export function Windows() {
  const tab = useStore((store) =>
    store.selectedTab !== undefined
      ? store.openTabs[store.tabs[store.selectedTab]]
      : undefined
  );

  if (tab) {
    return <SceneClassWindows id={tab.id} />;
  } else {
    return null;
  }
}

interface WindowProps {
  children: ReactNode;
  height?: number;
}

export function Window({ children, height }: WindowProps) {
  const { light } = useContext(ThemeContext);

  return (
    <div
      className={styles.window}
      style={{
        backgroundColor: light ? "#BABABA" : "#353535",
        color: light ? "#353535" : "#D6D6D6",
        height,
      }}
    >
      {children}
    </div>
  );
}

interface SceneClassWindowsProps {
  id: string;
}

function SceneClassWindows({ id }: SceneClassWindowsProps) {
  const sceneClass = useStore(
    (store) => store.project.classes[id]
  ) as sceneClass;

  if (!sceneClass.root) {
    throw new Error("Class is not a scene");
  }

  return (
    <>
      <div className={styles.left}>
        <ClassWindow sceneClass={sceneClass} />
      </div>
      <div className={styles.right}>
        <SceneWindow root={sceneClass.root} />
      </div>
    </>
  );
}
