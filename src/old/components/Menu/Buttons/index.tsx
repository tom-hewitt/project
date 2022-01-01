import { motion } from "framer-motion";
import { useContext } from "react";
import shallow from "zustand/shallow";
import { useStore } from "../../../project";
import { PlayIcon, UndoIcon, RedoIcon } from "../../../icons";
import { ThemeContext } from "../../Project";
import styles from "./styles.module.css";

export default function Buttons() {
  const { light } = useContext(ThemeContext);

  const { undo, redo, canUndo, canRedo } = useStore(
    (store) => ({
      undo: store.undo,
      redo: store.redo,
      canUndo: store.canUndo,
      canRedo: store.canRedo,
    }),
    shallow
  );

  return (
    <div
      className={styles.buttons}
      style={{ color: light ? "#353535" : "#D6D6D6" }}
    >
      <Button>
        <PlayIcon />
      </Button>
      <Button onClick={undo} disabled={!canUndo}>
        <UndoIcon />
      </Button>
      <Button onClick={redo} disabled={!canRedo}>
        <RedoIcon />
      </Button>
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
