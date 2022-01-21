import { style } from "@vanilla-extract/css";
import { text } from "../../../styles/globals.css";

export const blockStyle = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "7px",
  padding: "5px 7px",
  borderWidth: 1,
  borderStyle: "solid",
  boxSizing: "border-box",
  borderRadius: "7px",
  backgroundColor: "#353535",
  width: "fit-content",
});

export const inputStyle = style([
  text,
  style({
    background: "none",
    border: "none",
  }),
]);
