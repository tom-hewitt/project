import { motion } from "framer-motion";
import { useContext } from "react";
import { attribute, childBlockRef, method } from "../../../code";
import {
  h1,
  paddedSection,
  subheading,
  text,
} from "../../../styles/globals.css";
import { Draggable, Droppable } from "../../dragger/dnd";
import {
  AttributeBlockData,
  Store,
  useClass,
  useClassColor,
  useStore,
} from "../../state";
import { BlockRef, getTypeDef, matchTypes } from "../Block";
import { ClassWindowContext, Selection } from "../ClassWindow";
import { FunctionIcon, ObjectIcon } from "../common/icons";
import { classDefStyle, horizontal } from "./styles.css";

interface ClassDefProps {
  c: string;
}

export function ClassDef({ c }: ClassDefProps) {
  const classDef = useClass(c);

  return (
    <div className={classDefStyle}>
      <div className={paddedSection}>
        <span className={h1} style={{ marginTop: 30 }}>
          {classDef.name}
        </span>
      </div>
      <div className={paddedSection}>
        <span className={subheading}>Attributes</span>
      </div>
      <Attributes c={c} />

      <div className={paddedSection}>
        <span className={subheading}>Methods</span>
      </div>
      <Methods c={c} />
    </div>
  );
}

const getAttributes = (
  store: Store,
  c: string
): { [key: string]: attribute } => {
  const classDef = store.code.classes[c];

  if (classDef.super) {
    return {
      ...getAttributes(store, classDef.super),
      ...classDef.attributes,
    };
  } else {
    return classDef.attributes;
  }
};

interface AttributesProps {
  c: string;
}

function Attributes({ c }: AttributesProps) {
  const attributes = useStore((store) => getAttributes(store, c));

  return (
    <>
      {Object.entries(attributes).map(([name, attribute]) => (
        <Attribute c={c} name={name} attribute={attribute} key={name} />
      ))}
    </>
  );
}

interface AttributeProps {
  c: string;
  name: string;
  attribute: attribute;
}

function Attribute({
  c,
  name,
  attribute: { inheritedFrom, blockRef },
}: AttributeProps) {
  const { select, selected } = useContext(ClassWindowContext);

  const dropBlock = useStore((store) => store.dropBlock);

  const data: AttributeBlockData = {
    type: "Attribute Block",
    blockRef: blockRef,
    c,
    attribute: name,
  };

  const id = `${c} attribute ${name}`;

  const inherited = c !== inheritedFrom;

  return (
    <Droppable
      id={id}
      onDrop={(drag) => dropBlock(drag.data, data)}
      canDragOver={(drag) => {
        return matchTypes(getTypeDef(drag.data), blockRef.return);
      }}
    >
      {({ drop, isOver }) => (
        <motion.div
          className={paddedSection}
          style={{
            cursor: "pointer",
            overflowX: "scroll",
          }}
          onClick={() => {
            if (!inherited) {
              select({ type: "Attribute", name });
            }
          }}
          variants={{
            initial: {
              outline: "1px solid rgba(255, 255, 255, 0)",
              transition: { duration: 0 },
              backgroundColor:
                selected &&
                selected.type === "Attribute" &&
                selected.name === name
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0)",
            },
            over: {
              outline: "1px solid rgba(255, 255, 255, 0.6)",
              transition: { duration: 0.2 },
              backgroundColor:
                selected &&
                selected.type === "Attribute" &&
                selected.name === name
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0)",
            },
          }}
          initial="initial"
          animate={isOver ? "over" : "initial"}
          {...drop}
        >
          <AttributeHeader
            name={name}
            blockRef={blockRef}
            inheritedFrom={inherited ? inheritedFrom : undefined}
          />
          {blockRef.type === "Concrete" ? (
            <Draggable id={id} data={{ data }} disabled={inherited}>
              {({ drag, handle, isDragging }) => (
                <div style={{ opacity: isDragging ? 0 : inherited ? 0.6 : 1 }}>
                  <BlockRef
                    name={name}
                    blockRef={blockRef}
                    immutable={inherited}
                    {...drag}
                    {...handle}
                  />
                </div>
              )}
            </Draggable>
          ) : null}
        </motion.div>
      )}
    </Droppable>
  );
}

interface AttributeHeaderProps {
  name: string;
  blockRef: childBlockRef;
  inheritedFrom?: string;
}

export function AttributeHeader({
  name,
  blockRef,
  inheritedFrom,
}: AttributeHeaderProps) {
  if (!blockRef.return) {
    throw new Error();
  }

  const color = useClassColor(blockRef.return.c);

  return (
    <div className={horizontal}>
      <ObjectIcon color={color} />
      <span
        className={text}
        style={{ color, opacity: inheritedFrom ? 0.6 : 1 }}
      >
        {name}
        {inheritedFrom ? (
          <span className={text} style={{ opacity: 0.3 }}>
            : {inheritedFrom}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export const getMethods = (
  store: Store,
  c: string
): { [key: string]: method } => {
  const classDef = store.code.classes[c];

  if (classDef.super) {
    return {
      ...getMethods(store, classDef.super),
      ...classDef.methods,
    };
  } else {
    return classDef.methods;
  }
};

interface MethodsProps {
  c: string;
}

function Methods({ c }: MethodsProps) {
  const methods = useStore((store) => getMethods(store, c));

  return (
    <>
      <Method c={c} name="Constructor" method={methods.Constructor} />
      {Object.entries(methods).map(([name, method]) =>
        name !== "Constructor" ? (
          <Method c={c} name={name} method={method} key={name} />
        ) : null
      )}
    </>
  );
}

interface MethodProps {
  c: string;
  name: string;
  method: method;
}

function Method({ c, name, method }: MethodProps) {
  if (!method) {
    throw new Error(`${c} has no method ${name}`);
  }

  const { select, selected } = useContext(ClassWindowContext);

  const inherited = method.inheritedFrom !== c;

  return (
    <div
      className={paddedSection}
      onClick={() => {
        if (!inherited) {
          select({ type: "Method", name });
        }
      }}
      style={{
        cursor: "pointer",
        backgroundColor:
          selected && selected.type === "Method" && selected.name === name
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0)",
      }}
    >
      <MethodHeader
        name={name}
        inheritedFrom={inherited ? method.inheritedFrom : undefined}
      />
    </div>
  );
}

interface MethodHeaderProps {
  name: string;
  inheritedFrom?: string;
}

export function MethodHeader({ name, inheritedFrom }: MethodHeaderProps) {
  return (
    <div className={horizontal}>
      <FunctionIcon />
      <span className={text} style={{ opacity: inheritedFrom ? 0.6 : 1 }}>
        {name}
        {inheritedFrom ? (
          <span className={text} style={{ opacity: 0.3 }}>
            : {inheritedFrom}
          </span>
        ) : null}
      </span>
    </div>
  );
}
