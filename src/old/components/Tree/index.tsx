import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { StateSelector } from "zustand";
import { store, useStore } from "../../project";
import styles from "./styles.module.css";
import { Draggable, Drag, Droppable } from "../../../editor/dragger/dnd";
import { reparentObject } from "../../project/sceneObject";
import { ThemeContext } from "../Project";

interface node {
  id: string;
  children: string[];
}

interface NodeProps<N extends node> {
  id: string;
  selector: (id: string) => StateSelector<store, N>;
  selected: string | null;
  select: (object: string | null) => void;
  margin?: number;
  children: (node: N) => React.ReactNode;
}

export default function Tree<N extends node>({
  id,
  selector,
  selected,
  select,
  children,
}: NodeProps<N>) {
  const node = useStore(selector(id));

  const execute = useStore((store) => store.execute);

  const onDrop = ({ data }: Drag) => {
    switch (data.type) {
      case "Object": {
        if (data.id !== id) {
          execute(reparentObject(data.id, id));
        }
      }
      case "Class": {
        return;
      }
    }
  };

  return (
    <Droppable onDrop={onDrop}>
      {({ drop, over }) => (
        <motion.div
          {...drop}
          className={styles.tree}
          initial={{
            borderColor: over
              ? "rgba(214, 214, 214, 1)"
              : "rgba(214, 214, 214, 0)",
          }}
          animate={{
            borderColor: over
              ? "rgba(214, 214, 214, 1)"
              : "rgba(214, 214, 214, 0)",
          }}
        >
          {node.children.map((id) => (
            <Node
              id={id}
              selector={selector}
              selected={selected}
              select={select}
              key={id}
            >
              {children}
            </Node>
          ))}
        </motion.div>
      )}
    </Droppable>
  );
}

export function Node<N extends node>({
  id,
  selector,
  selected,
  select,
  margin = 20,
  children,
}: NodeProps<N>) {
  const node = useStore(selector(id));
  const [expanded, setExpanded] = useState(true);

  const isSelected = selected === id;

  const execute = useStore((store) => store.execute);

  const onDrop = ({ data }: Drag) => {
    switch (data.type) {
      case "Object": {
        if (data.id !== id) {
          execute(reparentObject(data.id, id));
        }
      }
      case "Class": {
        return;
      }
    }
  };

  const { light } = useContext(ThemeContext);

  const background = light ? "#BABABA" : "#353535";

  const foreground = light ? "#353535" : "#D6D6D6";

  return (
    <Droppable onDrop={onDrop}>
      {({ drop, over }) => (
        <motion.div
          {...drop}
          className={styles.droppable}
          initial={{
            borderColor: over
              ? "rgba(214, 214, 214, 1)"
              : "rgba(214, 214, 214, 0)",
          }}
          animate={{
            borderColor: over
              ? "rgba(214, 214, 214, 1)"
              : "rgba(214, 214, 214, 0)",
          }}
        >
          <Draggable
            data={{ data: { type: "Object", id } }}
            options={{ activation: { type: "mouseMove" } }}
          >
            {({ drag, handle, overlay, placeholder }) => (
              <motion.div
                {...drag}
                {...handle}
                className={styles.node}
                initial={{
                  boxShadow: overlay ? "0px 5px 5px 0 rgba(0, 0, 0, 0.25)" : "",
                }}
                animate={{
                  boxShadow: overlay ? "0px 5px 5px 0 rgba(0, 0, 0, 0.25)" : "",
                  opacity: overlay ? 0.8 : placeholder ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    backgroundColor: background,

                    color: foreground,
                  }}
                >
                  <motion.div
                    className={styles.content}
                    variants={{
                      initial: {
                        backgroundColor: "rgba(126, 126, 126, 0)",
                        paddingLeft: margin,
                      },
                      selected: {
                        backgroundColor: "rgba(126, 126, 126, 0.3)",
                      },
                    }}
                    initial="initial"
                    animate={isSelected ? "selected" : "initial"}
                    onClick={() => select(id)}
                  >
                    {node.children.length ? (
                      <div onClick={() => setExpanded(!expanded)}>
                        <ExpandIcon expanded={expanded} />
                      </div>
                    ) : (
                      <NoChildrenIcon />
                    )}
                    {children(node)}
                  </motion.div>
                </div>
                {expanded ? (
                  <div>
                    {node.children.map((id) => (
                      <Node
                        id={id}
                        selector={selector}
                        selected={selected}
                        select={select}
                        key={id}
                        margin={margin + 16}
                      >
                        {children}
                      </Node>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            )}
          </Draggable>
        </motion.div>
      )}
    </Droppable>
  );
}

interface ExpandProps {
  expanded: boolean;
}

export function ExpandIcon({ expanded }: ExpandProps) {
  return (
    <motion.svg
      width="8"
      height="9"
      viewBox="0 0 8 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={{
        expanded: {
          rotate: 0,
        },
        hidden: {
          rotate: -90,
        },
      }}
      initial={expanded ? "expanded" : "hidden"}
      animate={expanded ? "expanded" : "hidden"}
    >
      <path d="M1.5 3L4 6L6.5 3" stroke="currentColor" strokeOpacity="0.5" />
    </motion.svg>
  );
}

function NoChildrenIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="4" cy="4" r="1" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}
