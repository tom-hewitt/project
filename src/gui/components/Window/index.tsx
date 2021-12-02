import { store, useStore } from "../../../project";
import { sceneObject } from "../../../project/sceneObject";
import Tree from "../Tree";
import Viewport from "../Viewport";
import styles from "./styles.module.css";

export function Canvas() {
  return (
    <div className={styles.canvas}>
      <CanvasElement />
    </div>
  );
}

function CanvasElement() {
  const tab = useStore((store) =>
    store.selectedTab !== undefined
      ? store.openTabs[store.tabs[store.selectedTab]]
      : undefined
  );

  if (tab) {
    switch (tab.type) {
      case "Level":
      case "Class": {
        return <Viewport id={tab.id} type={tab.type} />;
      }
    }
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
    switch (tab.type) {
      case "Level":
      case "Class": {
        return <SceneClassWindows id={tab.id} type={tab.type} />;
      }
    }
  } else {
    return null;
  }
}

interface SceneClassWindowsProps {
  id: string;
  type: "Level" | "Class";
}

function SceneClassWindows({ id, type }: SceneClassWindowsProps) {
  const sceneClass = useStore((store) =>
    type === "Level" ? store.project.levels[id] : store.project.sceneClasses[id]
  );
  const { selected, select } = useStore((store) => ({
    selected: store.selectedObject,
    select: store.selectObject,
  }));

  return (
    <div className={styles.sidebar}>
      <span className={styles.subheading}>Scene</span>
      <Tree<sceneObject>
        id={sceneClass.root}
        selector={(id) => (store: store) => store.project.sceneObjects[id]}
        selected={selected}
        select={select}
      >
        {(node) => <TreeObject object={node} />}
      </Tree>
    </div>
  );
}

interface TreeObjectProps {
  object: sceneObject;
}

function TreeObject({ object }: TreeObjectProps) {
  return (
    <div className={styles.treeObject}>
      <MeshIcon /> {object.name}
    </div>
  );
}

export function MeshIcon() {
  return (
    <svg
      width="10"
      height="11"
      viewBox="0 0 10 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 1.5L8.80423 4.26393L7.35114 8.73607H2.64886L1.19577 4.26393L5 1.5Z"
        stroke="#D6D6D6"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
