import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "../../../../project";
import { createClass } from "../../../../project/class";
import Modal from "../../../Modal";
import styles from "./styles.module.css";

interface AddMenuProps {
  left: number;
  top: number;
  onClose: () => void;
}

export function ClosedTabsMenu({ top, left, onClose }: AddMenuProps) {
  const openTab = useStore((store) => store.openTab);

  const closedClasses = useStore((store) => store.closedClasses());

  return (
    <Modal onClose={onClose}>
      <motion.div
        className={styles.menu}
        style={{ top, left }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {closedClasses.map((id) => (
          <Item id={id} onClick={() => openTab(id)} key={id} />
        ))}
      </motion.div>
    </Modal>
  );
}

interface ItemProps {
  id: string;
  onClick: () => void;
}

function Item({ id, onClick }: ItemProps) {
  const name = useStore((store) => store.project.classes[id].name);

  return (
    <motion.div
      className={styles.item}
      onClick={onClick}
      initial={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
    >
      {name}
    </motion.div>
  );
}
