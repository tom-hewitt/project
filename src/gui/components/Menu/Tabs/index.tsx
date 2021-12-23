import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";
import { tab } from "../../../../editor";
import { useStore } from "../../../../project";
import { CloseIcon } from "../../../icons";
import { ThemeContext } from "../../../Project";
import { AddMenu } from "./AddMenu";
import { ClosedTabsMenu } from "./ClosedTabsMenu";
import styles from "./styles.module.css";

export function Tabs() {
  const { openTabs, tabs, selectedTabIndex } = useStore(
    (store) => ({
      openTabs: store.openTabs,
      tabs: store.tabs,
      selectedTabIndex: store.selectedTabIndex,
    }),
    shallow
  );

  return (
    <>
      {tabs.map((id, index) => (
        <Tab
          tab={openTabs[id]}
          index={index}
          key={id}
          selected={index === selectedTabIndex}
        />
      ))}
      <ClosedTabs />
      <AddButton />
    </>
  );
}

interface TabProps {
  tab: tab;
  index: number;
  selected: boolean;
}

function Tab({ tab, index, selected }: TabProps) {
  const { selectTab, closeTab } = useStore(
    (store) => ({ selectTab: store.selectTab, closeTab: store.closeTab }),
    shallow
  );

  const name = useStore((store) => store.project.classes[tab.id].name);

  const { light } = useContext(ThemeContext);

  return (
    <motion.div
      className={styles.tab}
      onClick={() => selectTab(index)}
      animate={{
        borderColor: light
          ? selected
            ? "rgba(37, 37, 37, 0.1)"
            : "rgba(37, 37, 37, 0.0)"
          : selected
          ? "rgba(214, 214, 214, 0.1)"
          : "rgba(214, 214, 214, 0)",
        boxShadow: selected
          ? "0px 2px 10px rgba(0, 0, 0, 0.15)"
          : "0px 2px 10px rgba(0, 0, 0, 0)",
        opacity: selected ? 1 : 0.6,
        backgroundColor: light ? "#B0B0B0" : "#353535",
        color: light ? "#353535" : "#D6D6D6",
      }}
      transition={{
        backgroundColor: { duration: 0 },
        color: { duration: 0 },
      }}
    >
      {name}
      <div
        onClick={(e) => {
          e.stopPropagation();
          closeTab(index);
        }}
      >
        <CloseIcon />
      </div>
    </motion.div>
  );
}

function ClosedTabs() {
  const [focused, setFocused] = useState(false);

  const closedClasses = useStore((store) => store.closedClasses());

  const ref = useRef<HTMLDivElement>(null);

  const rect = ref.current?.getBoundingClientRect();

  const { light } = useContext(ThemeContext);

  return closedClasses.length ? (
    <>
      <motion.div
        ref={ref}
        className={styles.button}
        whileHover={{
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.25)",
        }}
        animate={{
          backgroundColor: focused
            ? "rgba(37, 37, 37, 1)"
            : "rgba(37, 37, 37, 0)",
          color: light ? (focused ? "#D6D6D6" : "#252525") : "#D6D6D6",
          boxShadow: focused
            ? "0px 2px 10px rgba(0, 0, 0, 0.25)"
            : "0px 2px 10px rgba(0, 0, 0, 0)",
          borderColor: light
            ? focused
              ? "rgba(214, 214, 214, 0.1)"
              : "#b7b7b7"
            : "rgba(214, 214, 214, 0.1)",
        }}
        transition={{
          borderColor: { duration: 0 },
          color: { duration: 0 },
        }}
        onClick={() => setFocused(true)}
      >
        {closedClasses.length}
      </motion.div>
      {focused ? (
        <ClosedTabsMenu
          top={rect ? rect.bottom + 5 : 0}
          left={rect ? rect.left : 0}
          onClose={() => {
            setFocused(false);
          }}
        />
      ) : null}
    </>
  ) : null;
}

function AddButton() {
  const [focused, setFocused] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const rect = ref.current?.getBoundingClientRect();

  const { light } = useContext(ThemeContext);

  return (
    <>
      <motion.div
        ref={ref}
        className={styles.button}
        whileHover={{
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.25)",
        }}
        animate={{
          backgroundColor: focused
            ? "rgba(37, 37, 37, 1)"
            : "rgba(37, 37, 37, 0)",
          color: light ? (focused ? "#D6D6D6" : "#252525") : "#D6D6D6",
          boxShadow: focused
            ? "0px 2px 10px rgba(0, 0, 0, 0.25)"
            : "0px 2px 10px rgba(0, 0, 0, 0)",
          borderColor: light
            ? focused
              ? "rgba(214, 214, 214, 0.1)"
              : "#b7b7b7"
            : "rgba(214, 214, 214, 0.1)",
        }}
        transition={{
          borderColor: { duration: 0 },
          color: { duration: 0 },
        }}
        onClick={() => setFocused(true)}
      >
        +
      </motion.div>
      {focused ? (
        <AddMenu
          top={rect ? rect.bottom + 5 : 0}
          left={rect ? rect.left : 0}
          onClose={() => {
            setFocused(false);
          }}
        />
      ) : null}
    </>
  );
}
