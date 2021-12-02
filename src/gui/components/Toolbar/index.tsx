import { motion } from "framer-motion";
import React from "react";
import shallow from "zustand/shallow";
import { useStore } from "../../../project";
import { Tabs } from "../Tabs";
import styles from "./styles.module.css";

export default function Toolbar() {
  const { libraryOpen, toggleLibrary, undo, redo, canUndo, canRedo } = useStore(
    (store) => ({
      libraryOpen: store.libraryOpen,
      toggleLibrary: store.toggleLibrary,
      undo: store.undo,
      redo: store.redo,
      canUndo: store.canUndo,
      canRedo: store.canRedo,
    }),
    shallow
  );

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.buttons}>
          <Button>
            <PlayIcon />
          </Button>
          <Button onClick={toggleLibrary}>
            <LibraryIcon filled={libraryOpen} />
          </Button>
          <Button onClick={undo} disabled={!canUndo}>
            <UndoIcon />
          </Button>
          <Button onClick={redo} disabled={!canRedo}>
            <RedoIcon />
          </Button>
        </div>
        <Tabs />
      </div>
    </div>
  );
}

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function Button({ onClick, disabled, children }: ButtonProps) {
  return (
    <motion.div
      className={styles.button}
      onClick={onClick}
      variants={{
        initial: {
          opacity: 1,
        },
        disabled: { opacity: 0.5 },
      }}
      initial={disabled ? "disabled" : "initial"}
      animate={disabled ? "disabled" : "initial"}
    >
      {children}
    </motion.div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 13V1L10.5 6.64706L1.5 13Z"
        stroke="#D6D6D6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LibraryIconProps {
  filled?: boolean;
}

function LibraryIcon({ filled }: LibraryIconProps) {
  return (
    <svg
      width="19"
      height="16"
      viewBox="0 0 19 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M1.5 13.2V2.8C1.5 2.15 2.14 1.5 2.78 1.5H7.26C8.22 1.5 8.22 3.45 9.18 3.45H16.22C16.86 3.45 17.5 4.1 17.5 4.75V13.2C17.5 13.85 16.86 14.5 16.22 14.5H2.78C2.14 14.5 1.5 13.85 1.5 13.2Z"
        stroke="#D6D6D6"
        strokeWidth="1.5"
        strokeLinejoin="round"
        animate={{
          fill: filled ? "rgba(214, 214, 214, 1)" : "rgba(214, 214, 214, 0)",
        }}
      />
    </svg>
  );
}

export function UndoIcon() {
  return (
    <svg
      width="19"
      height="13"
      viewBox="0 0 19 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.5 3.7H16.22C16.86 3.7 17.5 4.35 17.5 5C17.5 5.65 17.5 9.5495 17.5 10.1995C17.5 10.8495 16.86 11.4995 16.22 11.4995C15.58 11.4995 3.42 11.4995 2.78 11.4995C2.14 11.4995 1.5 10.8495 1.5 10.1995V6M9.5 3.7L11.5 0.5M9.5 3.7L11.5 6.5"
        stroke="#D6D6D6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RedoIcon() {
  return (
    <svg
      width="19"
      height="13"
      viewBox="0 0 19 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 6.0249C17.5 6.6749 17.5 9.57485 17.5 10.2249C17.5 10.8749 16.86 11.5249 16.22 11.5249C15.58 11.5249 3.42 11.5249 2.78 11.5249C2.14 11.5249 1.5 10.8749 1.5 10.2249C1.5 9.57485 1.5 4.72461 1.5 4.72461C1.5 4.07461 2.14 3.42461 2.78 3.42461C2.78 3.42461 8.54 3.47461 9.5 3.47461M9.5 3.47461L7.5 6.47461M9.5 3.47461L7.5 0.474609"
        stroke="#D6D6D6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
