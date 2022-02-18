import {
  BlockData,
  ChildBlockData,
  Store,
  useClass,
  useClassColor,
  useFunc,
  useStore,
} from "../../state";
import {
  block,
  placeholderChildBlockRef,
  typeDef,
  concreteBlockRef,
  childBlockRef,
  abstractBlockRef,
  method,
} from "../../../code";
import {
  astDesriptionStyle,
  attributeStyle,
  blockStyle,
  droppableStyle,
  indented,
  placeholderStyle,
  primitiveBlockStyle,
  sequencePlaceholderStyle,
  sequenceStyle,
  variableStyle,
  marginText,
  horizonstal,
} from "./styles.css";
import { pointerText } from "../../../styles/globals.css";
import {
  ObjectIcon,
  ArrayIcon,
  VariableIcon,
  FunctionIcon,
  ReturnIcon,
  IfIcon,
  LoopIcon,
  BreakIcon,
  Arrow,
} from "../common/icons";
import { typeColors } from "../../../styles/typeColors";
import React, {
  createContext,
  forwardRef,
  MouseEventHandler,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AutogrowInput } from "../common/input";
import {
  Draggable,
  Droppable,
  useOverlay,
  usePlaceholder,
} from "../../dragger/dnd";
import { motion } from "framer-motion";
import mergeRefs from "react-merge-refs";
import { getMethods } from "../Class";

export const useBlock = (blockRef: childBlockRef) => {
  return useStore((store) =>
    blockRef.type === "Concrete" ? store.code.blocks[blockRef.blockID] : null
  );
};

interface BlockRefProps {
  blockRef: concreteBlockRef;
  onMouseDown?: MouseEventHandler;
  name: string;
  setBlock?: (blockRef: childBlockRef, block: block) => void;
  immutable?: boolean;
  dragging?: boolean;
}

export const BlockRef = forwardRef<HTMLDivElement, BlockRefProps>(
  (
    { name, blockRef, onMouseDown, setBlock, immutable, dragging },
    outerRef
  ) => {
    const [orientation, setOrientation] = useState({ vertical: false });

    const containerRef = useRef<HTMLElement>(null);

    const ref = mergeRefs([outerRef, containerRef]);

    useEffect(() => {
      console.log("set", blockRef.blockID);
      setOrientation({ vertical: false });

      return useStore.subscribe(() => {
        console.log("set", blockRef.blockID);
        setOrientation({ vertical: false });
      });
    }, [setOrientation]);

    useLayoutEffect(() => {
      if (orientation.vertical === false) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();

          console.log(blockRef.blockID, rect.width);

          if (rect.width > 300) {
            setOrientation({ vertical: true });
          }
        }
      }
    }, [orientation]);

    const block = useBlock(blockRef);

    const handleSetBlock = useStore((store) =>
      immutable ? () => {} : setBlock ? setBlock : store.setBlock
    );

    if (!block) {
      throw new Error();
    }

    return (
      <Block
        ref={ref}
        onMouseDown={onMouseDown}
        block={block}
        parentID={blockRef.blockID}
        setBlock={(newBlock) => handleSetBlock(blockRef, newBlock)}
        dragging={dragging}
        vertical={orientation.vertical}
      >
        {(child, index, childName, dragging) => (
          <ChildBlock
            blockRef={child}
            parent={blockRef}
            index={index}
            name={childName}
            setBlock={handleSetBlock}
            immutable={immutable}
            dragging={dragging}
          />
        )}
      </Block>
    );
  }
);

interface BlockProps {
  block: block;
  onMouseDown?: MouseEventHandler;
  setBlock?: (block: block) => void;
  children: (
    child: childBlockRef,
    index: number,
    name: string,
    dragging?: boolean
  ) => JSX.Element | null;
  parentID: string;
  dragging?: boolean;
  vertical?: boolean;
}

