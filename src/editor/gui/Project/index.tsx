import { motion } from "framer-motion";
import { useState } from "react";
import { title } from "../../../styles/globals.css";
import { DragOverlay, useActive } from "../../dragger/dnd";
import { BlockData, useStore } from "../../state";
import { BlockRef } from "../Block";
import { PaletteBlock } from "../BlockPalette";
import { ClassCard, ClassWindow } from "../Class";
import { projectStyle } from "./styles.css";

export default function Project() {
  return (
    <>
      <div className={projectStyle}>
        <Main />
        <Overlay />
      </div>
    </>
  );
}

export function Main() {
  const [selected, select] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);

  const classes = useStore((store) => store.userClasses);

  return selected ? (
    <ClassWindow c={selected} goBack={() => select(null)} />
  ) : (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "50px 50px 0px 50px" }}>
        <span className={title}>My Project</span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: 50,
          alignItems: "flex-start",
        }}
      >
        {classes.map((c) => (
          <ClassCard c={c} onClick={() => select(c)} key={c} />
        ))}
      </div>
    </div>
  );
}

const Overlay = () => {
  const { data } = useActive();

  if (!data) {
    return null;
  }

  return (
    <DragOverlay>
      <motion.div
        style={{ cursor: "grabbing" }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1.05, opacity: 0.7 }}
        transition={{ duration: 0.3 }}
      >
        <OverlayBlock data={data.data} />
      </motion.div>
    </DragOverlay>
  );
};

interface OverlayBlockProps {
  data: BlockData;
}

const OverlayBlock = ({ data }: OverlayBlockProps) => {
  switch (data.type) {
    case "Function Block": {
      throw new Error();
    }
    case "Attribute Block":
    case "Child Block": {
      return data.blockRef.type === "Concrete" ? (
        <BlockRef blockRef={data.blockRef} name="overlay" dragging />
      ) : null;
    }
    case "Palette Block": {
      return <PaletteBlock block={data.block} id="overlay" dragging />;
    }
  }
};
