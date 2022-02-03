import { createContext, useState } from "react";
import { useClass } from "../../state";
import { BlockPalette } from "../BlockPalette";
import { ClassDef } from "../ClassDef";
import { Function } from "../Function";
import { Viewport } from "../Viewport";
import { classEditorStyle, classWindowStyle } from "./styles.css";

interface ClassWindowProps {
  c: string;
}

export interface Selection {
  type: "Attribute" | "Method";
  name: string;
}

export const ClassWindowContext = createContext<{
  selected: Selection | null;
  select: (selection: Selection | null) => void;
}>({ selected: null, select: () => {} });

export function ClassWindow({ c }: ClassWindowProps) {
  const classDef = useClass(c);

  const [selected, select] = useState<Selection | null>(null);

  return (
    <ClassWindowContext.Provider value={{ selected, select }}>
      <div className={classWindowStyle}>
        <ClassDef c={c} />

        <div className={classEditorStyle}>
          {selected ? (
            selected.type === "Method" ? (
              <Function funcRef={classDef.methods[selected.name].funcRef} />
            ) : selected.type === "Attribute" ? (
              <Viewport c={c} attribute={selected.name} />
            ) : null
          ) : null}
        </div>

        <BlockPalette c={c} />
      </div>
    </ClassWindowContext.Provider>
  );
}
