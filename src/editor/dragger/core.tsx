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

/**
 * A rectangle
 */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * A node in the droppable tree
 */
class DroppableInfo<Data = any> {
  /**
   * Reference to the HTML DOM element
   */
  ref: MutableRefObject<HTMLElement | null>;

  /**
   * Array of child nodes
   */
  children: DroppableInfo<Data>[];

  /**
   * The z index of the droppable
   */
  z: number;

  /**
   * Callback for when a draggable is dragged over this droppable
   */
  setOver: (over: boolean) => void;

  /**
   * Callback for when a draggable is dropped on this droppable
   */
  onDrop: (data: Data) => void;

  /**
   * Whether the droppable has been disabled
   */
  disabled: boolean;

  constructor(
    ref: MutableRefObject<HTMLElement | null>,
    zIndex: number,
    children: DroppableInfo<Data>[],
    setOver: (over: boolean) => void,
    onDrop: (data: Data) => void,
    disabled: boolean
  ) {
    this.ref = ref;
    this.children = children;
    this.z = zIndex;
    this.setOver = setOver;
    this.onDrop = onDrop;
    this.disabled = disabled;
  }

  /**
   * Gets the bounding box of the droppable area
   */
  get rect(): Rect | null {
    if (this.ref.current) {
      return this.ref.current.getBoundingClientRect();
    } else {
      return null;
    }
  }
}

interface Point {
  x: number;
  y: number;
}

/**
 * The properties passed to a Draggable component
 */
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

function intersectRec(
  point: Point,
  droppables: DroppableInfo[]
): DroppableInfo | null {
  for (const droppable of droppables) {
    const rect = droppable.rect;
    if (!droppable.disabled && rect && pointRectCollision(point, rect)) {
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

/**
 * Adds a child node to a droppable, maintaining the z index order
 * @param droppables the array of child droppables
 * @param newChild the new child to add
 * @returns a callback to remove the new child
 */
function addChildDroppable(
  droppables: DroppableInfo[],
  newChild: DroppableInfo
) {
  // Counter variable to traverse the array
  let i = 0;

  // Callback to remove the new child
  const remove = () => {
    droppables.splice(i, 1);
  };

  // Loop until a droppable with a smaller z index is found
  while (i < droppables.length) {
    if (newChild.z > droppables[i].z) {
      // Insert it before the droppable with smaller z index
      droppables.splice(i, 0, newChild);
      // Return the callback
      return remove;
    }

    i++;
  }

  // If no smaller z index is found, it must go at the end
  droppables.push(newChild);
  // Return the callback
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

  /**
   * A droppable component
   * @param z the z index
   * @param onDrop callback for when a draggable is dropped on the droppable
   * @param disabled whether the droppable should be disabled
   * @returns
   */
  const Droppable = ({
    children,
    z = 0,
    onDrop,
    disabled = false,
  }: DroppableProps<Data>) => {
    // Set up a reference to the droppable HTML DOM element
    const node = useRef<HTMLElement | null>(null);
    const ref = useCallback((element: HTMLElement | null) => {
      node.current = element;
    }, []);

    // Get the register function from the nearest parent droppable
    // in the tree
    const { register } = useContext(DroppableContext);

    // Array of child nodes
    const droppables = useRef<DroppableInfo[]>([]);

    // Tracks whether a draggable is being dragged over the droppable
    const [over, setOver] = useState(false);

    // Create the DroppableInfo instance
    const info = useRef<DroppableInfo>(
      new DroppableInfo(node, z, droppables.current, setOver, onDrop, disabled)
    );

    // When the component's onDrop property changes, update the info
    useEffect(() => {
      info.current.onDrop = onDrop;
    }, [onDrop]);

    // When the component's disabled property changes, mark the droppable
    // info as disabled
    useEffect(() => {
      info.current.disabled = disabled;
    }, [disabled]);

    // Register the droppable after the initial paint, or when the
    // z index changes. z index changing could cause a change in the
    // order of the parent's children
    useLayoutEffect(() => {
      // Update the z index
      info.current.z = z;

      // Call the register function, which returns a deregister function
      const deregister = register(info.current);

      // Return the deregister function, which will be called when the
      // component unmounts
      return deregister;
    }, [z]);

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
