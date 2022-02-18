import { motion } from "framer-motion";
import { useState } from "react";
import { attribute, method } from "../../../code";
import { bold, text } from "../../../styles/globals.css";
import { Store, useClass, useClassColor, useStore } from "../../state";
import { BlockRef } from "../Block";
import { BlockPalette } from "../BlockPalette";
import { BackIcon, ClassIcon, FunctionIcon, ObjectIcon } from "../common/icons";
import { Function } from "../Function";

interface ClassCardProps {
  c: string;
  onClick: () => void;
}

export const ClassCard = ({ c, onClick }: ClassCardProps) => {
  const classDef = useClass(c);

  return (
    <motion.div
      style={{
        opacity: 1,
        width: 250,
        backgroundColor: "#1C1C1C",
        borderRadius: 15,
        cursor: "pointer",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(65, 65, 65, 1)",
      }}
      variants={{
        initial: {
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
        },
        hover: {
          boxShadow: "0px 15px 20px rgba(0, 0, 0, 0.25)",
          scale: 1.02,
        },
      }}
      whileHover="hover"
      whileTap="initial"
      exit={{ opacity: 0 }}
      onClick={onClick}
      layoutId={c}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#2D2D2D",
          boxSizing: "border-box",
          borderRadius: 14,
        }}
        layoutId={`${c} def`}
      >
        <motion.div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 15,
          }}
        >
          <motion.span className={bold} layoutId={`${c} name`}>
            {c}
          </motion.span>
        </motion.div>
        {Object.keys(classDef.attributes).length > 0 ? (
          <motion.div
            style={{ borderTop: "1px solid #414141" }}
            layoutId={`${c} attribuets`}
          >
            {Object.entries(classDef.attributes).map(([name, attribute]) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: "10px 15px",
                  justifyContent: "flex-start",
                }}
                key={name}
              >
                <Attribute c={c} name={name} attribute={attribute} />
              </div>
            ))}
          </motion.div>
        ) : null}
        {Object.keys(classDef.methods).length > 0 ? (
          <motion.div
            style={{ borderTop: "1px solid #414141" }}
            layoutId={`${c} methods`}
          >
            {Object.entries(classDef.methods).map(([name, method]) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: "10px 15px",
                  justifyContent: "flex-start",
                }}
                key={name}
              >
                <Method c={c} name={name} method={method} />
              </div>
            ))}
          </motion.div>
        ) : null}
      </motion.div>
    </motion.div>
  );
};

interface Selection {
  type: "Attribute" | "Method";
  name: string;
}

interface ClassWindowProps {
  c: string;
  goBack: () => void;
}

export const ClassWindow = ({ c, goBack }: ClassWindowProps) => {
  const classDef = useClass(c);

  const [selected, setSelected] = useState<Selection | null>(null);

  const onSelect = (selection: Selection) => {
    setSelected(
      selected &&
        selection.name === selected.name &&
        selection.type === selected.type
        ? null
        : selection
    );
  };

  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1C1C1C",
        borderStyle: "solid",
        borderColor: "rgba(65, 65, 65, 1)",
      }}
      initial={{
        borderWidth: 1,
      }}
      animate={{
        borderWidth: 0,
      }}
      layoutId={c}
    >
      <motion.div
        style={{
          width: 400,
          height: "100vh",
          backgroundColor: "#2D2D2D",
          boxSizing: "border-box",
          overflowY: "scroll",
          overflowX: "hidden",
        }}
        layoutId={`${c} def`}
      >
        <motion.div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: 50,
            padding: 5,
            boxSizing: "border-box",
          }}
          layoutId={`${c} header`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 40,
              width: 40,
              cursor: "pointer",
            }}
            onClick={goBack}
          >
            <BackIcon />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              width: "100%",
              marginRight: 40,
            }}
          >
            <motion.div className={bold} layoutId={`${c} name`}>
              {c}
            </motion.div>
          </div>
        </motion.div>
        <Attributes
          c={c}
          onSelect={(name) => onSelect({ type: "Attribute", name })}
          selected={selected?.type === "Attribute" ? selected.name : null}
        />
        <Methods
          c={c}
          onSelect={(name) => onSelect({ type: "Method", name })}
          selected={selected?.type === "Method" ? selected.name : null}
        />
      </motion.div>
      <div style={{ overflow: "scroll", flex: "1" }}>
        {selected?.type === "Method" && selected.name in classDef.methods ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "fit-content",
              padding: 30,
            }}
          >
            <Function funcRef={classDef.methods[selected.name].funcRef} />
          </div>
        ) : null}
      </div>
      <BlockPalette c={c} />
    </motion.div>
  );
};

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
  onSelect: (name: string) => void;
  selected: string | null;
}

