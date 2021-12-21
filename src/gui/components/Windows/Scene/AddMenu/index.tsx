import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { urls } from "../../../../../3d/Object/Mesh";
import { useStore } from "../../../../../project";
import {
  createInstance,
  createMesh,
  sceneObjectId,
} from "../../../../../project/sceneObject";
import { MeshIcon } from "../../../../icons";
import Modal from "../../../Modal";
import styles from "./styles.module.css";

interface AddMenuProps {
  top: number;
  parent: sceneObjectId;
  onClose: () => void;
}

const primitives = ["Box", "Plane"];

export function AddMenu({ top, parent, onClose }: AddMenuProps) {
  const [page, setPage] = useState("");

  const execute = useStore((store) => store.execute);

  const classes = useStore((store) =>
    Object.entries(store.project.classes).map(([id, classDef]) => [
      id,
      classDef.name,
    ])
  );

  return (
    <Modal onClose={onClose}>
      <motion.div
        className={styles.addMenu}
        style={{ top }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {page === "" ? (
          <>
            <Item onClick={() => setPage("Mesh")}>
              <MeshIcon /> Mesh
            </Item>
            <Item onClick={() => setPage("Instance")}>Instance</Item>
          </>
        ) : null}
        {page === "Mesh" ? (
          <>
            <Item onClick={() => setPage("Model")}>
              <MeshIcon /> Model
            </Item>
            <Item onClick={() => setPage("Primitive")}>
              <MeshIcon /> Primitive
            </Item>
          </>
        ) : null}
        {page === "Model"
          ? Object.keys(urls).map((model) => (
              <Item
                onClick={() => {
                  execute(createMesh(model, parent));
                  onClose();
                }}
                key={model}
              >
                {model}
              </Item>
            ))
          : null}
        {page === "Primitive"
          ? primitives.map((model) => (
              <Item
                onClick={() => {
                  execute(createMesh(model, parent));
                  onClose();
                }}
                key={model}
              >
                {model}
              </Item>
            ))
          : null}
        {page === "Instance"
          ? classes.map(([id, name]) => (
              <Item
                onClick={() => {
                  execute(createInstance(id, parent));
                  onClose();
                }}
                key={id}
              >
                {name}
              </Item>
            ))
          : null}
      </motion.div>
    </Modal>
  );
}

interface ItemProps {
  children: ReactNode;
  onClick?: () => void;
}

function Item({ children, onClick }: ItemProps) {
  return (
    <motion.div
      className={styles.item}
      onClick={onClick}
      initial={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
    >
      {children}
    </motion.div>
  );
}
