import {
  createContext,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { translateToString } from "./utils";

class DroppableInfo<Data = any> {
  ref: MutableRefObject<HTMLElement | null>;
  children: DroppableInfo<Data>[];
  z: number;
  setOver: (over: boolean) => void;
  onDrop: (data: Data) => void;

  constructor(
    ref: MutableRefObject<HTMLElement | null>,
    zIndex: number,
    children: DroppableInfo<Data>[],
    setOver: (over: boolean) => void,
    onDrop: (data: Data) => void
  ) {
    if (ref.current) {
      this.ref = ref;
      this.children = children;
      this.z = zIndex;
      this.setOver = setOver;
      this.onDrop = onDrop;
    } else {
      throw new Error("ref.current is undefined");
    }
  }

  get rect(): Rect {
    if (this.ref.current) {
      return this.ref.current.getBoundingClientRect();
    } else {
      throw new Error("ref.current is undefined");
    }
  }
}

interface Point {
  x: number;
  y: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface DraggableProps<Data> {
  data: Data;
  options: Partial<DraggableOptions>;
  children: (props: {
    drag: Drag;
    handle: Handle;
    overlay: boolean;
    placeholder: boolean;
  }) => JSX.Element;
}

interface Drag {
  ref?: (element: HTMLElement | null) => void;
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

interface Handle {
  onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void;
}

interface DroppableProps<Data> {
  onDrop: (data: Data) => void;
  children: (props: { drop: Drop; over: boolean }) => JSX.Element;
  z?: number;
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

function intersectRec(
  point: Point,
  droppables: DroppableInfo[]
): DroppableInfo | null {
  for (const droppable of droppables) {
    if (pointRectCollision(point, droppable.rect)) {
      const childIntersection = intersectRec(point, droppable.children);

      if (childIntersection === null) {
        return droppable;
      } else {
        return childIntersection;
      }
    }
  }

  return null;
}

function addChildDroppable(
  droppables: DroppableInfo[],
  newChild: DroppableInfo
) {
  let i = 0;

  const remove = () => {
    droppables.splice(i, 1);
  };

  while (i < droppables.length) {
    if (newChild.z > droppables[i].z) {
      droppables.splice(i, 0, newChild);
      return remove;
    }

    i++;
  }
  droppables.push(newChild);

  return remove;
}

const OverlayContext = createContext(false);

const PlaceholderContext = createContext(false);

export default function dragger<Data>() {
  const droppables: DroppableInfo[] = [];

  const intersect = (point: Point) => {
    return intersectRec(point, droppables);
  };

  const DroppableContext = createContext({
    register: (droppable: DroppableInfo) =>
      addChildDroppable(droppables, droppable),
  });

  const Draggable = ({
    children,
    data,
    options: partialOptions,
  }: DraggableProps<Data>) => {
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const options = {
      ...defaultDraggableOptions,
      ...partialOptions,
    };

    const [active, setActive] = useState(false);

    // Prevents stale use of 'active' in closures
    const activeRef = useRef(active);

    useEffect(() => {
      activeRef.current = active;
    }, [active]);

    const rect = useRef<Rect | null>(null);

    const initialMouse = useRef<Point | null>(null);

    const over = useRef<DroppableInfo | null>(null);

    const activate = (point: Point) => {
      if (node.current) {
        rect.current = node.current.getBoundingClientRect();

        setActive(true);

        calculateOver(point);

        const onMouseUp = () => {
          setActive(false);
          if (over.current) {
            over.current.setOver(false);
            over.current.onDrop(data);
          }

          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mouseup", onMouseUp);
      }
    };

    const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      const point: Point = { x: event.pageX, y: event.pageY };

      initialMouse.current = point;

      if (options.activation.type === "mouseDown") {
        activate(point);
      }

      const removeMouseMove = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", removeMouseMove);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", removeMouseMove);
    };

    const calculateOver = (point: Point) => {
      if (node.current && overlayRef.current && initialMouse.current) {
        rect.current = node.current.getBoundingClientRect();

        overlayRef.current.style.transform = translateToString({
          x: point.x - initialMouse.current.x,
          y: point.y - initialMouse.current.y,
        });

        const newOver = intersect(point);

        if (over.current && over.current !== newOver) {
          over.current.setOver(false);
        }

        if (newOver) {
          newOver.setOver(true);
        }

        over.current = newOver;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (activeRef.current) {
        calculateOver({ x: event.pageX, y: event.pageY });
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
        activate({ x: event.pageX, y: event.pageY });
      }
    };

    const overlayRef = useRef<HTMLDivElement | null>(null);

    return (
      <>
        <PlaceholderContext.Provider value={active}>
          {children({
            drag: {
              ref,
            },
            handle: {
              onMouseDown,
            },
            overlay: false,
            placeholder: active,
          })}
        </PlaceholderContext.Provider>

        {active && rect.current ? (
          <OverlayContext.Provider value={true}>
            {createPortal(
              <div
                ref={overlayRef}
                style={{
                  position: "fixed",
                  display: "block",
                  left: rect.current.left,
                  top: rect.current.top,
                  width: rect.current.width,
                  height: rect.current.height,
                  userSelect: "none",
                  zIndex: 99999999,
                }}
              >
                {children({
                  drag: {},
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

  const Droppable = ({ children, z = 0, onDrop }: DroppableProps<Data>) => {
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    const { register } = useContext(DroppableContext);

    const droppables = useRef<DroppableInfo[]>([]);

    const [over, setOver] = useState(false);

    const placeholder = useContext(PlaceholderContext);

    const overlay = useContext(OverlayContext);

    useLayoutEffect(() => {
      if (!placeholder && !overlay) {
        const info = new DroppableInfo(
          node,
          z,
          droppables.current,
          setOver,
          onDrop
        );

        return register(info);
      }
    }, [placeholder, overlay]);

    return (
      <DroppableContext.Provider
        value={{
          register: (droppable) =>
            addChildDroppable(droppables.current, droppable),
        }}
      >
        {children({ drop: { ref }, over })}
      </DroppableContext.Provider>
    );
  };

  return { Draggable, Droppable };
}
