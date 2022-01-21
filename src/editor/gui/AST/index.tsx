import { Ref, useRef } from "react";
import mergeRefs from "react-merge-refs";
import { astRef } from "../../../code";
import { Draggable, Droppable } from "../../dragger/dnd";
import { useStore } from "../../state";
import { Block } from "../Block";
import { astStyle } from "./styles.css";

interface ASTProps {
  astRef: astRef;
}

export default function AST({ astRef }: ASTProps) {
  const ast = useStore((store) => store.code.asts[astRef.astID]);

  const moveBlock = useStore((store) => store.moveBlock);

  return (
    <div className={astStyle}>
      {ast.blocks.map((blockRef, index) => (
        <Droppable
          onDrop={({ data }) =>
            moveBlock(data.astRef, data.index, astRef, index)
          }
          id={blockRef.blockID}
          key={blockRef.blockID}
        >
          {({ drop, over }) => (
            <div
              {...drop}
              style={{ outline: over ? "1px solid red" : undefined }}
            >
              <Draggable
                id={blockRef.blockID}
                data={{ data: { type: "Block", blockRef, astRef, index } }}
              >
                {({ drag, handle }) => (
                  <Block blockRef={blockRef} {...drag} {...handle} />
                )}
              </Draggable>
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
}
