import { useEffect, useState } from "react";
import { Window } from "..";
import { useStore } from "../../../../project";
import { attribute, classDef, getAttributes } from "../../../../project/class";
import { AddButton } from "../../AddButton";
import { HorizontalSpacer } from "../../Spacer";
import { Subheading } from "../../Subheading";
import { Attribute, AttributeWindow } from "./Attribute";
import { AddMenu } from "./Attribute/AddMenu";
import styles from "./styles.module.css";

interface ClassWindowProps {
  classDef: classDef;
}

export function ClassWindow({ classDef }: ClassWindowProps) {
  const attributes = useStore((store) => getAttributes(store, classDef.id));

  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null
  );

  return (
    <>
      <Window>
        <div className={styles.header}>
          <span className={styles.name}>{classDef.name}</span>
          <HorizontalSpacer />
          <span className={styles.parent}>{classDef.parent}</span>
        </div>
        <Subheading>
          ATTRIBUTES <HorizontalSpacer />
          <AddButton>
            {(props) => <AddMenu classId={classDef.id} {...props} />}
          </AddButton>
        </Subheading>
        {Object.entries(attributes).map(([id, attribute]) => (
          <Attribute
            attribute={attribute}
            classId={classDef.id}
            key={id}
            onClick={() => setSelectedAttribute(id)}
            selected={id === selectedAttribute}
          />
        ))}
        <Subheading>METHODS</Subheading>
      </Window>
      {selectedAttribute && attributes[selectedAttribute] ? (
        <AttributeWindow
          attribute={attributes[selectedAttribute]}
          classId={classDef.id}
          onClose={() => setSelectedAttribute(null)}
        />
      ) : null}
    </>
  );
}
