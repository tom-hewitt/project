import { useContext } from "react";
import { attribute, classId } from "../../../../../project/class";
import { ThemeContext } from "../../../../Project";
import { HorizontalSpacer } from "../../../Spacer";
import styles from "./styles.module.css";

interface AttributeProps {
  attribute: attribute;
  classId: classId;
}

export function Attribute({ attribute, classId }: AttributeProps) {
  const { light } = useContext(ThemeContext);

  return (
    <div className={styles.attribute}>
      <span
        className={styles.name}
        style={{
          fontWeight: attribute.inheritedFrom === classId ? "normal" : 600,
          color:
            attribute.overridenBy === classId
              ? light
                ? "#353535"
                : "#D6D6D6"
              : "#737373",
        }}
      >
        {attribute.name}
      </span>
      <HorizontalSpacer />
      <span className={styles.type} style={{ color: "#737373" }}>
        {attribute.type}
      </span>
    </div>
  );
}
