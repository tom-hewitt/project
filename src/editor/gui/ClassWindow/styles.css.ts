import { style } from "@vanilla-extract/css";

export const classWindowStyle = style({
  display: "flex",
  flexDirection: "row",
  width: "100%",
});

export const classEditorStyle = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  overflow: "scroll",
  flex: "1",
});
