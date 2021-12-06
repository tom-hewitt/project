import { store, useStore } from "../../../project";
import { sceneObject } from "../../../project/sceneObject";
import { Node } from "../Tree";
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
      <Node<sceneObject>
        id={sceneClass.root}
        selector={(id) => (store: store) => store.project.sceneObjects[id]}
        selected={selected}
        select={select}
      >
        {(node) => <TreeObject object={node} />}
      </Node>
    </div>
  );
}

interface TreeObjectProps {
  object: sceneObject;
}

function TreeObject({ object }: TreeObjectProps) {
  return (
    <div className={styles.treeObject}>
      <Icon object={object} /> {object.name}
    </div>
  );
}

function Icon({ object }: TreeObjectProps) {
  switch (object.type) {
    case "Root": {
      return <GroupIcon />;
    }
    case "Mesh": {
      return <MeshIcon />;
    }
    case "Instance": {
      return null;
    }
  }
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

function GroupIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 7.5C3 8.05228 2.55228 8.5 2 8.5C1.44772 8.5 1 8.05228 1 7.5C1 6.94771 1.44772 6.5 2 6.5C2.55228 6.5 3 6.94771 3 7.5Z"
        fill="#D6D6D6"
        fillOpacity="0.5"
      />
      <path
        d="M6 2.5C6 3.05228 5.55228 3.5 5 3.5C4.44772 3.5 4 3.05228 4 2.5C4 1.94771 4.44772 1.5 5 1.5C5.55228 1.5 6 1.94771 6 2.5Z"
        fill="#D6D6D6"
        fillOpacity="0.5"
      />
      <path
        d="M9 7.5C9 8.05228 8.55228 8.5 8 8.5C7.44772 8.5 7 8.05228 7 7.5C7 6.94771 7.44772 6.5 8 6.5C8.55228 6.5 9 6.94771 9 7.5Z"
        fill="#D6D6D6"
        fillOpacity="0.5"
      />
    </svg>
  );
}
