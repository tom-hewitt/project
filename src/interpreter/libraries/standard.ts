import { asArray, asBoolean, asObj, asString, obj } from "../";
import { library } from "../library";

export const standardLibrary: library = {
  classes: {
    Object: {
      name: "Object",
      methods: {
        "To String": {
          type: "Foreign",
          execute: ({ Self }, callMethod) => {
            const attributeToString = ([name, obj]: [string, obj]): string => {
              const string = asString(asObj(callMethod(obj, "To String")));

              return `${name}: ${string}`;
            };

            let attributesString = "";

            if (Self.attributes) {
              const attrs = Object.entries(Self.attributes);

              if (attrs.length > 0) {
                for (let i = 0; i < attrs.length; i++) {
                  attributesString.concat(
                    `${i === 0 ? " " : ", "}${attributeToString(attrs[i])}`
                  );
                }

                attributesString.concat(" ");
              }
            }

            return {
              type: "String",
              c: "String",
              value: `${Self.c} {${attributesString}}`,
            };
          },
        },
      },
    },
    Boolean: {
      name: "Boolean",
      super: "Object",
      methods: {
        "To String": {
          type: "Foreign",
          execute: ({ Self }) => {
            const selfBoolean = asBoolean(Self);

            return {
              type: "String",
              c: "String",
              value: selfBoolean.value ? "True" : "False",
            };
          },
        },
        And: {
          type: "Foreign",
          execute: ({ Self, Other }) => {
            const selfBoolean = asBoolean(Self);
            const otherBoolean = asBoolean(Other);

            return {
              type: "Boolean",
              c: "Boolean",
              value: selfBoolean.value && otherBoolean.value,
            };
          },
        },
      },
    },
    String: {
      name: "String",
      super: "Object",
      methods: {
        "To String": {
          type: "Foreign",
          execute: ({ Self }) => {
            return Self;
          },
        },
      },
    },
    Array: {
      name: "Array",
      super: "Object",
      methods: {
        "To String": {
          type: "Foreign",
          execute: ({ Self }, callMethod) => {
            const selfArray = asArray(Self);

            let arrayString = "[";

            for (let i = 0; i < selfArray.value.length; i++) {
              arrayString += `${i === 0 ? "" : ", "}${
                asString(asObj(callMethod(selfArray.value[i], "To String")))
                  .value
              }`;
            }

            arrayString += "]";

            return {
              type: "String",
              c: "String",
              value: arrayString,
            };
          },
        },
      },
    },
  },
  functions: {
    Print: {
      type: "Foreign",
      execute: ({ Value }, callMethod) => {
        if (Value) {
          console.log(asString(asObj(callMethod(Value, "To String"))).value);
          return null;
        } else {
          throw new Error(`No value given to print`);
        }
      },
    },
  },
};
