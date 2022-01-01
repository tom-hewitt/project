import { ReactNode } from "react";
import styles from "./styles.module.css";

interface SubheadingProps {
  children: ReactNode;
}

export function Subheading({ children }: SubheadingProps) {
  return <div className={styles.subheading}>{children}</div>;
}
