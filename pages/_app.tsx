import type { AppProps } from "next/app";
import "../src/styles/styles.css";

export default function MyApp({ Component }: AppProps) {
  return <Component />;
}
