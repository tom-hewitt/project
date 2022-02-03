import { forwardRef, KeyboardEventHandler, MouseEventHandler } from "react";
import { grid, input, shadowElement } from "./styles.css";

interface AutogrowInputProps {
  value: string;
  onChange: (value: string) => void;
  onMouseDown?: MouseEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onBlur?: () => void;
}

export const AutogrowInput = forwardRef<HTMLInputElement, AutogrowInputProps>(
  ({ value, onChange, onMouseDown, onKeyDown, onBlur }, ref) => {
    return (
      <div className={grid}>
        <input
          ref={ref}
          className={input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          size={1}
        />
        <span className={shadowElement}>{value}</span>
      </div>
    );
  }
);
