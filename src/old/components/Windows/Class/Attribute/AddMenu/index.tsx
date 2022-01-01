import { useState } from "react";
import { useStore } from "../../../../../project";
import { classId, createAttribute } from "../../../../../project/class";
import { type } from "../../../../../project/type";
import { CreateButton } from "../../../../CreateButton";
import { Dropdown } from "../../../../Dropdown";
import { RoundedInput } from "../../../../RoundedInput";
import { TypeText } from "../../../../TypeText";
import styles from "./styles.module.css";

interface AddMenuProps {
  classId: classId;
  top: number;
  left: number;
  onClose: () => void;
}

export function AddMenu({ classId, top, left, onClose }: AddMenuProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<type>({
    type: "Primitive",
    primitive: "Boolean",
  });

  const execute = useStore((store) => store.execute);

  return (
    <Dropdown top={top} left={left} onClose={onClose}>
      <form
        className={styles.addMenu}
        onSubmit={(e) => {
          e.preventDefault();
          if (name.length > 0) {
            onClose();
            execute(createAttribute(classId, name, type));
          }
        }}
      >
        New Attribute
        <RoundedInput
          placeholder="Name"
          autoFocus
          value={name}
          setValue={setName}
        >
          <div className={styles.type}>
            <TypeText type={type} />
          </div>
        </RoundedInput>
        <CreateButton type="submit" disabled={name.length === 0}>
          Create
        </CreateButton>
      </form>
    </Dropdown>
  );
}
