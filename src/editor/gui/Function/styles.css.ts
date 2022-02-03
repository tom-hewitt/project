import { style } from "@vanilla-extract/css";
import { text } from "../../../styles/globals.css";

export const functionStyle = style([
  text,
  style({
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#2E2E2E",
    padding: 15,
    borderRadius: 7,
    gap: 10,
    width: "auto",
  }),
]);

export const astContainer = style({
  marginLeft: 7,
  marginTop: 5,
});

export const functionContainer = style({
  display: "inline-flex",
  flexDirection: "column",
  margin: "60px 0px 100px 0px",
});
