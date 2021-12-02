import dragger from "../../dragger/core";

export type DragData = DragPreviewData | DragObjectData | DragModelData;

export interface Drag {
  data: DragData;
}

export interface DragPreviewData {
  type: "Class" | "Level";
  id: string;
}

export interface DragObjectData {
  type: "Object";
  id: string;
}

export interface DragModelData {
  type: "Model";
  name: string;
}

export const { Draggable, Droppable } = dragger<Drag>();
