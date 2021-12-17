import React from "react";
import Buttons from "./Buttons";
import { Icon } from "./Icon";
import styles from "./styles.module.css";
import { Tabs } from "./Tabs";

export default function Menu() {
  return (
    <>
      <div className={styles.icon}>
        <Icon />
      </div>
      <div className={styles.buttons}>
        <Buttons />
      </div>
      <div className={styles.tabs}>
        <Tabs />
      </div>
    </>
  );
}
