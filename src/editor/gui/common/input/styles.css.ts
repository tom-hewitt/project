import { style } from "@vanilla-extract/css";
import { text } from "../../../../styles/globals.css";

export const grid = style({
  display: "inline-grid",
  alignItems: "center",
});

export const input = style([
  text,
  style({
    width: "auto",
    gridArea: "1 / 1 / 2 / 2",

    background: "none",
    border: "none",
    outline: "none",
    padding: 0,
    margin: 0,

    userSelect: "text",
  }),
]);

export const shadowElement = style([
  text,
  style({
    gridArea: "1 / 1 / 2 / 2",
    visibility: "hidden",
    width: "fit-content",
    whiteSpace: "pre-wrap",
  }),
]);
