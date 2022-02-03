import { h2, subheading } from "../../../styles/globals.css";
import { useClass, useStore } from "../../state";
import { AttributeHeader, MethodHeader } from "../ClassDef";
import { classCard, classMenuStyle } from "./styles.css";

interface ClassesMenuProps {
  onSelect: (c: string) => void;
}

export function ClassesMenu({ onSelect }: ClassesMenuProps) {
  const classes = useStore((store) => store.userClasses);

  return (
    <div className={classMenuStyle}>
      {classes.map((c) => (
        <ClassCard c={c} onSelect={() => onSelect(c)} key={c} />
      ))}
    </div>
  );
}

interface ClassCardProps {
  c: string;
  onSelect: () => void;
}

export function ClassCard({ c, onSelect }: ClassCardProps) {
  const classDef = useClass(c);

  return (
    <div className={classCard} onClick={onSelect}>
      <span className={h2}>{c}</span>
      <span className={subheading}>Attributes</span>
      {Object.entries(classDef.attributes).map(([name, attribute]) => (
        <AttributeHeader name={name} blockRef={attribute.blockRef} key={name} />
      ))}
      <span className={subheading}>Methods</span>
      {Object.entries(classDef.methods).map(([name]) => (
        <MethodHeader name={name} key={name} />
      ))}
    </div>
  );
}
