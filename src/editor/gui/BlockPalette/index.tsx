import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { forwardRef, MouseEventHandler } from "react";
import { block, typeDef } from "../../../code";
import {
  h3,
  text,
  section,
  subheading,
  paddedSection,
} from "../../../styles/globals.css";
import { Draggable, Droppable, useActive } from "../../dragger/dnd";
import { useClassColor, useStore } from "../../state";
import { Block, BlockContainer, Placeholder, PrimitiveBlock } from "../Block";
import { primitiveBlockStyle } from "../Block/styles.css";
import { ArrayIcon } from "../common/icons";
import { blockPaletteStyle, blocksContainer, deleteStyle } from "./styles.css";

const blocks = (c: string): { [key: string]: block[] } => ({
  Common: [
    {
      opcode: "Boolean",
      value: false,
      return: { c: "Boolean" },
    },
    {
      opcode: "Integer",
      value: 0,
      return: { c: "Integer" },
    },
    {
      opcode: "Float",
      value: 0,
      return: { c: "Float" },
    },
    {
      opcode: "String",
      value: "Hello, World!",
      return: { c: "String" },
    },
    {
      opcode: "Array",
      children: [],
      return: {
        c: "Array",
        generics: { item: { c: "Object", inferrable: true } },
      },
    },
  ],
  "Control Flow": [
    {
      opcode: "If",
      children: [
        { type: "Placeholder", return: { c: "Boolean" } },
        { type: "Placeholder", sequence: true },
        { type: "Placeholder", sequence: true },
      ],
    },
    {
      opcode: "While",
      children: [
        { type: "Placeholder", return: { c: "Boolean" } },
        { type: "Placeholder", sequence: true },
      ],
    },
    {
      opcode: "For",
      variable: "item",
      children: [
        {
          type: "Placeholder",
          return: {
            c: "Array",
            generics: { item: { c: "Object", inferrable: true } },
          },
        },
        { type: "Placeholder", sequence: true },
      ],
    },
    {
      opcode: "Break",
    },
  ],
  Variables: [
    {
      opcode: "Get Variable",
      variable: "Self",
      return: { c },
    },
  ],
  "3D": [
    {
      opcode: "Construct",
      c: "3D Vector",
      children: [
        { type: "Placeholder", return: { c: "Float" } },
        { type: "Placeholder", return: { c: "Float" } },
        { type: "Placeholder", return: { c: "Float" } },
      ],
      return: { c: "3D Vector" },
    },
    {
      opcode: "Construct",
      c: "3D Object",
      children: [
        {
          type: "Placeholder",
          return: { c: "Array", generics: { item: { c: "3D Object" } } },
        },
        {
          type: "Placeholder",
          return: { c: "3D Vector" },
        },
      ],
      return: { c: "3D Object" },
    },
    {
      opcode: "Construct",
      c: "3D Plane",
      children: [
        {
          type: "Placeholder",
          return: { c: "Array", generics: { item: { c: "3D Object" } } },
        },
        {
          type: "Placeholder",
          return: { c: "3D Vector" },
        },
      ],
      return: { c: "3D Plane" },
    },
    {
      opcode: "Construct",
      c: "3D Box",
      children: [
        {
          type: "Placeholder",
          return: { c: "Array", generics: { item: { c: "3D Object" } } },
        },
        {
          type: "Placeholder",
          return: { c: "3D Vector" },
        },
        {
          type: "Placeholder",
          return: { c: "3D Vector" },
        },
      ],
      return: { c: "3D Box" },
    },
    {
      opcode: "Construct",
      c: "3D Model",
      children: [
        {
          type: "Placeholder",
          return: { c: "String" },
        },
        {
          type: "Placeholder",
          return: { c: "Array", generics: { item: { c: "3D Object" } } },
        },
        {
          type: "Placeholder",
          return: { c: "3D Vector" },
        },
      ],
      return: { c: "3D Model" },
    },
  ],
});

interface BlockPaletteProps {
  c: string;
}

