import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "../../../../project";
import { createClass } from "../../../../project/class";
import { CreateButton } from "../../../CreateButton";
import { Dropdown } from "../../../Dropdown";
import Modal from "../../../Modal";
import { RoundedInput } from "../../../RoundedInput";
import styles from "./styles.module.css";

interface AddMenuProps {
  left: number;
  top: number;
  onClose: () => void;
}

export function AddMenu({ top, left, onClose }: AddMenuProps) {
  const [name, setName] = useState("");

  const execute = useStore((store) => store.execute);

  return (
    <Dropdown top={top} left={left} onClose={onClose}>
      <div className={styles.addMenu}>
        New Class
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (name.length > 0) {
              execute(createClass({ name }));
              onClose();
            }
          }}
        >
          <div className={styles.inputs}>
            <RoundedInput
              placeholder="Name"
              autoFocus
              value={name}
              setValue={setName}
            />
            <div className={styles.extends}>
              Extends
              <div className={styles.parent}>Scene</div>
            </div>
          </div>
          <CreateButton type="submit" disabled={name.length === 0}>
            Create
          </CreateButton>
        </form>
      </div>
    </Dropdown>
  );
}
