import { motion } from "framer-motion";
import { funcRef } from "../../../code";
import { h2 } from "../../../styles/globals.css";
import { Droppable } from "../../dragger/dnd";
import { useStore } from "../../state";
import { BlockRef } from "../Block";
import { droppableStyle } from "../Block/styles.css";
import { FunctionIcon } from "../common/icons";
import { astContainer, functionContainer, functionStyle } from "./styles.css";

interface FunctionProps {
  funcRef: funcRef;
}

const useFunc = (funcRef: funcRef) => {
  return useStore((store) => store.code.functions[funcRef.funcID]);
};

export function Function({ funcRef }: FunctionProps) {
  const func = useFunc(funcRef);

  const dropBlock = useStore((store) => store.dropBlock);

  return (
    <div className={functionContainer}>
      <div className={functionStyle}>
        <FunctionIcon />
        <span className={h2}>{func.name}</span>
      </div>
      <div className={astContainer}>
        <Droppable
          id={funcRef.funcID}
          onDrop={(drag) =>
            dropBlock(drag.data, {
              type: "Function Block",
              blockRef: func.block,
            })
          }
        >
          {({ drop, isOver }) => (
            <motion.div
              className={droppableStyle}
              variants={{
                initial: {
                  border: "1px solid rgba(255, 255, 255, 0)",
                  transition: { duration: 0 },
                },
                over: {
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  transition: { duration: 0.2 },
                },
              }}
              initial="initial"
              animate={isOver ? "over" : "initial"}
              {...drop}
            >
              <BlockRef blockRef={func.block} name="body" />
            </motion.div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
