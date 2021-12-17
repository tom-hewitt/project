import dynamic from "next/dynamic";

const LazyEditor = dynamic(() => import("../../src/gui/Project"), {
  ssr: false,
  loading: () => <p>loading...</p>,
});

interface ProjectProps {
  id: string;
}

export default function Project({ id }: ProjectProps) {
  return <LazyEditor />;
}

interface StaticProps {
  params: {
    id: string;
  };
}

export async function getStaticPaths() {
  const paths = ["0"];

  return {
    paths: paths.map<StaticProps>((path) => ({ params: { id: path } })),
    fallback: false,
  };
}

export async function getStaticProps({ params: { id } }: StaticProps) {
  return {
    props: {
      id,
    },
  };
}
