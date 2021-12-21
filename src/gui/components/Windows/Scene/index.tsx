import {
  deleteObject,
  sceneObject,
  sceneObjectId,
} from "../../../../project/sceneObject";
import { Window } from "..";
import styles from "./styles.module.css";
import Tree from "../../Tree";
import { store, useStore } from "../../../../project";
import { CloseIcon, GroupIcon, MeshIcon } from "../../../icons";
import { useRef, useState } from "react";
import { AddMenu } from "./AddMenu";
import { HorizontalSpacer } from "../../Spacer";
import { motion } from "framer-motion";

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
        <HorizontalSpacer />
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
  hide?: boolean;
}

function AddButton({ parent, hide }: AddButtonProps) {
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
  const execute = useStore((store) => store.execute);

  return (
    <motion.div
      className={styles.treeObject}
      initial="initial"
      whileHover="hover"
    >
      <Icon object={object} /> {object.name}
      <HorizontalSpacer />
      <motion.div
        className={styles.delete}
        onClick={() => {
          execute(deleteObject(object.id));
        }}
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.1 }}
      >
        <CloseIcon />
      </motion.div>
      <motion.div
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.1 }}
      >
        <AddButton parent={object.id} />
      </motion.div>
    </motion.div>
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
