import { style } from "@vanilla-extract/css";

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
});
