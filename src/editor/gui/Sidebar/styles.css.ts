import { style } from "@vanilla-extract/css";

export const sidebarStyle = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: 45,
  height: "100vh",
  borderRight: "1px solid #3E3E3E",
});

export const sidebarButtonStyle = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 45,
  height: 45,
  cursor: "pointer",
});
