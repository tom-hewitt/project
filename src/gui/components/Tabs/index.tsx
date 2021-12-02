import { motion } from "framer-motion";
import shallow from "zustand/shallow";
import { tab } from "../../../editor";
import { useStore } from "../../../project";
import styles from "./styles.module.css";

export function Tabs() {
  const { openTabs, tabs, selectedTab } = useStore(
    (store) => ({
      openTabs: store.openTabs,
      tabs: store.tabs,
      selectedTab: store.selectedTab,
    }),
    shallow
  );

  return (
    <div className={styles.tabs}>
      {tabs.map((id, index) => (
        <Tab
          tab={openTabs[id]}
          index={index}
          key={id}
          selected={index === selectedTab}
        />
      ))}
    </div>
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

  const name = useStore((store) =>
    tab.type === "Level"
      ? store.project.levels[tab.id].name
      : store.project.sceneClasses[tab.id].name
  );

  return (
    <motion.div
      className={styles.tab}
      onClick={() => selectTab(index)}
      variants={{
        unselected: {
          color: "rgba(214, 214, 214, 0.5)",
        },
        selected: {
          color: "rgba(214, 214, 214, 1)",
        },
      }}
      initial={selected ? "selected" : "unselected"}
      animate={selected ? "selected" : "unselected"}
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

function CloseIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 1.5L8.5 8.5M1.5 8.5L8.5 1.5"
        stroke="#D6D6D6"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
    </svg>
  );
}
