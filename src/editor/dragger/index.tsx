import produce from "immer";
import React, {
  createContext,
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import create from "zustand";
import shallow from "zustand/shallow";
import { translateToString, useCombinedRefs } from "./utils";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function pointRectCollision(point: Point, rect: Rect) {
  return (
    point.x > rect.left &&
    point.x < rect.left + rect.width &&
    point.y > rect.top &&
    point.y < rect.top + rect.height
  );
}

export default function dragger<DragData>() {
  interface Droppable {
    id: string;
    z: number;
    disabled: boolean;
    children: string[];
    node: MutableRefObject<HTMLElement | null>;
    onDrop?: (drag: DragData) => void;
    canDragOver?: (drag: DragData) => boolean;
    // null parent means that it is a root child,
    // undefined means that it hasn't been inserted yet
    parent: string | null | undefined;
  }

  const droppables: { [key: string]: Droppable } = {};
  let rootChildren: string[] = [];
  let activeData: DragData | null = null;
  let rect: Rect | null = null;
  let offset: Point | null = null;

  const insertDroppable = (
    droppables: { [key: string]: Droppable },
    id: string,
    z: number,
    children: string[]
  ) => {
    // Loop over the children to find a place to insert the droppable
    let i = 0;
    while (i < children.length) {
      const droppableID = children[i];
      const droppable = droppables[droppableID];

      if (z > droppable.z) {
        break;
      }

      i++;
    }

    children.splice(i, 0, id);
  };

  const removeChild = (children: string[], child: string) => {
    children.splice(
      children.findIndex((val) => val === child),
      1
    );
  };

  const registerDroppable = (
    parent: string | null,
    id: string,
    z: number,
    disabled: boolean,
    node: MutableRefObject<HTMLElement | null>,
    onDrop?: (drag: DragData) => void,
    canDragOver?: (drag: DragData) => boolean
  ) => {
    const droppable = droppables[id];

    // If the parent and z haven't changed, it can stay in the same place
    // in the tree
    if (droppable && z === droppable.z && parent === droppable.parent) {
      droppables[id] = {
        ...droppable,
        disabled,
        node,
        onDrop,
        canDragOver,
      };

      return;
    }

    if (droppable) {
      // If the parent or z has changed, first remove from the
      // parent's children array
      if (droppable.parent) {
        removeChild(droppables[droppable.parent].children, id);
      } else if (droppable.parent === null) {
        removeChild(rootChildren, id);
      }

      // Update the existing droppable
      droppables[id] = {
        ...droppable,
        parent,
        z,
        disabled,
        node,
        onDrop,
        canDragOver,
      };
    } else {
      // If the droppable hasn't been created yet, create it
      droppables[id] = {
        id,
        z,
        disabled,
        node,
        onDrop,
        canDragOver,
        children: [],
        parent,
      };
    }

    if (parent && !droppables[parent]) {
      // If the parent hasn't been registered, create it
      // It will be updated with the correct information when it
      // tries to register itself
      droppables[parent] = {
        id: parent,
        z: 0,
        disabled: true,
        children: [],
        node: { current: null },
        parent: undefined,
      };
    }

    const children = parent ? droppables[parent].children : rootChildren;

    // Insert into the tree
    insertDroppable(droppables, id, z, children);
  };

  const unregisterDroppable = (id: string) => {
    const droppable = droppables[id];

    // Remove from the parent's children
    if (droppable.parent && droppables[droppable.parent]) {
      removeChild(droppables[droppable.parent].children, id);
    } else if (droppable.parent === null) {
      removeChild(rootChildren, id);
    }

    // Delete from the hash map
    delete droppables[id];
  };

  const intersect = (point: Point, children: string[]): string | null => {
    for (const id of children) {
      const droppable = droppables[id];

      const rect = droppable.node.current?.getBoundingClientRect();

      if (rect && pointRectCollision(point, rect)) {
        const childIntersection = intersect(point, droppable.children);

        if (!activeData) {
          throw new Error();
        }

        if (
          !droppable.disabled &&
          (!droppable.canDragOver ||
            droppable.canDragOver(activeData) === true) &&
          childIntersection === null
        ) {
          return id;
        } else {
          return childIntersection;
        }
      }
    }

    return null;
  };

  interface Store {
    active: string | null;
    setActive: (active: string | null) => void;

    over: string | null;
    setOver: (over: string | null) => void;

    drop: () => void;
  }

  const useStore = create<Store>((set, get) => ({
    active: null,
    setActive: (active) => set({ active }),

    over: null,
    setOver: (over) => set({ over }),

    drop: () => {
      const store = get();

      if (store.over && activeData) {
        droppables[store.over].onDrop?.(activeData);
      }

      set({ active: null, over: null });
    },
  }));

  const PlaceholderContext = createContext(false);

  const usePlaceholder = () => {
    return useContext(PlaceholderContext);
  };

  interface DraggableProps {
    id: string;
    data: DragData;
    children: (props: {
      drag: { ref: (element: HTMLElement | null) => void };
      handle: { onMouseDown: MouseEventHandler };
      isDragging: boolean;
    }) => JSX.Element;
    disabled?: boolean;
  }

  const Draggable = ({ id, data, children, disabled }: DraggableProps) => {
    // Setup a reference to the draggable element
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const { isDragging, setActive } = useStore(
      (store) => ({
        isDragging: id === store.active,
        setActive: store.setActive,
      }),
      shallow
    );

    /**
     * Activates the dragging
     * @param mouse the initial position of the mouse
     */
    const activateDrag = (mouse: Point) => {
      if (node.current && !disabled) {
        const boundingRect = node.current.getBoundingClientRect();

        rect = {
          top: boundingRect.top,
          left: boundingRect.left,
          width: boundingRect.width,
          height: boundingRect.height,
        };

        offset = { x: mouse.x - rect.left, y: mouse.y - rect.top };

        activeData = data;

        setActive(id);
      }
    };

    const onMouseDown: MouseEventHandler = (e) => {
      e.stopPropagation();

      const mouse: Point = { x: e.clientX, y: e.clientY };

      activateDrag(mouse);
    };

    // Keep the active data up to date with the data prop
    useEffect(() => {
      if (isDragging) {
        activeData = data;
      }
    }, [data]);

    const isPlaceholder = usePlaceholder();

    return (
      <PlaceholderContext.Provider value={isDragging || isPlaceholder}>
        {children({ drag: { ref }, handle: { onMouseDown }, isDragging })}
      </PlaceholderContext.Provider>
    );
  };

  interface DroppableProps {
    children: (props: {
      drop: { ref: (element: HTMLElement | null) => void };
      isOver: boolean;
    }) => JSX.Element;
    id: string;
    z?: number;
    disabled?: boolean;
    onDrop?: (data: DragData) => void;
    onDragOver?: (data: DragData) => void;
    canDragOver?: (data: DragData) => boolean;
  }

  const DroppableContext = createContext<string | null>(null);

  const Droppable = ({
    children,
    id,
    z = 0,
    disabled = false,
    onDrop,
    canDragOver,
  }: DroppableProps) => {
    // Setup a reference to the droppable element
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    // Get the id of the parent droppable
    const parent = useContext(DroppableContext);

    const isOverlay = useOverlay();

    const isPlaceholder = usePlaceholder();

    useEffect(() => {
      return () => {
        if (!isOverlay) {
          unregisterDroppable(id);
        }
      };
    }, [id]);

    useLayoutEffect(() => {
      if (!isOverlay) {
        registerDroppable(
          parent,
          id,
          z,
          disabled || isPlaceholder,
          node,
          onDrop,
          canDragOver
        );
      }
    }, [id, isOverlay, disabled, z, node, onDrop]);

    const isOver = useStore((store) => id === store.over);

    return (
      <DroppableContext.Provider value={id}>
        {children({ drop: { ref }, isOver })}
      </DroppableContext.Provider>
    );
  };

  const useActive = () => {
    return useStore((store) => ({
      id: store.active,
      data: store.active !== null ? activeData : null,
    }));
  };

  const OverlayContext = createContext(false);

  const useOverlay = () => {
    return useContext(OverlayContext);
  };

  interface OverlayProps {
    children: ReactNode;
  }

  const DragOverlay = ({ children }: OverlayProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const onMouseMove = (e: MouseEvent) => {
      const mouse = { x: e.clientX, y: e.clientY };

      if (ref.current && rect && offset) {
        ref.current.style.transform = translateToString({
          x: mouse.x - offset.x,
          y: mouse.y - offset.y,
        });
      }

      const over = intersect(mouse, rootChildren);
      const store = useStore.getState();
      if (over !== store.over) {
        store.setOver(over);
      }
    };

    const drop = useStore((store) => store.drop);

    const onMouseUp = () => {
      drop();
    };

    useEffect(() => {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
    });

    return rect ? (
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
          {children}
        </div>
      </OverlayContext.Provider>
    ) : null;
  };

  return {
    Draggable,
    Droppable,
    useActive,
    DragOverlay,
    useOverlay,
    usePlaceholder,
  };
}