export const Block = forwardRef<HTMLDivElement, BlockProps>(
  (
    { block, onMouseDown, setBlock, children, parentID, dragging, vertical },
    ref
  ) => {
    const childID = (name: string) => {
      return `${parentID} ${name}`;
    };

    switch (block.opcode) {
      case "Sequence": {
        return (
          <div className={sequenceStyle}>
            {block.children.length > 0 ? (
              block.children.map((child, index) => (
                <React.Fragment key={child.blockID}>
                  {children(child, index, child.blockID, dragging)}
                </React.Fragment>
              ))
            ) : (
              <div className={marginText}>+</div>
            )}
          </div>
        );
      }
      case "Boolean": {
        return (
          <PrimitiveBlock
            ref={ref}
            onMouseDown={onMouseDown}
            color={typeColors.Boolean}
            dragging={dragging}
          >
            <span
              className={pointerText}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setBlock?.({ ...block, value: !block.value })}
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
            dragging={dragging}
          >
            <ValidatedInput
              value={block.value.toString()}
              onChange={(value) => {
                const int = parseInt(value);
                setBlock?.({ ...block, value: int });
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
            dragging={dragging}
          >
            <ValidatedInput
              value={block.value.toString()}
              onChange={(value) => {
                const float = parseFloat(value);
                setBlock?.({ ...block, value: float });
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
            dragging={dragging}
          >
            <ValidatedInput
              value={block.value.toString()}
              onChange={(value) => {
                setBlock?.({ ...block, value });
                return value;
              }}
            />
          </PrimitiveBlock>
        );
      }
      case "Array": {
        const color = useClassColor(block.return.generics.item.c);

        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
            vertical={vertical}
          >
            <ArrayIcon color={color} />
            {block.children.length > 0 ? (
              block.children.map((child, index) => (
                <React.Fragment key={childID(index.toString())}>
                  {children(child, index, index.toString())}
                </React.Fragment>
              ))
            ) : (
              <span
                className={pointerText}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setBlock?.({
                    ...block,
                    children: [
                      {
                        type: "Placeholder",
                        return: block.return.generics.item,
                      },
                    ],
                  });
                }}
              >
                +
              </span>
            )}
          </BlockContainer>
        );
      }
      case "Construct": {
        const color = useClassColor(block.return.c);

        const classDef = useClass(block.c);

        if (!classDef) {
          throw new Error(`${block.c} is not a class`);
        }

        const func = useStore(
          (store) =>
            store.code.functions[
              getMethods(store, block.c).Constructor.funcRef.funcID
            ]
        );

        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
            vertical={vertical}
          >
            <div className={horizonstal}>
              <ObjectIcon color={color} />
              <span className={marginText} style={{ color }}>
                {classDef.name}
              </span>
            </div>
            {block.children.map((child, index) => (
              <React.Fragment key={childID(func.params[index])}>
                {children(child, index, func.params[index])}
              </React.Fragment>
            ))}
          </BlockContainer>
        );
      }
      case "Set Variable": {
        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
          >
            <VariableIcon />
            <VariableReference
              variable={block.variable}
              typeDef={block.children[0].return}
            />
            <span className={marginText}>=</span>
            {children(block.children[0], 0, "to")}
          </BlockContainer>
        );
      }
      case "Get Variable": {
        return (
          <VariableReference
            variable={block.variable}
            ref={ref}
            onMouseDown={onMouseDown}
            border
            typeDef={block.return}
          />
        );
      }
      case "Set Attribute": {
        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
          >
            <VariableIcon />
            <div className={attributeStyle}>
              {children(block.children[0], 0, "object")}
              <Arrow />
              <VariableReference
                variable={block.attribute}
                typeDef={block.children[1].return}
              />
            </div>
            <span className={marginText}>=</span>
            {children(block.children[1], 1, "to")}
          </BlockContainer>
        );
      }
      case "Get Attribute": {
        return (
          <div className={attributeStyle} ref={ref} onMouseDown={onMouseDown}>
            {children(block.children[0], 0, "object")}
            <Arrow />
            <VariableReference
              variable={block.attribute}
              border
              typeDef={block.return}
            />
          </div>
        );
      }
      case "Function Call": {
        const func = useFunc(block.function);

        if (!func) {
          throw new Error(`${block.function.funcID} isn't a function`);
        }

        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
          >
            <FunctionIcon />
            <span className={marginText}>{block.function.funcID}</span>
            {block.children.map((child, index) => (
              <React.Fragment key={childID(func.params[index])}>
                {children(child, index, func.params[index])}
              </React.Fragment>
            ))}
          </BlockContainer>
        );
      }
      case "Method Call": {
        const classDef = useClass(block.c);

        const func = useFunc(classDef.methods[block.method].funcRef);

        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
          >
            <FunctionIcon />
            {children(block.children[0], 0, "object")}
            <span className={marginText}>{block.method}</span>
            {block.children.slice(1).map((child, index) => (
              <React.Fragment key={childID(func.params[index])}>
                {children(child, index + 1, func.params[index])}
              </React.Fragment>
            ))}
          </BlockContainer>
        );
      }
      case "Return": {
        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
          >
            <ReturnIcon />
            <span className={marginText}>Return</span>
            {block.children ? children(block.children[0], 0, "value") : null}
          </BlockContainer>
        );
      }
      case "If": {
        const thenBlock = children(block.children[1], 1, "then", dragging);
        const elseBlock = children(block.children[2], 2, "else", dragging);

        return (
          <div ref={ref}>
            <BlockContainer
              onMouseDown={onMouseDown}
              block={block}
              dragging={dragging}
            >
              <IfIcon />
              <span className={marginText}>If</span>
              {children(block.children[0], 0, "condition")}
            </BlockContainer>

            {thenBlock !== null ? (
              <>
                <span className={astDesriptionStyle}>THEN</span>
                <div className={indented}>{thenBlock}</div>
                <span className={astDesriptionStyle}>ELSE</span>
                <div className={indented}>{elseBlock}</div>
              </>
            ) : null}
          </div>
        );
      }
      case "While": {
        return (
          <div ref={ref}>
            <BlockContainer
              onMouseDown={onMouseDown}
              block={block}
              dragging={dragging}
            >
              <LoopIcon />
              <span className={marginText}>While</span>
              {children(block.children[0], 0, "condition")}
            </BlockContainer>
            <div className={indented}>
              {children(block.children[1], 1, "inner", dragging)}
            </div>
          </div>
        );
      }
      case "For": {
        return (
          <div ref={ref}>
            <BlockContainer
              onMouseDown={onMouseDown}
              block={block}
              dragging={dragging}
            >
              <LoopIcon />
              <span className={marginText}>For</span>
              <VariableReference
                variable={block.variable}
                typeDef={block.children[0].return?.generics?.[0]}
              />
              <span className={marginText}>in</span>
              {children(block.children[0], 0, "array")}
            </BlockContainer>
            <div className={indented}>
              {children(block.children[1], 1, "inner", dragging)}
            </div>
          </div>
        );
      }
      case "Break": {
        return (
          <BlockContainer
            ref={ref}
            onMouseDown={onMouseDown}
            block={block}
            dragging={dragging}
          >
            <BreakIcon />
            <span className={marginText}>Break</span>
          </BlockContainer>
        );
      }
      case "Do Next Frame": {
        return (
          <div ref={ref}>
            <BlockContainer
              onMouseDown={onMouseDown}
              block={block}
              dragging={dragging}
            >
              <span className={marginText}>Do Next Frame</span>
            </BlockContainer>
            <div className={indented}>
              {children(block.children[0], 0, "inner", dragging)}
            </div>
          </div>
        );
      }
    }
  }
);

