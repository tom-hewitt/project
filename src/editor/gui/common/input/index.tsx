import { forwardRef, KeyboardEventHandler, MouseEventHandler } from "react";
import { grid, input, shadowElement } from "./styles.css";

interface AutogrowInputProps {
  value: string;
  onChange: (value: string) => void;
  onMouseDown?: MouseEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export const AutogrowInput = forwardRef<HTMLInputElement, AutogrowInputProps>(
  ({ value, onChange, onMouseDown, onKeyDown }, ref) => {
    return (
      <div className={grid}>
        <input
          ref={ref}
          className={input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          size={1}
        />
        <span className={shadowElement}>{value}</span>
      </div>
    );
  }
);
