import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { Window } from "../..";
import { useStore } from "../../../../../project";
import {
  attribute,
  classId,
  renameAttribute,
} from "../../../../../project/class";
import { CloseButton } from "../../../CloseButton";
import { HorizontalSpacer } from "../../../Spacer";
import { TypeText } from "../../../TypeText";
import styles from "./styles.module.css";

interface AttributeProps {
  attribute: attribute;
  classId: classId;
  onClick: () => void;
  selected?: boolean;
}

export function Attribute({
  attribute,
  classId,
  onClick,
  selected,
}: AttributeProps) {
  const [name, setName] = useState(attribute.name);

  useEffect(() => {
    setName(attribute.name);
  }, [attribute.name]);

  const input = useRef<HTMLInputElement>(null);

  const execute = useStore((store) => store.execute);

  return (
    <motion.div
      className={styles.attribute}
      onClick={onClick}
      animate={{
        backgroundColor: selected
          ? "rgba(126, 126, 126, 0.3)"
          : "rgba(126, 126, 126, 0)",
      }}
    >
      <span className={styles.name}>{attribute.name}</span>
      {attribute.inheritedFrom !== classId ? (
        <span className={styles.inherited}>: {attribute.inheritedFrom}</span>
      ) : null}
      <HorizontalSpacer />
      <TypeText type={attribute.type} />
    </motion.div>
  );
}

interface AttributeWindowProps {
  attribute: attribute;
  classId: classId;
  onClose: () => void;
}

export function AttributeWindow({
  attribute,
  classId,
  onClose,
}: AttributeWindowProps) {
  const [name, setName] = useState(attribute.name);

  useEffect(() => {
    setName(attribute.name);
  }, [attribute.name]);

  const input = useRef<HTMLInputElement>(null);

  const execute = useStore((store) => store.execute);

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      input.current?.blur();
      execute(renameAttribute(classId, attribute.id, name));
    }
  };

  return (
    <Window>
      <div className={styles.header}>
        {attribute.inheritedFrom === classId ? (
          <input
            ref={input}
            className={styles.name}
            style={{ width: "100%" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={attribute.inheritedFrom !== classId}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <>
            <span className={styles.name}>{attribute.name}</span>
            <span className={styles.inherited}>
              : {attribute.inheritedFrom}
            </span>
            <HorizontalSpacer />
          </>
        )}
        <TypeText type={attribute.type} />
        <div className={styles.close}>
          <CloseButton onClick={onClose} />
        </div>
      </div>
    </Window>
  );
}
