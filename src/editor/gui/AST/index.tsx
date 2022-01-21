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

  const dropBlock = useStore((store) => store.dropBlock);

  return (
    <div className={astStyle}>
      {ast.blocks.map((blockRef, index) => (
        <Droppable
          id={blockRef.blockID}
          key={blockRef.blockID}
          data={{ data: { type: "AST Block", blockRef, astRef, index } }}
        >
          {({ drop, over }) => (
            <div
              {...drop}
              style={{ outline: over ? "1px solid red" : undefined }}
            >
              <Draggable
                id={blockRef.blockID}
                data={{ data: { type: "AST Block", blockRef, astRef, index } }}
              >
                {({ drag, handle, isDragging }) => (
                  <div style={{ opacity: isDragging ? 0.5 : 1 }}>
                    <Block blockRef={blockRef} {...drag} {...handle} />
                  </div>
                )}
              </Draggable>
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
}
