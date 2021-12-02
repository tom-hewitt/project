import { nanoid } from "nanoid";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import create from "zustand";
import shallow from "zustand/shallow";
import { translateToString } from "./utils";
import { mouseOverCollision } from "./utils/collisions";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Drag {
  ref?: (element: HTMLElement | null) => void;
}

export interface Drop {
  ref?: (element: HTMLElement | null) => void;
}

export interface Handle {
  onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void;
}

export type CollisionTest<Data> = (active: Active<Data>) => boolean;

export type CollisionAlgorithm<Data> = (
  active: Active<Data>,
  rect: Rect
) => boolean;

export interface DroppableInfo<Data> {
  collisionTest: CollisionTest<Data>;
  onDrop?: (active: Data) => void;
  onDragOver?: (active: Data) => void;
}

export interface Active<Data> {
  data: Data;
  rect: Rect;
  mousePosition: Position;
}

export type Activation = MouseDownActivation | MouseMoveActivation;

export interface MouseDownActivation {
  type: "mouseDown";
  delay?: number;
}

export interface MouseMoveActivation {
  type: "mouseMove";
  tolerance?: number;
}

export interface DraggableOptions {
  activation: Activation;
}

export type DraggableProps<Data> = {
  id: string;
  options?: Partial<DraggableOptions>;
  children: (props: {
    drag: Drag;
    handle: Handle;
    overlay: boolean;
    placeholder: boolean;
  }) => JSX.Element;
} & (Data extends undefined ? { data?: undefined } : { data: Data });

export interface DroppableProps<Data> {
  id: string;
  collision?: CollisionAlgorithm<Data>;
  onDrop?: (data: Data) => void;
  onDragOver?: (data: Data) => void;
  children: (props: {
    drop: Drop;
    over: boolean;
    active?: Data;
  }) => JSX.Element;
}

const defaultDraggableOptions: DraggableOptions = {
  activation: {
    type: "mouseDown",
  },
};

export default function dragger<Data = undefined>() {
  const useStore = create<{
    active?: {
      id: string;
      rect: Rect;
      data: Data;
    };
    over?: string;
    setActive: (
      active: { id: string; rect: Rect; data: Data } | undefined
    ) => void;
    setOver: (over: string | undefined) => void;
  }>((set) => ({
    setActive: (active) => {
      set({ active });
    },
    setOver: (over) => {
      set({ over });
    },
  }));

  const droppables: Map<string, DroppableInfo<Data>> = new Map();

  const collisions = (active: Active<Data>): string | undefined => {
    let over: string | undefined = undefined;

    droppables.forEach(({ collisionTest }, id) => {
      const result = collisionTest(active);

      if (result) {
        over = id;
      }
    });

    return over;
  };

  const OverlayContext = createContext(false);

  const PlaceholderContext = createContext(false);

  const Draggable = ({
    id,
    data,
    children,
    options: partialOptions = {},
  }: DraggableProps<Data>) => {
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const overlayRef = useRef<HTMLDivElement | null>(null);

    const { isActive, rect, setActive, setOver } = useStore(
      (store) => ({
        isActive: store.active?.id === id,
        rect: store.active?.id === id ? store.active.rect : null,
        setActive: store.setActive,
        setOver: store.setOver,
      }),
      shallow
    );

    const overlay = useContext(OverlayContext);

    const options: DraggableOptions = Object.assign(
      defaultDraggableOptions,
      partialOptions
    );

    if (overlay) {
      return children({
        drag: {},
        handle: {},
        overlay: false,
        placeholder: false,
      });
    }

    const activate = (initialMousePos: { x: number; y: number }) => {
      if (node.current) {
        const rect = node.current.getBoundingClientRect();
        setActive({ id, rect, data: data as Data });

        setOver(
          collisions({
            rect,
            data: data as Data,
            mousePosition: initialMousePos,
          })
        );
      }
    };

    const onMouseMove = (event: MouseEvent, initialMousePos: Position) => {
      const distance = Math.hypot(
        event.pageX - initialMousePos.x,
        event.pageY - initialMousePos.y
      );

      if (
        useStore.getState().active?.id !== id &&
        options.activation.type === "mouseMove" &&
        (options.activation.tolerance === undefined ||
          distance > options.activation.tolerance)
      ) {
        activate(initialMousePos);
      }

      if (overlayRef.current) {
        overlayRef.current.style.transform = translateToString({
          x: event.pageX - initialMousePos.x,
          y: event.pageY - initialMousePos.y,
        });

        const { over, setOver } = useStore.getState();

        const newOver = collisions({
          rect: overlayRef.current.getBoundingClientRect(),
          data: data as Data,
          mousePosition: { x: event.pageX, y: event.pageY },
        });

        if (newOver !== over) {
          setOver(newOver);
        }
      }
    };

    const onMouseUp = () => {
      setActive(undefined);

      const { over } = useStore.getState();

      if (over) {
        const onDrop = droppables.get(over)?.onDrop;
        if (onDrop) {
          onDrop(data as Data);
        }
      }

      setOver(undefined);
    };

    const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      const handleMouseMove = (e: MouseEvent) => {
        onMouseMove(e, {
          x: event.pageX,
          y: event.pageY,
        });
      };

      const dispose = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mouseup", dispose);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mouseup", dispose);

      if (options.activation.type === "mouseDown") {
        activate({
          x: event.pageX,
          y: event.pageY,
        });
      }
    };

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

        {isActive && rect
          ? createPortal(
              <div
                ref={overlayRef}
                style={{
                  position: "fixed",
                  display: "block",
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  userSelect: "none",
                  zIndex: 99999999,
                }}
              >
                <OverlayContext.Provider value={true}>
                  {children({
                    drag: {},
                    handle: {},
                    overlay: true,
                    placeholder: false,
                  })}
                </OverlayContext.Provider>
              </div>,
              document.body
            )
          : null}
      </>
    );
  };

  const Droppable = ({
    id,
    collision = mouseOverCollision,
    onDrop,
    onDragOver,
    children,
  }: DroppableProps<Data>) => {
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const overId = useStore((state) => state.over);

    const active = useStore((state) => state.active);

    useEffect(() => {
      if (overId === id && active) {
        if (onDragOver) {
          onDragOver(active.data);
        }
      }
    }, [active, overId]);

    const over = overId === id;

    const overlay = useContext(OverlayContext);
    const placeholder = useContext(PlaceholderContext);

    useEffect(() => {
      if (!overlay && !placeholder) {
        if (droppables.has(id)) {
          throw new Error(
            `dragger: Spotted multiple droppables with id "${id}"`
          );
        }

        const collisionTest: CollisionTest<Data> = (active) => {
          if (node.current) {
            return collision(active, node.current.getBoundingClientRect());
          }

          return false;
        };

        droppables.set(id, {
          collisionTest,
          onDrop,
          onDragOver,
        });

        return () => {
          droppables.delete(id);
        };
      }

      return;
    }, [overlay, placeholder, id, collision, onDrop]);

    return children({ drop: { ref }, over, active: active?.data });
  };

  return { Draggable, Droppable };
}
