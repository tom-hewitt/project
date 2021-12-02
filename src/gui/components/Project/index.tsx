import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../../project";
import Library from "../Library";
import Toolbar from "../Toolbar";
import { Canvas, Windows } from "../Window";
import styles from "./styles.module.css";
import { Toaster, resolveValue } from "react-hot-toast";
import Toasts from "../Toast";

export default function Project() {
  return (
    <div className={styles.project}>
      <Canvas />
      <Library />
      <Toolbar />
      <Windows />
      <Toasts />
    </div>
  );
}
