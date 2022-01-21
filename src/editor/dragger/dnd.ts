import { astRef, blockRef } from "../../code";
import { BlockData, useStore } from "../state";
import dragger from "./core";

export type DragData = BlockData;

export interface Drag {
  data: DragData;
}

export interface Drop {
  data: BlockData;
}
export const { Draggable, DragOverlay, Droppable } = dragger<Drag, Drop>({
  onDrop: (drag, drop) => {
    useStore.getState().dropBlock(drag.data, drop.data);
  },
});
