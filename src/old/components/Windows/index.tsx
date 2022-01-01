import { motion } from "framer-motion";
import { ReactNode, useContext } from "react";
import { useStore } from "../../project";
import { sceneClass } from "../../project/class";
import { ThemeContext } from "../Project";
import Viewport from "../Viewport";
import { ClassWindow } from "./Class";
import SceneWindow from "./Scene";
import styles from "./styles.module.css";

export function Windows() {
  const tab = useStore((store) => store.selectedTab());

  if (tab) {
    return <ClassWindows id={tab.id} />;
  } else {
    return null;
  }
}

interface WindowProps {
  children: ReactNode;
  height?: number;
}

export function Window({ children, height }: WindowProps) {
  return (
    <div
      className={styles.window}
      style={{
        height,
      }}
    >
      {children}
    </div>
  );
}

interface ClassWindowsProps {
  id: string;
}

function ClassWindows({ id }: ClassWindowsProps) {
  const classDef = useStore((store) => store.project.classes[id]);

  return (
    <>
      {classDef.attributes.Scene &&
      classDef.attributes.Scene.literal?.type === "Object Reference" &&
      classDef.attributes.Scene.literal?.objectClass === "Object 3D" ? (
        <>
          <Viewport rootId={classDef.attributes.Scene.literal.value} />
          <div className={styles.right}>
            <SceneWindow root={classDef.attributes.Scene.literal.value} />
          </div>
        </>
      ) : null}

      <div className={styles.left}>
        <ClassWindow classDef={classDef} />
      </div>
    </>
  );
}
