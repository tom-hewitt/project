import { library } from ".";
import { obj } from "../interpreter";

export const standardLibrary: library = (builder) => {
  builder
    .createClass({
      name: "Object",
      attributes: {},
      methods: {
        Constructor: builder.createMethod("Object", "Constructor", []),
        "To String": builder.createForeignMethod(
          "Object",
          [],
          ({ Self }, { callMethod }) => {
            // const attributeToString = ([name, obj]: [string, obj]): string => {
            //   const string = callMethod(obj, "To String");

            //   if (!string) {
            //     throw new Error();
            //   }

            //   return `${name}: ${string.value}`;
            // };

            // let attributesString = "";

            // if (Self.attributes) {
            //   const attrs = Object.entries(Self.attributes);

            //   if (attrs.length > 0) {
            //     for (let i = 0; i < attrs.length; i++) {
            //       attributesString += `${
            //         i === 0 ? " " : ", "
            //       }${attributeToString(attrs[i])}`;
            //     }

            //     attributesString += " ";
            //   }
            // }

            // return new StringObj(`${Self.getClass()} {${attributesString}}`);

            return null;
          }
        ),
      },
    })
    .createClass({
      name: "Boolean",
      super: "Object",
      attributes: {},
      methods: {
        "To String": builder.createForeignMethod(
          "Boolean",
          [],
          // ({ Self }) => new StringObj(asBoolean(Self).value ? "True" : "False")
          () => null
        ),
        And: builder.createForeignMethod("Boolean", [], ({ Self, Other }) => {
          // const selfBoolean = asBoolean(Self);
          // const otherBoolean = asBoolean(Other);

          // return new BooleanObj(selfBoolean.value && otherBoolean.value);

          return null;
        }),
      },
    })
    .createClass({
      name: "String",
      super: "Object",
      attributes: {},
      methods: {
        "To String": builder.createForeignMethod("String", [], ({ Self }) => {
          return Self;
        }),
      },
    })
    .createClass({
      name: "Integer",
      super: "Object",
      attributes: {},
      methods: {
        "To String": builder.createForeignMethod(
          "Integer",
          [],
          // ({ Self }) => new StringObj(asInteger(Self).value.toString())
          () => null
        ),
        "+": builder.createMethod("Integer", "+", ["other"]),
      },
    })
    .createClass({
      name: "Float",
      super: "Object",
      attributes: {},
      methods: {
        "To String": builder.createForeignMethod(
          "Float",
          [],
          // ({ Self }) => new StringObj(asInteger(Self).value.toString())
          () => null
        ),
        "+": builder.createMethod("Float", "+", ["other"]),
      },
    })
    .createClass({
      name: "Array",
      super: "Object",
      attributes: {},
      methods: {
        "To String": builder.createForeignMethod(
          "Array",
          [],
          ({ Self }, { callMethod }) => {
            // const selfArray = asArray(Self);

            // let arrayString = "[";

            // for (let i = 0; i < selfArray.value.length; i++) {
            //   arrayString += `${i === 0 ? "" : ", "}${
            //     asString(asObj(callMethod(selfArray.value[i], "To String")))
            //       .value
            //   }`;
            // }

            // arrayString += "]";

            // return new StringObj(arrayString);

            return null;
          }
        ),
      },
    })
    .createForeignFunc("Print", ["value"], ({ value }, { callMethod }) => {
      if (value) {
        // console.log(asString(asObj(callMethod(value, "To String"))).value);
        return null;
      } else {
        throw new Error(`No value given to print`);
      }
    })
    .createForeignFunc("Is Input Pressed?", ["key"], () => null);
};
