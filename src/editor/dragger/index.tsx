import {
  createContext,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import create from "zustand";
import { translateToString } from "./utils";

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

export default function dragger<DragData, DropData>() {
  const useStore = create<{ active: string | null }>(() => ({ active: null }));

  let activeData: DragData | undefined;

  let rect: Rect | undefined;

  let offset: Point | undefined;

  const updateRect = (mouse: Point) => {
    if (rect && offset) {
      rect.left = mouse.x - offset.x;
      rect.top = mouse.y - offset.y;
    }
  };

  interface UseDragOptions {
    id: string;
    data: DragData;
  }

  const useDrag = ({ id, data }: UseDragOptions) => {
    // Setup a reference to the draggable element
    const ref = useRef<HTMLElement>(null);

    const isDragging = useStore((store) => store.active === id);

    /**
     * Activates the dragging
     * @param mouse the initial position of the mouse
     */
    const activate = (mouse: Point) => {
      rect = ref.current?.getBoundingClientRect();

      if (rect) {
        offset = { x: mouse.x - rect.left, y: mouse.y - rect.top };
      }

      activeData = data;
    };

    const onMouseDown: MouseEventHandler<HTMLAreaElement> = (e) => {
      const mouse: Point = { x: e.clientX, y: e.clientY };

      activate(mouse);
    };

    // Keep the active data up to date with the data prop
    useEffect(() => {
      if (isDragging) {
        activeData = data;
      }
    }, [data]);

    return { drag: { ref }, handle: { onMouseDown }, isDragging };
  };

  const useActive = () => {
    const id = useStore((store) => store.active);

    return { id, data: activeData };
  };

  const OverlayContext = createContext(false);

  interface OverlayProps {
    children: ReactNode;
  }

  const DragOverlay = ({ children }: OverlayProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const updateOverlay = () => {
      if (ref.current && rect) {
        ref.current.style.transform = translateToString({
          x: rect.left,
          y: rect.top,
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      updateRect({ x: e.clientX, y: e.clientY });
      updateOverlay();
    };

    useEffect(() => {
      document.addEventListener("mousemove", onMouseMove);
      // document.addEventListener("mouseup", onMouseUp);

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        // document.removeEventListener("mouseup", onMouseUp);
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
}