export const getTypeDef = (data: BlockData): typeDef | undefined => {
  switch (data.type) {
    case "Palette Block": {
      return data.block.return;
    }
    default: {
      switch (data.blockRef.type) {
        case "Concrete": {
          return useStore.getState().code.blocks[data.blockRef.blockID].return;
        }
        case "Placeholder": {
          return data.blockRef.return;
        }
      }
    }
  }
};

const doesClassInherit = (c: string, parent: string): boolean => {
  const code = useStore.getState().code;

  const classDef = code.classes[c];

  if (classDef.super) {
    if (classDef.super === parent) {
      return true;
    } else {
      return doesClassInherit(classDef.super, parent);
    }
  } else {
    return false;
  }
};

export const matchTypes = (
  subject: typeDef | undefined,
  constraint: typeDef | undefined
): boolean => {
  if (!constraint) {
    // If there is no constraint then the subject must match
    return true;
  }

  if (!subject) {
    // If there is a constraint but no subject, then they can't match
    return false;
  }

  if (subject.inferrable) {
    // If the subject is inferrable, try match with the constraint and subject swapped

    // We need to make sure the new subject isn't marked as inferrable, otherwise we'll
    // be stuck in an infinite loop
    return matchTypes({ ...constraint, inferrable: false }, subject);
  }

  if (subject.c === constraint.c || doesClassInherit(subject.c, constraint.c)) {
    if (constraint.generics) {
      if (subject.generics) {
        for (const [name, type] of Object.entries(subject.generics)) {
          if (!constraint.generics[name]) {
            return false;
          }
          if (!matchTypes(type, constraint.generics[name])) {
            // If one of the generics doesn't match, then they can't match
            return false;
          }
        }

        // If all the generics match, then they must match
        return true;
      } else {
        // If the constraint has generics but not the subject, then they can't match
        return false;
      }
    } else {
      // If the classes match and there are no generics, then the subject must match
      return true;
    }
  } else {
    // If the classes don't match, then it can't fit
    return false;
  }
};

interface ChildBlockProps {
  parent: concreteBlockRef;
  blockRef: childBlockRef;
  index: number;
  name: string;
  setBlock: (blockRef: childBlockRef, block: block) => void;
  immutable?: boolean;
  dragging?: boolean;
}

