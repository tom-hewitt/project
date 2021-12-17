import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "../../../../../project";
import { createClass } from "../../../../../project/class";
import Modal from "../../../Modal";
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
    <Modal onClose={onClose}>
      <motion.div
        className={styles.addMenu}
        style={{ top, left }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        New Class
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (name.length) {
              onClose();
            }
          }}
        >
          <div className={styles.inputs}>
            <motion.input
              className={styles.input}
              type="text"
              placeholder="Name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className={styles.extends}>
              Extends
              <div className={styles.parent}>Scene</div>
            </div>
          </div>
          <motion.button
            className={styles.button}
            type="submit"
            initial={{
              backgroundColor: "rgba(214, 214, 214, 0)",
              color: "#d6d6d6",
            }}
            whileHover={{
              backgroundColor:
                name.length > 0
                  ? "rgba(214, 214, 214, 1)"
                  : "rgba(214, 214, 214, 0)",
              color: name.length > 0 ? "#353535" : "#d6d6d6",
            }}
            animate={{
              opacity: name.length > 0 ? 1 : 0.5,
              cursor: name.length > 0 ? "pointer" : "default",
            }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              execute(createClass({ name }));
            }}
          >
            Create
          </motion.button>
        </form>
      </motion.div>
    </Modal>
  );
}
