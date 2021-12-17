import { sceneObject, sceneObjectId } from "../../../../project/sceneObject";
import { Window } from "..";
import styles from "./styles.module.css";
import Tree from "../../Tree";
import { store, useStore } from "../../../../project";
import { GroupIcon, MeshIcon } from "../../../icons";
import { useRef, useState } from "react";
import { AddMenu } from "./AddMenu";

interface SceneWindowProps {
  root: sceneObjectId;
}

export default function SceneWindow({ root }: SceneWindowProps) {
  const { selected, select } = useStore((store) => ({
    selected: store.selectedObject,
    select: store.selectObject,
  }));

  return (
    <Window height={200}>
      <div className={styles.subheading}>
        Scene
        <AddButton parent={root} />
      </div>
      <Tree<sceneObject>
        id={root}
        selector={(id) => (store: store) => store.project.sceneObjects[id]}
        selected={selected}
        select={select}
      >
        {(node) => <TreeObject object={node} />}
      </Tree>
    </Window>
  );
}

interface AddButtonProps {
  parent: sceneObjectId;
}

function AddButton({ parent }: AddButtonProps) {
  const [showAdd, setShowAdd] = useState(false);

  const addRef = useRef<HTMLDivElement>(null);

  const addRect = addRef.current?.getBoundingClientRect();

  return (
    <>
      <div
        className={styles.add}
        ref={addRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowAdd(true);
        }}
      >
        +
      </div>
      {showAdd ? (
        <AddMenu
          top={addRect ? addRect.bottom + 5 : 0}
          parent={parent}
          onClose={() => {
            setShowAdd(false);
          }}
        />
      ) : null}
    </>
  );
}

interface TreeObjectProps {
  object: sceneObject;
}

function TreeObject({ object }: TreeObjectProps) {
  return (
    <div className={styles.treeObject}>
      <Icon object={object} /> {object.name} <AddButton parent={object.id} />
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
