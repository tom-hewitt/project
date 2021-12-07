import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense, useState } from "react";
import { useStore } from "../../../project";
import { classId, createClass, sceneClass } from "../../../project/class";
import { createLevel, level, levelId } from "../../../project/level";
import { Draggable, Droppable, Drag } from "../../dnd";
import { SceneObject } from "../Object";
import { MeshIcon } from "../Window";
import styles from "./styles.module.css";
import { Model, urls } from "../Object/Mesh";

type Page = "Library" | "Levels" | "Classes" | "Models";

export default function Library() {
  const show = useStore((store) => store.libraryOpen);

  const [page, setPage] = useState<Page>("Library");

  return (
    <Droppable id={`library`}>
      {({ drop }) => (
        <motion.div
          className={styles.library}
          variants={{
            hide: {
              x: -300,
            },
            show: {
              x: 0,
            },
          }}
          initial={show ? "show" : "hide"}
          animate={show ? "show" : "hide"}
          transition={{ type: "tween", ease: "easeInOut" }}
          {...drop}
        >
          <AnimatePresence>
            <motion.div
              className={styles.page}
              initial={{ x: page === "Library" ? -300 : 300 }}
              animate={{ x: 0 }}
              exit={{ x: page === "Library" ? -300 : 300, opacity: 0 }}
              transition={{ type: "tween", ease: "easeInOut" }}
              key={page}
            >
              <Page page={page} setPage={setPage} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </Droppable>
  );
}

interface ButtonProps {
  name: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

function Button({ name, children, onClick }: ButtonProps) {
  return (
    <motion.div
      className={styles.button}
      initial={{ backgroundColor: "rgba(214, 214, 214, 0)" }}
      whileHover={{ backgroundColor: "rgba(214, 214, 214, 0.05)" }}
      onClick={onClick}
    >
      {children} {name}
    </motion.div>
  );
}

export function LevelIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.23524L1 4.8823L5 2.76465L9 4.8823L5 7.23524Z"
        stroke="#D6D6D6"
        strokeOpacity="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClassIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="5"
        cy="5"
        r="3.5"
        stroke="#F6F6F6"
        strokeOpacity="0.5"
        strokeDasharray="2.3 1.8"
      />
    </svg>
  );
}

interface PageProps {
  page: Page;
  setPage: (page: Page) => void;
}

function Page({ page, setPage }: PageProps) {
  switch (page) {
    case "Library": {
      return <LibraryPage setPage={setPage} />;
    }
    case "Levels": {
      return <LevelsPage setPage={setPage} />;
    }
    case "Classes": {
      return <ClassesPage setPage={setPage} />;
    }
    case "Models": {
      return <ModelsPage setPage={setPage} />;
    }
  }
}

interface LibraryPageProps {
  setPage: (page: Page) => void;
}

function LibraryPage({ setPage }: LibraryPageProps) {
  return (
    <>
      <div className={styles.title}>Library</div>
      <Button name="Levels" onClick={() => setPage("Levels")}>
        <LevelIcon />
      </Button>
      <Button name="Classes" onClick={() => setPage("Classes")}>
        <ClassIcon />
      </Button>
      <Button name="Models" onClick={() => setPage("Models")}>
        <MeshIcon />
      </Button>
    </>
  );
}

interface PageBodyProps {
  name: string;
  length?: number;
  add?: () => void;
  children: React.ReactNode;
  back: () => void;
}

function PageBody({ name, length, add, children, back }: PageBodyProps) {
  return (
    <div className={styles.section}>
      <div className={styles.back} onClick={back}>
        ←
      </div>
      <div className={styles.title}>
        {name}
        {length !== undefined ? (
          <span className={styles.length}>{length}</span>
        ) : null}
        {add ? (
          <div className={styles.add} onClick={add}>
            +
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

interface LevelsPageProps {
  setPage: (page: Page) => void;
}

function LevelsPage({ setPage }: LevelsPageProps) {
  const execute = useStore((store) => store.execute);

  const levels = useStore((store) => store.project.levels);

  const entries = Object.entries(levels);

  return (
    <PageBody
      name="Levels"
      length={entries.length}
      add={() => execute(createLevel())}
      back={() => setPage("Library")}
    >
      {entries.map(([id, level]) => (
        <Level id={id} level={level} key={id} />
      ))}
    </PageBody>
  );
}

interface ClassesPageProps {
  setPage: (page: Page) => void;
}

function ClassesPage({ setPage }: ClassesPageProps) {
  const execute = useStore((store) => store.execute);

  const classes = useStore((store) => store.project.sceneClasses);

  const entries = Object.entries(classes);

  return (
    <PageBody
      name="Classes"
      length={entries.length}
      add={() => execute(createClass())}
      back={() => setPage("Library")}
    >
      {entries.map(([id, classDef]) => (
        <Class id={id} classDef={classDef} key={id} />
      ))}
    </PageBody>
  );
}

interface ModelsPageProps {
  setPage: (page: Page) => void;
}

function ModelsPage({ setPage }: ModelsPageProps) {
  return (
    <PageBody name="Models" back={() => setPage("Library")}>
      {Object.keys(urls).map((name) => (
        <ModelPreview name={name} key={name} />
      ))}
    </PageBody>
  );
}

interface LevelProps {
  id: levelId;
  level: level;
}

function Level({ id, level }: LevelProps) {
  const openTab = useStore((store) => store.openTab);

  const selected = useStore(
    (store) =>
      (store.selectedTab !== undefined
        ? store.tabs[store.selectedTab]
        : undefined) === id
  );

  return (
    <Preview
      id={`level preview ${id}`}
      name={level.name}
      selected={selected}
      data={{ data: { type: "Level", id } }}
      onClick={() => openTab(id, "Level")}
    >
      <SceneObject id={level.root} />
    </Preview>
  );
}

interface ClassProps {
  id: classId;
  classDef: sceneClass;
}

function Class({ id, classDef }: ClassProps) {
  const openTab = useStore((store) => store.openTab);

  const selected = useStore(
    (store) =>
      (store.selectedTab !== undefined
        ? store.tabs[store.selectedTab]
        : undefined) === id
  );

  return (
    <Preview
      id={`class preview ${id}`}
      name={classDef.name}
      selected={selected}
      data={{ data: { type: "Class", id } }}
      onClick={() => openTab(id, "Class")}
    >
      <SceneObject id={classDef.root} />
    </Preview>
  );
}

interface PreviewProps {
  name: string;
  id: string;
  data: Drag;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function Preview({
  name,
  id,
  data,
  selected,
  onClick,
  children,
}: PreviewProps) {
  return (
    <Draggable
      id={id}
      data={data}
      options={{ activation: { type: "mouseMove", tolerance: 10 } }}
    >
      {({ drag, handle, overlay }) =>
        overlay ? (
          <motion.div
            className={styles.overlay}
            initial={{}}
            animate={{
              boxShadow: "0px 5px 5px 0 rgba(0, 0, 0, 0.25)",
            }}
            transition={{ type: "tween", ease: "easeInOut" }}
          >
            {name}
          </motion.div>
        ) : (
          <motion.div
            {...drag}
            {...handle}
            className={styles.preview}
            onClick={onClick}
            initial={{
              borderColor: "rgba(214, 214, 214, 0)",
            }}
            animate={{
              borderColor: selected
                ? "rgba(214, 214, 214, 1)"
                : "rgba(214, 214, 214, 0)",
            }}
            whileHover={{
              borderColor: selected
                ? "rgba(214, 214, 214, 1)"
                : "rgba(214, 214, 214, 0.8)",
            }}
          >
            <Canvas
              className={styles.previewCanvas}
              dpr={Math.max(window.devicePixelRatio, 2)}
              style={{ height: 120 }}
            >
              <Suspense fallback={<group />}>
                <Stage>{children}</Stage>
              </Suspense>
            </Canvas>
            <div className={styles.previewName}>{name}</div>
          </motion.div>
        )
      }
    </Draggable>
  );
}

interface ModelProps {
  name: string;
}

function ModelPreview({ name }: ModelProps) {
  return (
    <Preview
      name={name}
      id={`model preview ${name}`}
      data={{ data: { type: "Model", name } }}
    >
      <Model model={name} />
    </Preview>
  );
}
