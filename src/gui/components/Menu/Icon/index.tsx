import { motion } from "framer-motion";
import { ClassIcon } from "../../../icons";
import styles from "./styles.module.css";

export function Icon() {
  return (
    <motion.div
      className={styles.icon}
      initial={{ scale: 1, boxShadow: "0px 2px 10px rgba(0, 0, 0, 0)" }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.25)",
      }}
      transition={{ duration: 0.1 }}
    >
      <ClassIcon />
    </motion.div>
  );
}