export function ChildBlock({
  parent,
  blockRef,
  index,
  name,
  setBlock,
  immutable,
  dragging,
}: ChildBlockProps) {
  const dropBlock = useStore((store) => store.dropBlock);

  const data: ChildBlockData = {
    type: "Child Block",
    parent,
    blockRef,
    index,
  };

  const id = `${parent.blockID} ${name}`;

  const block = useBlock(blockRef);

  return (
    <Droppable
      id={id}
      onDrop={(drag) => dropBlock(drag.data, data)}
      canDragOver={(drag) => {
        return matchTypes(getTypeDef(drag.data), blockRef.return);
      }}
      disabled={immutable}
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
          {blockRef.type === "Concrete" ? (
            <Draggable id={id} data={{ data }} disabled={immutable}>
              {({ drag, handle, isDragging }) => {
                if (!block) {
                  throw new Error();
                }
                return (
                  <div style={{ opacity: isDragging ? 0 : 1 }}>
                    <BlockRef
                      name={name}
                      blockRef={blockRef}
                      setBlock={setBlock}
                      dragging={dragging}
                      {...drag}
                      {...handle}
                    />
                  </div>
                );
              }}
            </Draggable>
          ) : (
            <Placeholder name={name} blockRef={blockRef} />
          )}
        </motion.div>
      )}
    </Droppable>
  );
}

const BlockColorContext = createContext(false);

interface BlockContainerProps {
  children: ReactNode;
  block: block;
  onMouseDown?: MouseEventHandler;
  dragging?: boolean;
  vertical?: boolean;
}

export const BlockContainer = forwardRef<HTMLDivElement, BlockContainerProps>(
  ({ children, onMouseDown, block, dragging, vertical }, ref) => {
    const overlay = useOverlay();

    let color = useClassColor(block.return?.c);

    const borderColor = color ? color : "#414141";

    return (
      <motion.div
        ref={ref}
        onMouseDown={onMouseDown}
        className={blockStyle}
        style={{
          borderColor,
          cursor: overlay ? "grabbing" : "grab",
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "flex-start" : "center",
          paddingTop: vertical ? 10 : 7,
        }}
        variants={{
          initial: {
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
          },
          dragging: {
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.05), 0px 15px 15px 0 rgba(0, 0, 0, 0.25)",
          },
        }}
        transition={{
          duration: 0.3,
        }}
        animate={dragging ? "dragging" : "initial"}
      >
        {children}
      </motion.div>
    );
  }
);

interface PrimitiveBlockProps {
  children: ReactNode;
  color: string;
  onMouseDown?: MouseEventHandler;
  dragging?: boolean;
}

export const PrimitiveBlock = forwardRef<HTMLDivElement, PrimitiveBlockProps>(
  ({ children, color, onMouseDown, dragging }, ref) => {
    const backgroundColor = useContext(BlockColorContext);

    const overlay = useOverlay();

    return (
      <motion.div
        className={primitiveBlockStyle}
        style={{
          borderColor: color,
          backgroundColor: backgroundColor ? "#353535" : "#2E2E2E",
          cursor: overlay ? "grabbing" : "grab",
        }}
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
        ref={ref}
        onMouseDown={onMouseDown}
      >
        <ObjectIcon color={color} />
        {children}
      </motion.div>
    );
  }
);

interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => string;
}

export function ValidatedInput({ value, onChange }: ValidatedInputProps) {
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
          setStringValue(onChange(stringValue));
          ref.current?.blur();
        }
      }}
      onBlur={() => {
        setStringValue(onChange(stringValue));
        ref.current?.blur();
      }}
    />
  );
}

interface VariableReferenceProps {
  variable: string;
  onMouseDown?: MouseEventHandler;
  border?: boolean;
  typeDef?: typeDef;
}

export const VariableReference = forwardRef<
  HTMLDivElement,
  VariableReferenceProps
>(({ variable, onMouseDown, border, typeDef }, ref) => {
  const backgroundColor = useContext(BlockColorContext);

  const classColor = useClassColor(typeDef?.c);

  const color = classColor ? classColor : "#D6D6D6";

  const overlay = useOverlay();

  return (
    <div
      ref={ref}
      className={variableStyle}
      style={{
        backgroundColor: backgroundColor ? "#353535" : "#2E2E2E",
        color,
        border: border ? `1px solid ${color}` : undefined,
        cursor: overlay ? "grabbing" : "grab",
      }}
      onMouseDown={onMouseDown}
    >
      <ObjectIcon color={color} />
      {variable}
    </div>
  );
});

interface PlaceholderProps {
  blockRef: placeholderChildBlockRef | abstractBlockRef;
  name: string;
}

export const Placeholder = ({ blockRef, name }: PlaceholderProps) => {
  const backgroundColor = useContext(BlockColorContext);

  const color = useClassColor(blockRef.return?.c);

  return (
    <div
      className={placeholderStyle}
      style={{
        backgroundColor: backgroundColor ? "#353535" : "#2E2E2E",
        color,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {name}
    </div>
  );
};
