import type { AppProps } from "next/app";
import "../src/styles/fonts.css";

export default function MyApp({ Component }: AppProps) {
  return <Component />;
}
