import { ReactNode, useRef, useState } from "react";
import styles from "./styles.module.css";

interface AddMenuProps {
  left: number;
  top: number;
  right: number;
  bottom: number;
  onClose: () => void;
}

interface AddButtonProps {
  children: (props: AddMenuProps) => JSX.Element;
}

export function AddButton({ children }: AddButtonProps) {
  const [showAdd, setShowAdd] = useState(false);

  const addRef = useRef<HTMLDivElement>(null);

  const addRect = addRef.current?.getBoundingClientRect();

  return (
    <>
      <div
        className={styles.add}
        ref={addRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setShowAdd(true);
        }}
      >
        +
      </div>
      {showAdd && addRect
        ? children({
            left: addRect.left - 10,
            top: addRect.bottom + 5,
            right: addRect.right + 10,
            bottom: addRect.top + 5,
            onClose: () => setShowAdd(false),
          })
        : null}
    </>
  );
}
