import { Windows } from "../Windows";
import styles from "./styles.module.css";
import Toasts from "../Toast";
import Menu from "../Menu";
import { createContext, useState } from "react";

export const ThemeContext = createContext({
  light: true,
  setLight: (dark: boolean) => {},
});

export default function Project() {
  const [light, setLight] = useState(true);

  return (
    <ThemeContext.Provider value={{ light, setLight }}>
      <div className={styles.project}>
        <Windows />
        <Menu />
        <Toasts />
      </div>
    </ThemeContext.Provider>
  );
}
