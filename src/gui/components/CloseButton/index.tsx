import { CloseIcon } from "../../icons";
import styles from "./styles.module.css";

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <div className={styles.button} onClick={onClick}>
      <CloseIcon />
    </div>
  );
}
