import { useContext } from "react";
import { Window } from "..";
import { useStore } from "../../../../project";
import {
  attribute,
  classDef,
  classId,
  getAttributes,
} from "../../../../project/class";
import { ThemeContext } from "../../../Project";
import { HorizontalSpacer } from "../../Spacer";
import { Attribute } from "./Attribute";
import styles from "./styles.module.css";

interface ClassWindowProps {
  classDef: classDef;
}

export function ClassWindow({ classDef }: ClassWindowProps) {
  const attributes = useStore((store) => getAttributes(store, classDef.id));

  return (
    <Window>
      <span className={styles.name}>{classDef.name}</span>
      <span className={styles.subheading}>Attributes</span>
      {Object.entries(attributes).map(([id, attribute]) => (
        <Attribute attribute={attribute} classId={classDef.id} key={id} />
      ))}
      <span className={styles.subheading}>Methods</span>
    </Window>
  );
}
