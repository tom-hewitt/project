import type { Active, Rect } from "../core";

export function mouseOverCollision<DraggableData>(
  active: Active<DraggableData>,
  rect: Rect
) {
  return (
    active.mousePosition.x > rect.left &&
    active.mousePosition.x < rect.left + rect.width &&
    active.mousePosition.y > rect.top &&
    active.mousePosition.y < rect.top + rect.height
  );
}
