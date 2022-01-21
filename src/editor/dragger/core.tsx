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
} from "react";
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

interface DroppableInfo<Data> {
  id: string;
  ref: MutableRefObject<HTMLElement | null>;
  children: string[];
  z: number;
  disabled: boolean;
  data: Data;
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
    isDragging: boolean;
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
  children: (props: { drop: Drop; over: boolean }) => JSX.Element;
  z?: number;
  disabled?: boolean;
  data: Data;
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

export interface DraggerOptions<DraggableData, DroppableData> {
  onDrop?: (draggableData: DraggableData, droppableData: DroppableData) => void;
  onDragOver?: (
    draggableData: DraggableData,
    droppableData: DroppableData
  ) => void;
}

export default function dragger<DraggableData, DroppableData>(
  options?: DraggerOptions<DraggableData, DroppableData>
) {
  const droppables: { [key: string]: DroppableInfo<DroppableData> } = {};

  const rootChildren: string[] = [];

  function intersectRec(point: Point, children: string[]): string | null {
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
    newChild: DroppableInfo<DroppableData>
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

  let activeData: DraggableData | null = null;

  let rect: Rect | null = null;

  let offset: Point | null = null;

  let initialMouse: Point | null = null;

  const useStore = create<{
    active: {
      id: string;
    } | null;
    activate: (id: string) => void;
    drop: () => void;

    over: string | null;
    setOver: (over: string | null) => void;
  }>((set) => ({
    active: null,
    activate: (id) => {
      set({ active: { id } });
    },
    drop: () => {
      set(({ over }) => {
        if (activeData && over) {
          options?.onDrop?.(activeData, droppables[over].data);
        }
        return { active: null, over: null };
      });
    },

    over: null,
    setOver: (newOver) => {
      set(({ over }) => {
        if (newOver !== over) {
          if (activeData && newOver) {
            options?.onDragOver?.(activeData, droppables[newOver].data);
          }
        }
      });
    },
  }));

  const updateRect = (mouse: Point) => {
    if (rect && offset) {
      rect.left = mouse.x - offset.x;
      rect.top = mouse.y - offset.y;
    }
  };

  const Draggable = ({
    id: givenID,
    children,
    data,
    options: partialOptions,
  }: DraggableProps<DraggableData>) => {
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const id = useMemo(() => (givenID ? givenID : nanoid()), [givenID]);

    const options = {
      ...defaultDraggableOptions,
      ...partialOptions,
    };

    const { isDragging, activate } = useStore(
      ({ active, activate }) => ({
        isDragging: active?.id === id,
        activate,
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
      }
    };

    const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      const mouse: Point = { x: event.clientX, y: event.clientY };
      initialMouse = mouse;
      if (options.activation.type === "mouseDown") {
        event.stopPropagation();
        activateNode(mouse);
      }
    };

    useEffect(() => {
      if (isDragging) {
        activeData = data;
      }
    }, [isDragging, data]);

    return (
      <PlaceholderContext.Provider value={isDragging}>
        {children({
          drag: {
            ref,
          },
          handle: {
            onMouseDown,
          },
          isDragging,
        })}
      </PlaceholderContext.Provider>
    );
  };

  interface DragOverlayProps {
    children: (props: { data: DraggableData }) => JSX.Element;
  }

  const DragOverlay = ({ children }: DragOverlayProps) => {
    const ref = useRef<HTMLDivElement | null>(null);

    const updateOverlay = (mouse: Point) => {
      if (ref.current && rect && offset) {
        ref.current.style.transform = translateToString({
          x: rect.left,
          y: rect.top,
        });
      }
    };

    const active = useStore((store) => store.active);

    const { setOver, drop } = useStore(
      (store) => ({
        setOver: store.setOver,
        activate: store.activate,
        drop: store.drop,
      }),
      shallow
    );

    const onMouseMove = (event: MouseEvent) => {
      if (useStore.getState().active) {
        const mouse = { x: event.clientX, y: event.clientY };

        updateRect(mouse);
        updateOverlay(mouse);
        calculateOver(mouse);
      }
    };

    const calculateOver = (point: Point) => {
      setOver(intersect(point));
    };

    const onMouseUp = () => {
      drop();
      setOver(null);
    };

    useEffect(() => {
      if (active && initialMouse) {
        calculateOver(initialMouse);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };
      }
    }, [active]);

    return active && rect && activeData ? (
      <OverlayContext.Provider value={true}>
        <div
          ref={ref}
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
          {children({ data: activeData })}
        </div>
      </OverlayContext.Provider>
    ) : null;
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
    data,
    disabled = false,
  }: DroppableProps<DroppableData>) => {
    // Set up a reference to the droppable HTML DOM element
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const id = useMemo(() => (givenID ? givenID : nanoid()), [givenID]);

    // Get the register function from the nearest parent droppable
    // in the tree
    const parent = useContext(DroppableContext);

    const isOver = useStore((store) => store.over === id);

    console.log(id, isOver);

    const isPlaceholder = useContext(PlaceholderContext);

    const isOverlay = useContext(OverlayContext);

    const info = useRef<DroppableInfo<DroppableData>>({
      id,
      ref: node,
      children: [],
      z,
      disabled,
      data,
    });

    const cleanup = useMemo(() => {
      info.current.id = id;
      info.current.ref = node;
      info.current.z = z;
      info.current.disabled = disabled || isPlaceholder || isOverlay;

      return addChildDroppable(parent, info.current);
    }, [id, node, z, disabled, isPlaceholder, isOverlay]);

    useLayoutEffect(() => {
      return cleanup;
    }, []);

    return (
      <DroppableContext.Provider value={id}>
        {children({ drop: { ref }, over: isOver })}
      </DroppableContext.Provider>
    );
  };

  return { Draggable, DragOverlay, Droppable };
}
