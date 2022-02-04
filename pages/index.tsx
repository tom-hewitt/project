import dynamic from "next/dynamic";

const LazyEditor = dynamic(() => import("../src/editor/gui/Project"), {
  ssr: false,
  loading: () => <p>loading...</p>,
});

export default function Project() {
  return <LazyEditor />;
}
