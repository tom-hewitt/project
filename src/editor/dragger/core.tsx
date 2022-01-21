import { nanoid } from "nanoid";
import {
  createContext,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import create from "zustand";
import shallow from "zustand/shallow";
import { translateToString } from "./utils";

/**
 * A rectangle
 */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface DroppableInfo {
  id: string;
  ref: MutableRefObject<HTMLElement | null>;
  children: string[];
  z: number;
  disabled: boolean;
}

interface Point {
  x: number;
  y: number;
}

/**
 * The properties passed to a Draggable component
 */
interface DraggableProps<Data> {
  id?: string;
  data: Data;
  options?: Partial<DraggableOptions>;
  children: (props: {
    drag: Drag;
    handle: Handle;
    overlay: boolean;
    placeholder: boolean;
  }) => JSX.Element;
}

interface Drag {
  ref?: (element: HTMLElement | null) => void;
  key?: string;
}

type Activation = MouseDownActivation | MouseMoveActivation;

interface MouseDownActivation {
  type: "mouseDown";
  delay?: number;
}

interface MouseMoveActivation {
  type: "mouseMove";
  tolerance?: number;
}

interface DraggableOptions {
  activation: Activation;
}

const defaultDraggableOptions: DraggableOptions = {
  activation: {
    type: "mouseDown",
  },
};

export type MouseDownHandler = (event: React.MouseEvent<HTMLElement>) => void;

export interface Handle {
  onMouseDown?: MouseDownHandler;
}

interface DroppableProps<Data> {
  id?: string;
  onDrop?: (data: Data) => void;
  onDragOver?: (data: Data) => void;
  onDragLeave?: (data: Data) => void;
  children: (props: { drop: Drop; over: boolean }) => JSX.Element;
  z?: number;
  disabled?: boolean;
}

interface Drop {
  ref?: (element: HTMLElement | null) => void;
}

function pointRectCollision(point: Point, rect: Rect) {
  return (
    point.x > rect.left &&
    point.x < rect.left + rect.width &&
    point.y > rect.top &&
    point.y < rect.top + rect.height
  );
}

export const OverlayContext = createContext(false);

export const PlaceholderContext = createContext(false);

export default function dragger<Data>() {
  const droppables: { [key: string]: DroppableInfo } = {};

  const rootChildren: string[] = [];

  function intersectRec<Data>(point: Point, children: string[]): string | null {
    for (const id of children) {
      const droppable = droppables[id];

      const rect = droppable.ref.current?.getBoundingClientRect();

      if (!droppable.disabled && rect && pointRectCollision(point, rect)) {
        const childIntersection = intersectRec(point, droppable.children);

        if (childIntersection === null) {
          return id;
        } else {
          return childIntersection;
        }
      }
    }

    return null;
  }

  /**
   * Adds a child node to a droppable, maintaining the z index order
   * @param droppables the array of child droppables
   * @param newChild the new child to add
   * @returns a callback to remove the new child
   */
  function addChildDroppable(
    parentID: string | undefined,
    newChild: DroppableInfo
  ) {
    droppables[newChild.id] = newChild;

    const children = parentID ? droppables[parentID].children : rootChildren;

    // Counter variable to traverse the array
    let i = 0;

    // Callback to remove the new child
    const remove = () => {
      children.splice(i, 1);
    };

    // Loop until a droppable with a smaller z index is found
    while (i < children.length) {
      if (newChild.z > droppables[children[i]].z) {
        // Insert it before the droppable with smaller z index
        children.splice(i, 0, newChild.id);
        // Return the callback
        return remove;
      }

      i++;
    }

    // If no smaller z index is found, it must go at the end
    children.push(newChild.id);
    // Return the callback
    return remove;
  }

  const intersect = (point: Point) => {
    return intersectRec(point, rootChildren);
  };

  const DroppableContext = createContext<string | undefined>(undefined);

  let activeData: Data | null = null;

  let rect: Rect | null = null;

  let offset: Point | null = null;

  const useStore = create<{
    active?: {
      id: string;
    } | null;
    activate: (id: string) => void;
    deactivate: () => void;

    over: string | null;
    setOver: (over: string | null) => void;
  }>((set) => ({
    active: null,
    activate: (id) => {
      set({ active: { id } });
    },
    deactivate: () => {
      set({ active: undefined });
    },

    over: null,
    setOver: (over) => {
      set({ over });
    },
  }));

  const Draggable = ({
    id: givenID,
    children,
    data,
    options: partialOptions,
  }: DraggableProps<Data>) => {
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const id = useMemo(() => (givenID ? givenID : nanoid()), [givenID]);

    const options = {
      ...defaultDraggableOptions,
      ...partialOptions,
    };

    const { isActive, activate, deactivate, setOver } = useStore(
      ({ active, activate, deactivate, setOver }) => ({
        isActive: active?.id === id,
        activate,
        deactivate,
        setOver,
      }),
      shallow
    );

    const activateNode = (mouse: Point) => {
      if (node.current) {
        const boundingRect = node.current.getBoundingClientRect();
        rect = {
          top: boundingRect.top,
          left: boundingRect.left,
          width: boundingRect.width,
          height: boundingRect.height,
        };
        offset = { x: mouse.x - rect.left, y: mouse.y - rect.top };

        activeData = data;

        activate(id);
        calculateOver(mouse);
      }
    };

    const initialMouse = useRef<Point | null>(null);

    const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      const mouse: Point = { x: event.pageX, y: event.pageY };
      initialMouse.current = mouse;
      if (options.activation.type === "mouseDown") {
        event.stopPropagation();
        activateNode(mouse);
      }
    };

    const onMouseMove = (event: { pageX: number; pageY: number }) => {
      if (useStore.getState().active) {
        const mouse = { x: event.pageX, y: event.pageY };

        updateRect(mouse);
        updateOverlay(mouse);
        calculateOver(mouse);
      } else if (
        options.activation.type === "mouseMove" &&
        initialMouse.current &&
        (options.activation.tolerance === undefined ||
          // Distance from initial mouse position > tolerance
          Math.hypot(
            event.pageX - initialMouse.current.x,
            event.pageY - initialMouse.current.y
          ) > options.activation.tolerance)
      ) {
        const mouse: Point = { x: event.pageX, y: event.pageY };
        activateNode(mouse);
      }
    };

    const onMouseUp = () => {
      deactivate();
      setOver(null);
    };

    const overlayRef = useRef<HTMLDivElement | null>(null);

    const calculateOver = (point: Point) => {
      if (node.current && overlayRef.current && initialMouse.current) {
        setOver(intersect(point));
      }
    };

    const updateRect = (mouse: Point) => {
      if (rect && offset) {
        rect.left = mouse.x - offset.x;
        rect.top = mouse.y - offset.y;
      }
    };

    const updateOverlay = (mouse: Point) => {
      if (overlayRef.current && rect && offset) {
        overlayRef.current.style.transform = translateToString({
          x: rect.left,
          y: rect.top,
        });
      }
    };

    useEffect(() => {
      if (isActive) {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };
      }
    }, [isActive]);

    useEffect(() => {
      if (isActive) {
        activeData = data;
      }
    }, [isActive, data]);

    return (
      <>
        <PlaceholderContext.Provider value={isActive}>
          {children({
            drag: {
              ref,
            },
            handle: {
              onMouseDown,
            },
            overlay: false,
            placeholder: isActive,
          })}
        </PlaceholderContext.Provider>

        {isActive && rect ? (
          <OverlayContext.Provider value={true}>
            {createPortal(
              <div
                ref={overlayRef}
                style={{
                  position: "fixed",
                  display: "block",
                  left: 0,
                  top: 0,
                  transform: translateToString({
                    x: rect.left,
                    y: rect.top,
                  }),
                  width: rect.width,
                  height: rect.height,
                  userSelect: "none",
                  zIndex: 99999999,
                }}
              >
                {children({
                  drag: { key: id },
                  handle: {},
                  overlay: true,
                  placeholder: false,
                })}
              </div>,
              document.body
            )}
          </OverlayContext.Provider>
        ) : null}
      </>
    );
  };

  /**
   * A droppable component
   * @param z the z index
   * @param onDrop callback for when a draggable is dropped on the droppable
   * @param disabled whether the droppable should be disabled
   * @returns
   */
  const Droppable = ({
    children,
    id: givenID,
    z = 0,
    onDrop,
    onDragOver,
    onDragLeave,
    disabled = false,
  }: DroppableProps<Data>) => {
    // Set up a reference to the droppable HTML DOM element
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const id = useMemo(() => (givenID ? givenID : nanoid()), [givenID]);

    // Get the register function from the nearest parent droppable
    // in the tree
    const parent = useContext(DroppableContext);

    const over = useStore((store) => store.over);

    const isOver = over === id;

    const info = useRef<DroppableInfo>({
      id,
      ref: node,
      children: [],
      z,
      disabled,
    });

    useLayoutEffect(() => {
      info.current.z = z;

      return addChildDroppable(parent, info.current);
    }, [z]);

    // When the component's disabled property changes, mark the droppable
    // info as disabled
    useEffect(() => {
      info.current.disabled = disabled;
    }, [disabled]);

    useEffect(() => {
      if (isOver) {
        if (activeData) {
          onDragOver?.(activeData);
        }
      } else {
        if (!useStore.getState().active) {
          if (activeData) {
            onDrop?.(activeData);
          }
        } else {
          if (activeData) {
            onDragLeave?.(activeData);
          }
        }
      }
    }, [isOver]);

    return (
      <DroppableContext.Provider value={id}>
        {children({ drop: { ref }, over: isOver })}
      </DroppableContext.Provider>
    );
  };

  return { Draggable, Droppable };
}
