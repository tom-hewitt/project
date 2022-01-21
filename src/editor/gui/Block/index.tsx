import { useStore } from "../../state";
import { blockRef } from "../../../code";
import { blockStyle, inputStyle, placeholderStyle } from "./styles.css";
import { pointer, pointerText, text } from "../../../styles/globals.css";
import { ObjectIcon, ArrayIcon } from "../common/icons";
import { typeColors } from "../../../styles/typeColors";
import {
  forwardRef,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Handle,
  MouseDownHandler,
  OverlayContext,
  PlaceholderContext,
} from "../../dragger/core";
import { AutogrowInput } from "../common/input";
import { Draggable, Droppable } from "../../dragger/dnd";

interface BlockProps {
  blockRef: blockRef;
  onMouseDown?: MouseDownHandler;
}

export const Block = forwardRef<HTMLDivElement, BlockProps>(
  ({ blockRef, onMouseDown }, ref) => {
    const block = useStore((store) => store.code.blocks[blockRef.blockID]);

    const setBlock = useStore((store) => store.setBlock);

    switch (block.opcode) {
      case "Placeholder": {
        return <div className={placeholderStyle}>+</div>;
      }
      case "Boolean": {
        return (
          <PrimitiveBlock
            ref={ref}
            onMouseDown={onMouseDown}
            color={typeColors.Boolean}
          >
            <span
              className={pointerText}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() =>
                setBlock(blockRef, { ...block, value: !block.value })
              }
            >
              {block.value.toString()}
            </span>
          </PrimitiveBlock>
        );
      }
      case "Integer": {
        return (
          <PrimitiveBlock
            ref={ref}
            onMouseDown={onMouseDown}
            color={typeColors.Integer}
          >
            <ValidatedInput
              value={block.value.toString()}
              onSubmit={(value) => {
                const int = parseInt(value);
                setBlock(blockRef, { ...block, value: int });
                return int.toString();
              }}
            />
          </PrimitiveBlock>
        );
      }
      case "Float": {
        return (
          <PrimitiveBlock
            ref={ref}
            onMouseDown={onMouseDown}
            color={typeColors.Float}
          >
            <ValidatedInput
              value={block.value.toString()}
              onSubmit={(value) => {
                const float = parseFloat(value);
                setBlock(blockRef, { ...block, value: float });
                return float.toString();
              }}
            />
          </PrimitiveBlock>
        );
      }
      case "String": {
        return (
          <PrimitiveBlock
            ref={ref}
            onMouseDown={onMouseDown}
            color={typeColors.String}
          >
            <ValidatedInput
              value={block.value.toString()}
              onSubmit={(value) => {
                setBlock(blockRef, { ...block, value });
                return value;
              }}
            />
          </PrimitiveBlock>
        );
      }
      case "Array": {
        return (
          <BlockContainer ref={ref} onMouseDown={onMouseDown}>
            <ArrayIcon />
            {block.children.map((child, index) => (
              <ChildBlock
                blockRef={child}
                parent={blockRef}
                index={index}
                key={child.blockID}
              />
            ))}
            <span className={pointerText}>+</span>
          </BlockContainer>
        );
      }

      default: {
        return <div>unimplemented</div>;
      }
    }
  }
);

interface ChildBlockProps {
  blockRef: blockRef;
  parent: blockRef;
  index: number;
}

function ChildBlock({ blockRef, parent, index }: ChildBlockProps) {
  return (
    <Droppable
      id={blockRef.blockID}
      data={{ data: { type: "Child Block", parent, blockRef, index } }}
    >
      {({ drop, over }) => (
        <div style={{ outline: over ? "1px solid red" : undefined }} {...drop}>
          <Draggable
            data={{ data: { type: "Child Block", parent, blockRef, index } }}
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
  );
}

interface BlockContainerProps extends Handle {
  children: ReactNode;
  borderColor?: string;
}

const BlockContainer = forwardRef<HTMLDivElement, BlockContainerProps>(
  ({ children, onMouseDown, borderColor }, ref) => {
    const overlay = useContext(OverlayContext);
    const placeholder = useContext(PlaceholderContext);

    return (
      <div
        className={blockStyle}
        style={{
          borderColor,
          cursor: overlay ? "grabbing" : "grab",
          opacity: placeholder ? 0 : 1,
        }}
        ref={ref}
        onMouseDown={onMouseDown}
      >
        {children}
      </div>
    );
  }
);

interface PrimitiveBlockProps extends Handle {
  children: ReactNode;
  color: string;
}

const PrimitiveBlock = forwardRef<HTMLDivElement, PrimitiveBlockProps>(
  ({ children, color, onMouseDown }, ref) => {
    return (
      <BlockContainer borderColor={color} ref={ref} onMouseDown={onMouseDown}>
        <ObjectIcon color={color} />
        {children}
      </BlockContainer>
    );
  }
);

interface ValidatedInputProps {
  value: string;
  onSubmit: (value: string) => string;
}

function ValidatedInput({ value, onSubmit }: ValidatedInputProps) {
  const [stringValue, setStringValue] = useState(value);

  useEffect(() => {
    setStringValue(value);
  }, [value]);

  const ref = useRef<HTMLInputElement>(null);

  return (
    <AutogrowInput
      ref={ref}
      value={stringValue}
      onChange={setStringValue}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setStringValue(onSubmit(stringValue));
          ref.current?.blur();
        }
      }}
    />
  );
}