const Attributes = ({ c, onSelect, selected }: AttributesProps) => {
  const attributes = useStore((store) => getAttributes(store, c));

  return (
    <motion.div
      style={{ borderTop: "1px solid #414141" }}
      layoutId={`${c} attributes`}
    >
      {Object.entries(attributes).map(([name, attribute]) => (
        <EditableAttribute
          c={c}
          name={name}
          attribute={attribute}
          onClick={() => onSelect(name)}
          selected={selected === name}
          key={name}
        />
      ))}
    </motion.div>
  );
};

interface EditableAttributeProps {
  c: string;
  name: string;
  attribute: attribute;
  onClick: () => void;
  selected?: boolean;
}

const EditableAttribute = ({
  c,
  name,
  attribute,
  onClick,
  selected,
}: EditableAttributeProps) => {
  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 15,
        padding: "15px 20px",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        cursor: "pointer",
      }}
      variants={{
        initial: {
          backgroundColor: "rgba(255, 255, 255, 0)",
        },
        selected: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        },
      }}
      initial="initial"
      animate={selected ? "selected" : "initial"}
      onClick={onClick}
      layoutId={`${c} editable attribute ${name}`}
    >
      <Attribute c={c} name={name} attribute={attribute} />
      {selected && attribute.blockRef.type === "Concrete" ? (
        <div onClick={(e) => e.stopPropagation()}>
          <BlockRef name={name} blockRef={attribute.blockRef} />
        </div>
      ) : null}
    </motion.div>
  );
};

interface AttributeProps {
  c: string;
  name: string;
  attribute: attribute;
}

const Attribute = ({ c, name, attribute }: AttributeProps) => {
  const color = useClassColor(attribute.blockRef.return?.c);

  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
      }}
      layoutId={`${c} attribute ${name}`}
    >
      <ObjectIcon color={color} />
      <span style={{ color }} className={text}>
        {name}
      </span>
    </motion.div>
  );
};

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
  onSelect: (name: string) => void;
  selected: string | null;
}

const Methods = ({ c, onSelect, selected }: MethodsProps) => {
  const methods = useStore((store) => getMethods(store, c));

  return (
    <motion.div
      style={{ borderTop: "1px solid #414141" }}
      layoutId={`${c} methods`}
    >
      {Object.entries(methods).map(([name, method]) => (
        <EditableMethod
          c={c}
          name={name}
          method={method}
          onClick={() => onSelect(name)}
          selected={selected === name}
          key={name}
        />
      ))}
    </motion.div>
  );
};

interface MethodProps {
  c: string;
  name: string;
  method: method;
}

const Method = ({ c, name, method }: MethodProps) => {
  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
      }}
      layoutId={`${c} method ${name}`}
    >
      <FunctionIcon />
      <span className={text}>{name}</span>
    </motion.div>
  );
};

interface EditableMethodProps {
  c: string;
  name: string;
  method: method;
  onClick: () => void;
  selected?: boolean;
}

const EditableMethod = ({
  c,
  name,
  method,
  onClick,
  selected,
}: EditableMethodProps) => {
  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 15,
        padding: "15px 20px",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        cursor: "pointer",
      }}
      variants={{
        initial: {
          backgroundColor: "rgba(255, 255, 255, 0)",
        },
        selected: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        },
      }}
      initial="initial"
      animate={selected ? "selected" : "initial"}
      onClick={onClick}
    >
      <Method c={c} name={name} method={method} />
    </motion.div>
  );
};
