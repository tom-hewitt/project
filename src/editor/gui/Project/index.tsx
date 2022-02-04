import { ReactNode, useState } from "react";
import { DragOverlay, useActive } from "../../dragger/dnd";
import { BlockRef } from "../Block";
import { PaletteBlock } from "../BlockPalette";
import { ClassesMenu } from "../ClassesMenu";
import { ClassWindow } from "../ClassWindow";
import { Player } from "../Player";
import { Sidebar } from "../Sidebar";
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

  return (
    <>
      <Sidebar
        goHome={() => {
          select(null);
          setPlaying(false);
        }}
        play={() => setPlaying(true)}
      />
      {playing ? (
        <Player />
      ) : selected ? (
        <ClassWindow c={selected} />
      ) : (
        <ClassesMenu onSelect={select} />
      )}
    </>
  );
}

const Overlay = () => {
  const { data } = useActive();

  if (!data) {
    return null;
  }

  switch (data.data.type) {
    case "Function Block": {
      throw new Error();
    }
    case "Attribute Block":
    case "Child Block": {
      return (
        <DragOverlay>
          <div style={{ opacity: 0.9, cursor: "grabbing" }}>
            {data.data.blockRef.type === "Concrete" ? (
              <BlockRef blockRef={data.data.blockRef} name="overlay" dragging />
            ) : null}
          </div>
        </DragOverlay>
      );
    }
    case "Palette Block": {
      return (
        <DragOverlay>
          <div style={{ opacity: 0.9, cursor: "grabbing" }}>
            <PaletteBlock block={data.data.block} id="overlay" dragging />
          </div>
        </DragOverlay>
      );
    }
  }
};
