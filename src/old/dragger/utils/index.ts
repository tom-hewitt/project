export const translateToString = ({ x, y }: { x: number; y: number }) => {
  return `translate3d(${x ? Math.round(x) : 0}px, ${
    y ? Math.round(y) : 0
  }px, 0)`;
};
