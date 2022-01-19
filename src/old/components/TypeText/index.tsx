import { useRef } from "react";
import { primitiveTypeColors } from "../../../styles/typeColors";
import { primitive, primitiveType, type } from "../../project/type";
import styles from "./styles.module.css";

interface PrimitiveProps {
  primitive: primitive;
}

export function PrimitiveText({ primitive }: PrimitiveProps) {
  const ref = useRef<HTMLElement>(null);

  return (
    <span
      ref={ref}
      className={styles.typeText}
      style={{ color: primitiveTypeColors[primitive] }}
    >
      {primitive}
    </span>
  );
}

interface TypeTextProps {
  type: type;
}

export function TypeText({ type }: TypeTextProps) {
  switch (type.type) {
    case "Primitive": {
      return <PrimitiveText primitive={type.primitive} />;
    }
    case "Object Reference": {
      return (
        <span className={styles.typeText} style={{ color: "#737373" }}>
          {type.objectClass}
        </span>
      );
    }
    case "Array": {
      return (
        <span className={styles.typeText} style={{ color: "#737373" }}>
          Array{"<"}
          <TypeText type={type.itemType} />
          {">"}
        </span>
      );
    }
  }
}
