import { Canvas, Windows } from "../components/Windows";
import styles from "./styles.module.css";
import Toasts from "../components/Toast";
import Menu from "../components/Menu";
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
        <Canvas />
        <Menu />
        <Windows />
        <Toasts />
      </div>
    </ThemeContext.Provider>
  );
}
