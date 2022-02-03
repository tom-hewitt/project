import { style } from "@vanilla-extract/css";
import { h2, text } from "../../../styles/globals.css";

export const blockPaletteStyle = style({
  display: "flex",
  flexDirection: "column",
  width: 300,
  flex: "none",
  borderLeft: "1px solid #3E3E3E",
});

export const deleteStyle = style([
  h2,
  style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  }),
]);

export const blocksContainer = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
});
