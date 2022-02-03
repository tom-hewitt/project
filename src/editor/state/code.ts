import { sourceCode } from "../../code";
import { createSourceCode } from "../../code/builder";

export const code: sourceCode = createSourceCode((builder) => {
  builder
    .createClass({
      name: "Program",
      super: "Object",
      attributes: {
        Root: builder.createAttribute(
          "Program",
          builder.createBlock({
            opcode: "Construct",
            c: "Level",
            children: [],
            return: { c: "3D Object" },
          })
        ),
      },
      methods: {
        Test: builder.createMethod(
          "Program",
          "Test",
          [],
          builder.createBlock({
            opcode: "Set Variable",
            variable: "Character",
            children: [
              builder.createBlock({
                opcode: "Construct",
                c: "3D Object",
                children: [
                  builder.createBlock({
                    opcode: "Array",
                    children: [
                      builder.createBlock({
                        opcode: "Get Variable",
                        variable: "Weapon",
                        return: { c: "3D Object" },
                      }),
                    ],
                    return: {
                      c: "Array",
                      generics: { item: { c: "3D Object" } },
                    },
                  }),
                ],
                return: {
                  c: "3D Object",
                },
              }),
            ],
          }),
          builder.createBlock({
            opcode: "If",
            children: [
              builder.createBlock({
                opcode: "Function Call",
                function: { funcID: "Is Input Pressed?" },
                arguments: { input: 0 },
                children: [
                  builder.createBlock({
                    opcode: "String",
                    value: "W",
                    return: { c: "String" },
                  }),
                ],
                return: { c: "Boolean" },
              }),
              builder.createSequence(
                builder.createBlock({
                  opcode: "Set Attribute",
                  attribute: "y",
                  children: [
                    builder.createBlock({
                      opcode: "Get Variable",
                      variable: "Velocity",
                      return: { c: "3D Vector" },
                    }),
                    builder.createBlock({
                      opcode: "Method Call",
                      c: "Float",
                      method: "+",
                      children: [
                        builder.createBlock({
                          opcode: "Get Attribute",
                          attribute: "y",
                          children: [
                            builder.createBlock({
                              opcode: "Get Variable",
                              variable: "Velocity",
                              return: { c: "3D Vector" },
                            }),
                          ],
                          return: { c: "Float" },
                        }),
                        builder.createBlock({
                          opcode: "Float",
                          value: 1,
                          return: { c: "Float" },
                        }),
                      ],
                      return: { c: "Float" },
                    }),
                  ],
                })
              ),
              builder.createSequence(
                builder.createBlock({
                  opcode: "Function Call",
                  function: { funcID: "Print" },
                  arguments: { Value: 0 },
                  children: [
                    builder.createBlock({
                      opcode: "String",
                      value: "Hello, World!",
                      return: { c: "String" },
                    }),
                  ],
                })
              ),
            ],
          }),
          builder.createBlock({
            opcode: "While",
            children: [
              builder.createBlock({
                opcode: "Boolean",
                value: true,
                return: { c: "Boolean" },
              }),
              builder.createSequence(
                builder.createBlock({
                  opcode: "Function Call",
                  function: { funcID: "Print" },
                  arguments: { Value: 0 },
                  children: [
                    builder.createBlock({
                      opcode: "String",
                      value: "Hello, World!",
                      return: { c: "String" },
                    }),
                  ],
                }),
                builder.createBlock({
                  opcode: "Break",
                })
              ),
            ],
          }),
          builder.createBlock({
            opcode: "For",
            variable: "i",
            children: [
              builder.createBlock({
                opcode: "Array",
                children: [
                  builder.createBlock({
                    opcode: "Integer",
                    value: 0,
                    return: { c: "Integer" },
                  }),
                  builder.createBlock({
                    opcode: "Integer",
                    value: 1,
                    return: { c: "Integer" },
                  }),
                ],
                return: { c: "Array", generics: { item: { c: "Integer" } } },
              }),
              builder.createSequence(
                builder.createBlock({
                  opcode: "Function Call",
                  function: { funcID: "Print" },
                  arguments: { Value: 0 },
                  children: [
                    builder.createBlock({
                      opcode: "Method Call",
                      c: "Integer",
                      method: "To String",
                      children: [
                        builder.createBlock({
                          opcode: "Get Variable",
                          variable: "i",
                          return: { c: "Integer" },
                        }),
                      ],
                      return: {
                        c: "String",
                      },
                    }),
                  ],
                })
              ),
            ],
          }),
          builder.createBlock({
            opcode: "Do Next Frame",
            children: [
              builder.createSequence(
                builder.createBlock({
                  opcode: "Function Call",
                  function: { funcID: "Print" },
                  arguments: { Value: 0 },
                  children: [
                    builder.createBlock({
                      opcode: "String",
                      value: "Hello, World!",
                      return: { c: "String" },
                    }),
                  ],
                })
              ),
            ],
          }),
          builder.createBlock({
            opcode: "Return",
          })
        ),
      },
    })
    .createClass({
      name: "Level",
      super: "3D Object",
      attributes: {
        Children: builder.createAttribute(
          "Level",
          builder.createBlock({
            opcode: "Array",
            children: [
              builder.createBlock({
                opcode: "Construct",
                c: "3D Model",
                children: [
                  builder.createBlock({
                    opcode: "String",
                    value: "Beech Tree",
                    return: { c: "String" },
                  }),
                  builder.createBlock({
                    opcode: "Array",
                    children: [],
                    return: {
                      c: "Array",
                      generics: { item: { c: "3D Object" } },
                    },
                  }),
                  builder.createBlock({
                    opcode: "Construct",
                    c: "3D Vector",
                    children: [
                      builder.createBlock({
                        opcode: "Float",
                        value: 0,
                        return: { c: "Float" },
                      }),
                      builder.createBlock({
                        opcode: "Float",
                        value: 0,
                        return: { c: "Float" },
                      }),
                      builder.createBlock({
                        opcode: "Float",
                        value: 0,
                        return: { c: "Float" },
                      }),
                    ],
                    return: { c: "3D Vector" },
                  }),
                ],
                return: { c: "3D Model" },
              }),
              builder.createBlock({
                opcode: "Construct",
                c: "3D Model",
                children: [
                  builder.createBlock({
                    opcode: "String",
                    value: "Small Menhir",
                    return: { c: "String" },
                  }),
                  builder.createBlock({
                    opcode: "Array",
                    children: [],
                    return: {
                      c: "Array",
                      generics: { item: { c: "3D Object" } },
                    },
                  }),
                  builder.createBlock({
                    opcode: "Construct",
                    c: "3D Vector",
                    children: [
                      builder.createBlock({
                        opcode: "Float",
                        value: 4,
                        return: { c: "Float" },
                      }),
                      builder.createBlock({
                        opcode: "Float",
                        value: 1,
                        return: { c: "Float" },
                      }),
                      builder.createBlock({
                        opcode: "Float",
                        value: 0,
                        return: { c: "Float" },
                      }),
                    ],
                    return: { c: "3D Vector" },
                  }),
                ],
                return: { c: "3D Model" },
              }),
              builder.createBlock({
                opcode: "Construct",
                c: "3D Plane",
                children: [
                  builder.createBlock({
                    opcode: "Array",
                    children: [],
                    return: {
                      c: "Array",
                      generics: { item: { c: "3D Object" } },
                    },
                  }),
                  builder.createBlock({
                    opcode: "Construct",
                    c: "3D Vector",
                    children: [
                      builder.createBlock({
                        opcode: "Float",
                        value: 0,
                        return: { c: "Float" },
                      }),
                      builder.createBlock({
                        opcode: "Float",
                        value: 0,
                        return: { c: "Float" },
                      }),
                      builder.createBlock({
                        opcode: "Float",
                        value: 0,
                        return: { c: "Float" },
                      }),
                    ],
                    return: { c: "3D Vector" },
                  }),
                ],
                return: { c: "3D Plane" },
              }),
            ],
            return: { c: "Array", generics: { item: { c: "3D Object" } } },
          })
        ),
        Position: builder.createAttribute(
          "Level",
          builder.createBlock({
            opcode: "Construct",
            c: "3D Vector",
            children: [
              builder.createBlock({
                opcode: "Float",
                value: 0,
                return: { c: "Float" },
              }),
              builder.createBlock({
                opcode: "Float",
                value: 0,
                return: { c: "Float" },
              }),
              builder.createBlock({
                opcode: "Float",
                value: 0,
                return: { c: "Float" },
              }),
            ],
            return: { c: "3D Vector" },
          })
        ),
      },
      methods: {
        Constructor: builder.createMethod("Level", "Constructor", []),
      },
    })
    .createClass({
      name: "Character",
      super: "3D Object",
      attributes: {
        // Children: builder.createAttribute(
        //   "Character",
        //   builder.createBlock({
        //     opcode: "Array",
        //     children: [
        //       builder.createBlock({
        //         opcode: "Construct",
        //         c: "3D Model",
        //         children: [
        //           builder.createBlock({
        //             opcode: "String",
        //             value: "Spaceship",
        //             return: { c: "String" },
        //           }),
        //           builder.createBlock({
        //             opcode: "Array",
        //             children: [],
        //             return: {
        //               c: "Array",
        //               generics: { item: { c: "3D Object" } },
        //             },
        //           }),
        //           builder.createBlock({
        //             opcode: "Construct",
        //             c: "3D Vector",
        //             children: [
        //               builder.createBlock({
        //                 opcode: "Float",
        //                 value: 0,
        //                 return: { c: "Float" },
        //               }),
        //               builder.createBlock({
        //                 opcode: "Float",
        //                 value: 0,
        //                 return: { c: "Float" },
        //               }),
        //               builder.createBlock({
        //                 opcode: "Float",
        //                 value: 0,
        //                 return: { c: "Float" },
        //               }),
        //             ],
        //             return: { c: "3D Vector" },
        //           }),
        //         ],
        //         return: { c: "3D Model" },
        //       }),
        //     ],
        //     return: { c: "Array", generics: { item: { c: "3D Object" } } },
        //   })
        // ),
      },
      methods: {
        Update: builder.createMethod("Character", "Update", ["Time Elapsed"]),
      },
    });
});
