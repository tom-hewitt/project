import { style } from "@vanilla-extract/css";
import { text } from "../../../styles/globals.css";

export const marginText = style([text, style({ margin: 3 })]);

export const sequenceStyle = style({
  borderLeft: "1px solid #2E2E2E",

  display: "inline-flex",
  flexDirection: "column",
  width: "fit-content",
  padding: 5,
});

export const primitiveBlockStyle = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "7px 8px",
  borderWidth: 1,
  gap: 5,
  borderStyle: "solid",
  boxSizing: "border-box",
  borderRadius: "7px",
  backgroundColor: "#2E2E2E",
  width: "fit-content",
});

export const droppableStyle = style({
  padding: 2,
  borderRadius: 9,
});

export const blockStyle = style([
  primitiveBlockStyle,
  style({
    padding: "5px 7px 5px 10px",
    minHeight: 36,
  }),
]);

export const inputStyle = style([
  text,
  style({
    background: "none",
    border: "none",
  }),
]);

export const placeholderStyle = style([
  text,
  style({
    padding: "5px 7px",
    background: "#2D2D2D",
    borderRadius: 14,
    cursor: "pointer",
  }),
]);

export const sequencePlaceholderStyle = style([text, sequenceStyle]);

export const variableStyle = style([
  text,
  style({
    padding: "7px 8px",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "fit-content",
    gap: 5,
  }),
]);

export const attributeStyle = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

export const astDesriptionStyle = style([
  style({
    color: "#737373",
    padding: "5px 5px 5px 10px",
  }),
  text,
]);

export const indented = style({
  marginLeft: 20,
});

export const horizonstal = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
});
