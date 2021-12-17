import { Window } from "..";
import { sceneClass } from "../../../../project/class";
import styles from "./styles.module.css";

interface ClassWindowProps {
  sceneClass: sceneClass;
}

export function ClassWindow({ sceneClass }: ClassWindowProps) {
  return (
    <Window>
      <span className={styles.name}>{sceneClass.name}</span>
      <span className={styles.subheading}>Attributes</span>
      <span className={styles.subheading}>Methods</span>
    </Window>
  );
}
