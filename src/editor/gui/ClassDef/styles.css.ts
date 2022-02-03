import { style } from "@vanilla-extract/css";
import { subheading } from "../../../styles/globals.css";

export const classDefStyle = style({
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#2E2E2E",
  width: 350,
  flex: "none",
  borderRight: "1px solid #3E3E3E",
  overflowY: "scroll",
});

export const paddedSubheading = style([
  subheading,
  style({
    padding: "15px 20px",
  }),
]);

export const button = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "15px 20px",
  gap: 10,
  cursor: "pointer",
});

export const horizontal = style({
  display: "flex",
  flexDirection: "row",
  gap: 10,
  alignItems: "center",
});
