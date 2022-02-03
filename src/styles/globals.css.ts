import { style } from "@vanilla-extract/css";

export const text = style({
  fontFamily: "Roboto",
  color: "#D6D6D6",
  fontSize: 12,
  userSelect: "none",
});

export const h1 = style({
  fontFamily: "Roboto",
  color: "#D6D6D6",
  fontSize: 25,
  userSelect: "none",
  fontWeight: 500,
});

export const h2 = style({
  fontFamily: "Roboto",
  color: "#D6D6D6",
  fontSize: 16,
  userSelect: "none",
  fontWeight: 500,
});

export const h3 = style({
  fontFamily: "Roboto",
  color: "#D6D6D6",
  fontSize: 12,
  userSelect: "none",
  fontWeight: 500,
});

export const subheading = style({
  fontFamily: "Roboto",
  color: "#737373",
  fontSize: 12,
  userSelect: "none",
  fontWeight: 500,
});

export const pointer = style({
  cursor: "pointer",
});

export const pointerText = style([text, pointer]);

export const section = style({
  display: "flex",
  flexDirection: "column",
  borderBottom: "1px solid #3E3E3E",
});

export const paddedSection = style([
  section,
  style({
    padding: "15px 20px",
    gap: 15,
  }),
]);
