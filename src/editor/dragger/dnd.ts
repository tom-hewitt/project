import { astRef, blockRef } from "../../code";
import dragger from "./core";

export type DragData = BlockDragData;

export interface Drag {
  data: DragData;
}

export interface BlockDragData {
  type: "Block";
  blockRef: blockRef;
  astRef: astRef;
  index: number;
}

export const { Draggable, Droppable } = dragger<Drag>();
