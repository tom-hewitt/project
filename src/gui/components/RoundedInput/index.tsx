import { ReactNode } from "react";
import styles from "./styles.module.css";

interface InputProps {
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  setValue: (value: string) => void;
  children?: ReactNode;
}

export function RoundedInput({
  placeholder,
  autoFocus,
  value,
  setValue,
  children,
}: InputProps) {
  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text"
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {children}
    </div>
  );
}
