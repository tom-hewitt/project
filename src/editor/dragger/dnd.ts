import { BlockData } from "../state";
import dragger from "./";

export type DragData = BlockData;

export interface Drag {
  data: DragData;
}

export interface Drop {
  data: BlockData;
}

export const {
  Draggable,
  Droppable,
  useActive,
  DragOverlay,
  useOverlay,
  usePlaceholder,
} = dragger<Drag>();
