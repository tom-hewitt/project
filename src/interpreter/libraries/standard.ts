import { asArray, asBoolean, asInteger, asObj, asString, code, obj } from "../";

import { library } from "../library";

export const standardLibrary: library = (builder) => {
  builder
    .createClass({
      name: "Object",
      methods: {
        "To String": builder.createForeignMethod(({ Self }, { callMethod }) => {
          const attributeToString = ([name, obj]: [string, obj]): string => {
            const string = asString(asObj(callMethod(obj, "To String")));

            return `${name}: ${string.value}`;
          };

          let attributesString = "";

          if (Self.attributes) {
            const attrs = Object.entries(Self.attributes);

            if (attrs.length > 0) {
              for (let i = 0; i < attrs.length; i++) {
                attributesString += `${i === 0 ? " " : ", "}${attributeToString(
                  attrs[i]
                )}`;
              }

              attributesString += " ";
            }
          }

          return {
            type: "String",
            c: "String",
            value: `${Self.c} {${attributesString}}`,
          };
        }),
      },
    })
    .createClass({
      name: "Boolean",
      methods: {
        "To String": builder.createForeignMethod(({ Self }) => ({
          type: "String",
          c: "String",
          value: asBoolean(Self).value ? "True" : "False",
        })),
        And: builder.createForeignMethod(({ Self, Other }) => {
          const selfBoolean = asBoolean(Self);
          const otherBoolean = asBoolean(Other);

          return {
            type: "Boolean",
            c: "Boolean",
            value: selfBoolean.value && otherBoolean.value,
          };
        }),
      },
    })
    .createClass({
      name: "String",
      methods: {
        "To String": builder.createForeignMethod(({ Self }) => {
          return Self;
        }),
      },
    })
    .createClass({
      name: "Integer",
      methods: {
        "To String": builder.createForeignMethod(({ Self }) => ({
          type: "String",
          c: "String",
          value: asInteger(Self).value.toString(),
        })),
      },
    })
    .createClass({
      name: "Array",
      methods: {
        "To String": builder.createForeignMethod(({ Self }, { callMethod }) => {
          const selfArray = asArray(Self);

          let arrayString = "[";

          for (let i = 0; i < selfArray.value.length; i++) {
            arrayString += `${i === 0 ? "" : ", "}${
              asString(asObj(callMethod(selfArray.value[i], "To String"))).value
            }`;
          }

          arrayString += "]";

          return {
            type: "String",
            c: "String",
            value: arrayString,
          };
        }),
      },
    })
    .createForeignFunc("Print", ({ Value }, { callMethod }) => {
      if (Value) {
        console.log(asString(asObj(callMethod(Value, "To String"))).value);
        return null;
      } else {
        throw new Error(`No value given to print`);
      }
    });
};
