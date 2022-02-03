import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  asObjRef,
  createRuntime,
  evalBlock,
  obj,
  objRef,
  Runtime,
  RuntimeProvider,
  useObject,
  useRuntime,
} from "../../../interpreter";
import { useStore } from "../../state";
import { nanoid } from "nanoid";
import { Obj3D, Obj3DArray } from "../../../3d";

interface ViewportProps {
  c: string;
  attribute: string;
}

export function Viewport({ c, attribute }: ViewportProps) {
  const code = useStore((store) => store.code);

  const runtime = useRef<Runtime>();

  const [runtimeID, setRuntimeID] = useState<string | null>();

  const objRef = useRef<objRef>();

  useEffect(() => {
    runtime.current = {
      code,
      objects: {},
    };
    const blockRef = code.classes[c].attributes[attribute].blockRef;

    try {
      const array = asObjRef(evalBlock(runtime.current, blockRef));
      // console.log(JSON.stringify(runtime.current.objects, null, 2));
      setRuntimeID(nanoid());

      objRef.current = array;
    } catch (err) {
      console.log(err);
    }
  }, [code]);

  return (
    <Suspense fallback={<div>Loading</div>}>
      <Canvas dpr={devicePixelRatio}>
        {runtime.current ? (
          <RuntimeProvider
            createStore={createRuntime(runtime.current)}
            key={runtimeID}
          >
            {objRef.current ? <Root objRef={objRef.current} /> : null}
            <OrbitControls makeDefault />
          </RuntimeProvider>
        ) : null}
        <ambientLight />
      </Canvas>
    </Suspense>
  );
}

interface RootProps {
  objRef: objRef;
}

export function Root({ objRef }: RootProps) {
  const obj = useRuntime((store) => store.objects[objRef.objID]);

  switch (obj.c) {
    case "Array": {
      return <Obj3DArray obj={obj} />;
    }
    default: {
      return <Obj3D objRef={objRef} />;
    }
  }
}
