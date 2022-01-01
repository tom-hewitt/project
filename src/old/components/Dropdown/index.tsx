import { motion } from "framer-motion";
import { ReactNode } from "react";
import Modal from "../Modal";
import styles from "./styles.module.css";

interface DropdownProps {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  onClose: () => void;
  children: ReactNode;
}

export function Dropdown({
  left,
  top,
  right,
  bottom,
  onClose,
  children,
}: DropdownProps) {
  return (
    <Modal onClose={onClose}>
      <motion.div
        className={styles.dropdown}
        style={{ left, top, right, bottom }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </Modal>
  );
}
