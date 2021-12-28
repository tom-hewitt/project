import { motion } from "framer-motion";
import { ReactNode } from "react";
import styles from "./styles.module.css";

interface CreateButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
}

export function CreateButton({
  onClick,
  disabled,
  type,
  children,
}: CreateButtonProps) {
  return (
    <motion.button
      className={styles.button}
      type={type}
      initial={{
        backgroundColor: "rgba(214, 214, 214, 0)",
        color: "#d6d6d6",
      }}
      whileHover={{
        backgroundColor: disabled
          ? "rgba(214, 214, 214, 0)"
          : "rgba(214, 214, 214, 1)",
        color: disabled ? "#d6d6d6" : "#353535",
      }}
      animate={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (!disabled) {
          onClick?.();
        }
      }}
    >
      {children}
    </motion.button>
  );
}
