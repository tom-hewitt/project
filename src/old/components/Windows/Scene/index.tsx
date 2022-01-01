import {
  deleteObject,
  sceneObject,
  sceneObjectId,
} from "../../../project/sceneObject";
import { Window } from "..";
import styles from "./styles.module.css";
import Tree from "../../Tree";
import { store, useStore } from "../../../project";
import { CloseIcon, GroupIcon, MeshIcon } from "../../../icons";
import { useRef, useState } from "react";
import { AddMenu } from "./AddMenu";
import { HorizontalSpacer } from "../../Spacer";
import { motion } from "framer-motion";
import { Subheading } from "../../Subheading";
import { AddButton } from "../../AddButton";

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
      <Subheading>
        CHILDREN
        <HorizontalSpacer />
        <AddObjectButton parent={root} />
      </Subheading>
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

function AddObjectButton({ parent, hide }: AddButtonProps) {
  const [showAdd, setShowAdd] = useState(false);

  const addRef = useRef<HTMLDivElement>(null);

  const addRect = addRef.current?.getBoundingClientRect();

  return (
    <AddButton>{(props) => <AddMenu parent={parent} {...props} />}</AddButton>
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
      <div className={styles.icon}>
        <Icon object={object} />
      </div>
      {object.name}
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
        className={styles.add}
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.1 }}
      >
        <AddObjectButton parent={object.id} />
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