export function BlockPalette({ c }: BlockPaletteProps) {
  const { data } = useActive();

  const deleteBlock = useStore((store) => store.deleteBlock);

  return (
    <div className={blockPaletteStyle}>
      {!data || data.data.type === "Palette Block" ? (
        Object.entries(blocks(c)).map(([name, blocks]) => (
          <PaletteSection name={name} blocks={blocks} key={name} />
        ))
      ) : (
        <Droppable
          id="palette delete"
          onDrop={(drag) => deleteBlock(drag.data)}
        >
          {({ drop, isOver }) => (
            <div
              className={deleteStyle}
              style={{ backgroundColor: isOver ? "#2E2E2E" : "#252525" }}
              {...drop}
            >
              Delete
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}

interface PaletteSection {
  name: string;
  blocks: block[];
}

function PaletteSection({ name, blocks }: PaletteSection) {
  return (
    <>
      <div className={paddedSection}>
        <span className={subheading}>{name}</span>
        <div className={blocksContainer}>
          {blocks.map((block) => {
            const id = `Palette ${block.opcode} ${
              block.return ? block.return.c : ""
            }`;

            return (
              <Draggable
                id={id}
                key={id}
                data={{ data: { type: "Palette Block", block } }}
              >
                {({ drag, handle, isDragging }) => (
                  <div style={{ cursor: "grab", opacity: isDragging ? 0 : 1 }}>
                    <PaletteBlock
                      id={id}
                      block={block}
                      key={block.opcode}
                      {...drag}
                      {...handle}
                    />
                  </div>
                )}
              </Draggable>
            );
          })}
        </div>
      </div>
    </>
  );
}

interface PaletteBlockProps {
  id: string;
  block: block;
  onMouseDown?: MouseEventHandler;
  dragging?: boolean;
}

export const PaletteBlock = forwardRef<HTMLDivElement, PaletteBlockProps>(
  ({ id, block, onMouseDown, dragging }, ref) => {
    switch (block.opcode) {
      case "Boolean":
      case "Integer":
      case "Float":
      case "String":
      case "Construct": {
        return (
          <PaletteConstruct
            ref={ref}
            onMouseDown={onMouseDown}
            typeDef={block.return}
            dragging={dragging}
          />
        );
      }
      case "Array": {
        const color = useClassColor(block.return.generics.item.c);

        return (
          <motion.div
            className={primitiveBlockStyle}
            ref={ref}
            onMouseDown={onMouseDown}
            style={{ borderColor: color }}
            variants={{
              initial: {
                boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
              },
              dragging: {
                boxShadow:
                  "0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 10px 0 rgba(0, 0, 0, 0.35)",
              },
            }}
            transition={{
              duration: 0.3,
            }}
            animate={dragging ? "dragging" : "initial"}
          >
            <ArrayIcon color={color} />
            <span className={text} style={{ color }}>
              Array
            </span>
          </motion.div>
        );
      }
      default: {
        return (
          <Block
            name={id}
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            parentID={id}
            dragging={dragging}
          >
            {(child, index, name) =>
              child.type === "Placeholder" ? (
                child.return ? (
                  <Placeholder blockRef={child} name={name} />
                ) : null
              ) : null
            }
          </Block>
        );
      }
    }
  }
);

interface PaletteConstructProps {
  typeDef: typeDef;
  onMouseDown?: MouseEventHandler;
  dragging?: boolean;
}

const PaletteConstruct = forwardRef<HTMLDivElement, PaletteConstructProps>(
  ({ typeDef, onMouseDown, dragging }, ref) => {
    const color = useClassColor(typeDef.c);

    if (!color) {
      throw new Error();
    }

    return (
      <PrimitiveBlock
        color={color}
        ref={ref}
        onMouseDown={onMouseDown}
        dragging={dragging}
      >
        <span className={text} style={{ color }}>
          {typeDef.c}
        </span>
      </PrimitiveBlock>
    );
  }
);
