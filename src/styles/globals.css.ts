import { style } from "@vanilla-extract/css";

export const text = style({
  fontFamily: "Roboto",
  color: "#D6D6D6",
  fontSize: 12,
  userSelect: "none",
});

export const pointer = style({
  cursor: "pointer",
});

export const pointerText = style([text, pointer]);
