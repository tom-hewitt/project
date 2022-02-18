import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import {
  createContext,
  forwardRef,
  MouseEventHandler,
  ReactNode,
  useContext,
  useState,
} from "react";
import { block, typeDef } from "../../../code";
import {
  h3,
  text,
  section,
  subheading,
  paddedSection,
  bold,
} from "../../../styles/globals.css";
import { Draggable, Droppable, useActive } from "../../dragger/dnd";
import { useClassColor, useStore } from "../../state";
import { Block, BlockContainer, Placeholder, PrimitiveBlock } from "../Block";
import { primitiveBlockStyle } from "../Block/styles.css";
import { ArrayIcon, ObjectIcon } from "../common/icons";
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
        { type: "Abstract", block: { opcode: "Sequence", children: [] } },
        { type: "Abstract", block: { opcode: "Sequence", children: [] } },
      ],
    },
    {
      opcode: "While",
      children: [
        { type: "Placeholder", return: { c: "Boolean" } },
        { type: "Abstract", block: { opcode: "Sequence", children: [] } },
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
        { type: "Abstract", block: { opcode: "Sequence", children: [] } },
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

const SectionContext = createContext<[string, (selected: string) => void]>([
  "Construct",
  (selected: string) => {},
]);

interface BlockPaletteProps {
  c: string;
}

export function BlockPalette({ c }: BlockPaletteProps) {
  const { data } = useActive();

  const deleteBlock = useStore((store) => store.deleteBlock);

  const [selected, setSelected] = useState("Construct");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 20,
        width: 300,
        gap: 10,
      }}
    >
      {!data || data.data.type === "Palette Block" ? (
        <SectionContext.Provider value={[selected, setSelected]}>
          <ConstructSection />
          <ControlFlowSection />
        </SectionContext.Provider>
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

const primitiveBlocks: block[] = [
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
];

const library3DBlocks: block[] = [
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
];

function ConstructSection() {
  return (
    <Section name="Construct" icon={<ObjectIcon color="#D6D6D6" />}>
      <SubSection name="PRIMITIVES" blocks={primitiveBlocks} />
      <SubSection name="3D" blocks={library3DBlocks} />
    </Section>
  );
}

const selectionBlocks: block[] = [
  {
    opcode: "If",
    children: [
      { type: "Placeholder", return: { c: "Boolean" } },
      { type: "Abstract", block: { opcode: "Sequence", children: [] } },
      { type: "Abstract", block: { opcode: "Sequence", children: [] } },
    ],
  },
];

const iterationBlocks: block[] = [
  {
    opcode: "While",
    children: [
      { type: "Placeholder", return: { c: "Boolean" } },
      { type: "Abstract", block: { opcode: "Sequence", children: [] } },
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
      { type: "Abstract", block: { opcode: "Sequence", children: [] } },
    ],
  },
  {
    opcode: "Break",
  },
];

function ControlFlowSection() {
  return (
    <Section name="Control Flow" icon={null}>
      <SubSection name="SELECTION" blocks={selectionBlocks} />
      <SubSection name="ITERATION" blocks={iterationBlocks} />
    </Section>
  );
}

interface SectionProps {
  children: ReactNode;
  icon: ReactNode;
  name: string;
}

function Section({ children, icon, name }: SectionProps) {
  const [selected, setSelected] = useContext(SectionContext);

  const isSelected = selected === name;

  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#303030",
        padding: 15,
        borderRadius: 14,
        cursor: "pointer",
      }}
      variants={{
        initial: {
          backgroundColor: "rgba(255, 255, 255, 0)",
        },
        hover: {
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        },
        selected: {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        },
      }}
      initial={isSelected ? "selected" : "initial"}
      animate={isSelected ? "selected" : "initial"}
      whileHover={isSelected ? "selected" : "hover"}
      onClick={() => {
        if (!isSelected) {
          setSelected(name);
        }
      }}
      layout
    >
      <motion.div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
        layoutId={`section header ${name}`}
      >
        {icon}
        <span className={bold}>{name}</span>
      </motion.div>
      <motion.div animate={{ height: isSelected ? "fit-content" : 0 }}>
        <motion.div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
            opacity: isSelected ? 1 : 0,
            paddingTop: 15,
          }}
          animate={{ opacity: isSelected ? 1 : 0 }}
          transition={{ duration: isSelected ? 0.2 : 0 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface SubSectionProps {
  name: string;
  blocks: block[];
}

function SubSection({ name, blocks }: SubSectionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span className={subheading}>{name}</span>
      <PaletteBlocks blocks={blocks} />
    </div>
  );
}

interface PaletteSection {
  blocks: block[];
}

function PaletteBlocks({ blocks }: PaletteSection) {
  return (
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
