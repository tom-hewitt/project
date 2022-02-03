import { style } from "@vanilla-extract/css";

export const classMenuStyle = style({
  display: "flex",
  flexWrap: "wrap",
  padding: 50,
  gap: 20,
});

export const classCard = style({
  display: "flex",
  flexDirection: "column",
  padding: 20,
  gap: 10,
  width: 250,
  height: "fit-content",
  borderRadius: 14,
  backgroundColor: "#2E2E2E",
  cursor: "pointer",
});
