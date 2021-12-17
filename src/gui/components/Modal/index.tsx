import { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./styles.module.css";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return createPortal(
    <div className={styles.modal} onClick={onClose}>
      {children}
    </div>,
    document.body
  );
}
