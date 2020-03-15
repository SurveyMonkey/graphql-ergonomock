import { ergonomock } from "..";
import { buildSchemaFromTypeDefinitions } from "graphql-tools";
import { visitWithTypeInfo, GraphQLError } from "graphql";
import schema from "./schema";
// import { graphql, GraphQLResolveInfo } from "graphql";

describe("Automocking", () => {
  describe("Guardrails", () => {
    test.todo("it throws without a schema");
    test.todo("it throws without a valid schema");
    test.todo("it throws without a query");
    test.todo("it throws without a valid query");
  });

  describe("No provided mocks", () => {
    test("automocks the default types automatically", () => {
      const testQuery = /* GraphQL */ `
        {
          returnInt
          returnString
          returnFloat
          returnBoolean
          returnID
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data).toMatchObject({
        returnInt: expect.toBeNumber(),
        returnString: expect.toBeString(),
        returnFloat: expect.toBeNumber(),
        returnBoolean: expect.toBeBoolean(),
        returnID: expect.toBeString()
      });
      expect(resp.data.returnInt % 1 === 0).toBe(true);
      expect(resp.data.returnFloat % 1 !== 0).toBe(true);
    });

    test("automocks the default type lists automatically", () => {
      const testQuery = /* GraphQL */ `
        {
          returnIntList
          returnStringList
          returnFloatList
          returnBooleanList
          returnIDList
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data).toMatchObject({
        returnIntList: expect.toBeArray(),
        returnStringList: expect.toBeArray(),
        returnFloatList: expect.toBeArray(),
        returnBooleanList: expect.toBeArray(),
        returnIDList: expect.toBeArray()
      });
      function getLastElement(arr: any[]) {
        return arr[arr.length - 1];
      }
      expect(getLastElement(resp.data.returnIntList) % 1 === 0).toBe(true);
      expect(getLastElement(resp.data.returnFloatList) % 1 !== 0).toBe(true);
      expect(getLastElement(resp.data.returnBooleanList)).toBeBoolean();
      expect(getLastElement(resp.data.returnIDList)).toBeString();
      expect(getLastElement(resp.data.returnStringList)).toBeString();
    });

    test("can automock enums", () => {
      const testQuery = /* GraphQL */ `
        {
          returnEnum
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data).toMatchObject({
        returnEnum: expect.toBeOneOf(["A", "B", "C"])
      });
    });

    test("can automock unions", () => {
      const testQuery = /* GraphQL */ `
        {
          returnBirdsAndBees {
            __typename
            ... on Bird {
              returnInt
              returnString
            }
            ... on Bee {
              returnInt
              returnEnum
            }
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data.returnBirdsAndBees.length).toBeGreaterThan(0);
      expect(resp.data.returnBirdsAndBees.length).toBeLessThan(5);
      const firstType = resp.data.returnBirdsAndBees[0];
      expect(firstType.returnInt).toBeNumber();
      if (firstType.__typename === "Bird") {
        expect(firstType.returnString).toBeString();
      } else {
        expect(firstType.returnEnum).toBeOneOf(["A", "B", "C"]);
      }
    });

    test("can automock interfaces", () => {
      const testQuery = /* GraphQL */ `
        {
          returnFlying {
            __typename
            ... on Bird {
              returnInt
              returnString
            }
            ... on Bee {
              returnInt
              returnEnum
            }
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data.returnFlying.length).toBeGreaterThan(0);
      expect(resp.data.returnFlying.length).toBeLessThan(5);
      const firstType = resp.data.returnFlying[0];
      expect(firstType.returnInt).toBeNumber();
      if (firstType.__typename === "Bird") {
        expect(firstType.returnString).toBeString();
      } else {
        expect(firstType.returnEnum).toBeOneOf(["A", "B", "C"]);
      }
    });
    test("can automock objects", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            id
            returnEnum
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data).toMatchObject({
        returnShape: {
          id: expect.toBeString(),
          returnEnum: expect.toBeOneOf(["A", "B", "C"])
        }
      });
    });
    test("can automock nested unions", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            id
            birdsAndBees {
              __typename
              ... on Bird {
                returnInt
                returnString
              }
              ... on Bee {
                returnInt
                returnEnum
              }
            }
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      const shape = resp.data.returnShape;
      expect(shape.id).toBeString();
      expect(shape.birdsAndBees.length).toBeGreaterThan(0);
      expect(shape.birdsAndBees.length).toBeLessThan(5);
      const firstType = shape.birdsAndBees[0];
      expect(firstType.returnInt).toBeNumber();
      if (firstType.__typename === "Bird") {
        expect(firstType.returnString).toBeString();
      } else {
        expect(firstType.returnEnum).toBeOneOf(["A", "B", "C"]);
      }
    });

    test("can automock nested interfaces", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            id
            flying {
              __typename
              ... on Bird {
                returnInt
                returnString
              }
              ... on Bee {
                returnInt
                returnEnum
              }
            }
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      const shape = resp.data.returnShape;
      expect(shape.id).toBeString();
      expect(shape.flying.length).toBeGreaterThan(0);
      expect(shape.flying.length).toBeLessThan(5);
      const firstType = shape.flying[0];
      expect(firstType.returnInt).toBeNumber();
      if (firstType.__typename === "Bird") {
        expect(firstType.returnString).toBeString();
      } else {
        expect(firstType.returnEnum).toBeOneOf(["A", "B", "C"]);
      }
    });

    test("can automock nested basic types", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            returnInt
            returnString
            returnFloat
            returnBoolean
            returnID
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data.returnShape).toMatchObject({
        returnInt: expect.toBeNumber(),
        returnString: expect.toBeString(),
        returnFloat: expect.toBeNumber(),
        returnBoolean: expect.toBeBoolean(),
        returnID: expect.toBeString()
      });
      expect(resp.data.returnShape.returnInt % 1 === 0).toBe(true);
      expect(resp.data.returnShape.returnFloat % 1 !== 0).toBe(true);
    });
    test("can automock nested enums", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            returnEnum
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data.returnShape).toMatchObject({
        returnEnum: expect.toBeOneOf(["A", "B", "C"])
      });
    });
    test("can automock nested objects", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            nestedShape {
              returnInt
              returnString
              returnFloat
              returnBoolean
              returnID
            }
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data.returnShape.nestedShape).toMatchObject({
        returnInt: expect.toBeNumber(),
        returnString: expect.toBeString(),
        returnFloat: expect.toBeNumber(),
        returnBoolean: expect.toBeBoolean(),
        returnID: expect.toBeString()
      });
    });
    test("can automock inline fragments", () => {
      const testQuery = /* GraphQL */ `
        fragment ShapeParts on Shape {
          returnInt
          returnString
          returnFloat
        }

        query {
          returnShape {
            id
            ...ShapeParts
            nestedShape {
              ...ShapeParts
            }
          }
        }
      `;
      const resp: any = ergonomock(schema, testQuery);
      expect(resp.data.returnShape).toMatchObject({
        id: expect.toBeString(),
        returnInt: expect.toBeNumber(),
        returnString: expect.toBeString(),
        returnFloat: expect.toBeNumber(),
        nestedShape: {
          returnInt: expect.toBeNumber(),
          returnString: expect.toBeString(),
          returnFloat: expect.toBeNumber()
        }
      });
    });

    test.todo("can provide field mock override");
    test.todo("automocking of lists are deterministic on some seed");
  });

  describe("With partial mocks provided", () => {
    test("can return basic types in mock", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnInt
          returnString
          returnFloat
          returnBoolean
          returnID
        }
      `;

      const mocks = {
        returnString: "bar",
        returnInt: 12345,
        returnFloat: 10.2,
        returnBoolean: false
      };
      const resp: any = ergonomock(schema, query, mocks);

      expect(resp).toMatchObject({
        data: {
          returnID: expect.toBeString(),
          ...mocks
        }
      });
    });
    test("can return basic types list in mock", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnIntList
          returnStringList
          returnFloatList
          returnBooleanList
          returnID
        }
      `;

      const mocks = {
        returnStringList: ["bar"],
        returnIntList: [12345, 54321],
        returnFloatList: [10.2, 10.2],
        returnBooleanList: [false]
      };
      const resp: any = ergonomock(schema, query, mocks);

      expect(resp).toMatchObject({
        data: {
          returnID: expect.toBeString(),
          ...mocks
        }
      });
    });
    test("can return basic enum mock", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnEnum
          returnShape {
            id
          }
        }
      `;

      const mocks = {
        returnEnum: "A"
      };
      const resp: any = ergonomock(schema, query, mocks);

      expect(resp).toMatchObject({
        data: {
          returnEnum: "A",
          returnShape: {
            id: expect.toBeString()
          }
        }
      });
    });

    test("can return basic enum list mock", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnEnumList
          returnShape {
            id
          }
        }
      `;

      const mocks = {
        returnEnumList: ["A", "C"]
      };
      const resp: any = ergonomock(schema, query, mocks);

      expect(resp).toMatchObject({
        data: {
          returnEnumList: ["A", "C"],
          returnShape: {
            id: expect.toBeString()
          }
        }
      });
    });

    test("returns error if provided enum mock is invalid", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnEnum
          returnShape {
            id
          }
        }
      `;

      const mocks = {
        returnEnum: "D"
      };
      const resp: any = ergonomock(schema, query, mocks);
      expect(resp.errors[0].message).toBe('Expected a value of type "SomeEnum" but received: "D"');
      expect(resp).toMatchObject({
        data: {
          returnEnum: null,
          returnShape: {
            id: expect.toBeString()
          }
        }
      });
    });
    test("can return object mock", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnEnum
          returnShape {
            id
            returnInt
            nestedShape {
              id
              returnInt
              nestedShape {
                id
                returnInt
                nestedShape {
                  id
                  returnInt
                }
              }
            }
          }
        }
      `;

      const mocks = {
        returnShape: {
          returnInt: 1,
          nestedShape: {
            returnInt: 2,
            nestedShape: {
              returnInt: 3,
              nestedShape: {
                returnInt: 4
              }
            }
          }
        }
      };
      const resp: any = ergonomock(schema, query, mocks);
      expect(resp).toMatchObject({
        data: {
          returnEnum: expect.toBeOneOf(["A", "B", "C"]),
          returnShape: {
            id: expect.toBeString(),
            returnInt: 1,
            nestedShape: {
              id: expect.toBeString(),
              returnInt: 2,
              nestedShape: {
                id: expect.toBeString(),
                returnInt: 3,
                nestedShape: {
                  id: expect.toBeString(),
                  returnInt: 4
                }
              }
            }
          }
        }
      });
    });
    test("can return object mock list", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnEnum
          returnShapeList {
            id
            returnInt
            nestedShapeList {
              id
              returnInt
              nestedShape {
                id
                returnInt
                nestedShape {
                  id
                  returnInt
                }
              }
            }
          }
        }
      `;

      const mocks = {
        returnShapeList: [
          {
            returnInt: 1,
            nestedShapeList: [
              {
                returnInt: 2,
                nestedShape: {
                  returnInt: 3,
                  nestedShape: {
                    returnInt: 4
                  }
                }
              },
              {
                returnInt: 5,
                nestedShape: {
                  returnInt: 6,
                  nestedShape: {
                    returnInt: 7
                  }
                }
              }
            ]
          },
          {
            returnInt: 8,
            nestedShapeList: [
              {
                returnInt: 9,
                nestedShape: {
                  returnInt: 10,
                  nestedShape: {
                    returnInt: 11
                  }
                }
              },
              {
                returnInt: 12,
                nestedShape: {
                  returnInt: 13,
                  nestedShape: {
                    returnInt: 14
                  }
                }
              }
            ]
          }
        ]
      };
      const resp: any = ergonomock(schema, query, mocks);
      expect(resp).toMatchObject({
        data: {
          returnEnum: expect.toBeOneOf(["A", "B", "C"]),
          returnShapeList: [
            {
              id: expect.toBeString(),
              returnInt: 1,
              nestedShapeList: [
                {
                  id: expect.toBeString(),
                  returnInt: 2,
                  nestedShape: {
                    id: expect.toBeString(),
                    returnInt: 3,
                    nestedShape: {
                      id: expect.toBeString(),
                      returnInt: 4
                    }
                  }
                },
                {
                  id: expect.toBeString(),
                  returnInt: 5,
                  nestedShape: {
                    id: expect.toBeString(),
                    returnInt: 6,
                    nestedShape: {
                      id: expect.toBeString(),
                      returnInt: 7
                    }
                  }
                }
              ]
            },
            {
              id: expect.toBeString(),
              returnInt: 8,
              nestedShapeList: [
                {
                  id: expect.toBeString(),
                  returnInt: 9,
                  nestedShape: {
                    id: expect.toBeString(),
                    returnInt: 10,
                    nestedShape: {
                      id: expect.toBeString(),
                      returnInt: 11
                    }
                  }
                },
                {
                  id: expect.toBeString(),
                  returnInt: 12,
                  nestedShape: {
                    id: expect.toBeString(),
                    returnInt: 13,
                    nestedShape: {
                      id: expect.toBeString(),
                      returnInt: 14
                    }
                  }
                }
              ]
            }
          ]
        }
      });
    });

    test("can return union mock list", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnEnum
          returnBirdsAndBees {
            __typename
            returnInt
            ... on Bird {
              returnString
            }
            ... on Bee {
              returnEnum
            }
          }
        }
      `;

      const mocks = {
        returnBirdsAndBees: [
          { __typename: "Bird", returnString: "foo bar" },
          { __typename: "Bee", returnEnum: "A" },
          { __typename: "Bee", returnEnum: "B" }
        ]
      };
      const resp: any = ergonomock(schema, query, mocks);
      expect(resp).toMatchObject({
        data: {
          returnEnum: expect.toBeOneOf(["A", "B", "C"]),
          returnBirdsAndBees: [
            { __typename: "Bird", returnString: "foo bar", returnInt: expect.toBeNumber() },
            { __typename: "Bee", returnEnum: "A", returnInt: expect.toBeNumber() },
            { __typename: "Bee", returnEnum: "B", returnInt: expect.toBeNumber() }
          ]
        }
      });
    });

    test("can return interface mock list", () => {
      const query = /* GraphQL */ `
        query SampleQuery {
          returnEnum
          returnFlying {
            __typename
            returnInt
            ... on Bird {
              returnString
            }
            ... on Bee {
              returnEnum
            }
          }
        }
      `;

      const mocks = {
        returnFlying: [
          { __typename: "Bird", returnString: "foo bar" },
          { __typename: "Bee", returnEnum: "A" },
          { __typename: "Bee", returnEnum: "B" }
        ]
      };
      const resp: any = ergonomock(schema, query, mocks);
      expect(resp).toMatchObject({
        data: {
          returnEnum: expect.toBeOneOf(["A", "B", "C"]),
          returnFlying: [
            { __typename: "Bird", returnString: "foo bar", returnInt: expect.toBeNumber() },
            { __typename: "Bee", returnEnum: "A", returnInt: expect.toBeNumber() },
            { __typename: "Bee", returnEnum: "B", returnInt: expect.toBeNumber() }
          ]
        }
      });
    });

    test("can return partial inline fragment mock", () => {
      const testQuery = /* GraphQL */ `
        fragment ShapeParts on Shape {
          returnInt
          returnString
          returnFloat
        }

        query {
          returnShape {
            id
            ...ShapeParts
            nestedShape {
              ...ShapeParts
            }
          }
        }
      `;
      const mocks = {
        returnShape: {
          returnInt: 4,
          nestedShape: {
            returnString: "Bar"
          }
        }
      };
      const resp: any = ergonomock(schema, testQuery, mocks);
      expect(resp.data.returnShape).toMatchObject({
        id: expect.toBeString(),
        returnInt: 4,
        returnString: expect.toBeString(),
        returnFloat: expect.toBeNumber(),
        nestedShape: {
          returnInt: expect.toBeNumber(),
          returnString: "Bar",
          returnFloat: expect.toBeNumber()
        }
      });
    });

    test("can return provided nested basic types list", () => {
      const testQuery = /* GraphQL */ `
        query {
          returnShape {
            id
            nestedShape {
              returnIntList
              returnStringList
              returnFloatList
              returnEnumList
              returnIDList
              returnBooleanList
            }
          }
        }
      `;
      const mocks = {
        returnShape: {
          returnIntList: [4, 4, 3],
          nestedShape: {
            returnStringList: ["Bar"]
          }
        }
      };
      const resp: any = ergonomock(schema, testQuery, mocks);
      expect(resp.data.returnShape.nestedShape).toMatchObject({
        returnIntList: expect.toBeArray(),
        returnStringList: expect.toBeArray(),
        returnFloatList: expect.toBeArray(),
        returnBooleanList: expect.toBeArray(),
        returnIDList: expect.toBeArray(),
        returnEnumList: expect.toBeArray()
      });
      function getLastElement(arr: any[]) {
        return arr[arr.length - 1];
      }
      const nestedShape = resp.data.returnShape.nestedShape;
      expect(getLastElement(nestedShape.returnIntList) % 1 === 0).toBe(true);
      expect(getLastElement(nestedShape.returnFloatList) % 1 !== 0).toBe(true);
      expect(getLastElement(nestedShape.returnBooleanList)).toBeBoolean();
      expect(getLastElement(nestedShape.returnIDList)).toBeString();
      expect(getLastElement(nestedShape.returnEnumList)).toBeOneOf(["A", "B", "C"]);
      expect(getLastElement(nestedShape.returnStringList)).toBeString();
    });
  });

  describe("calling mock functions", () => {
    test("uses any function on the mock as resolver if present", () => {
      expect.hasAssertions();
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            returnInt
            returnString
            nestedShape {
              returnInt
            }
          }
        }
      `;
      let rootReturnIntValue;
      const mocks = {
        returnShape: {
          returnInt: 4321,
          nestedShape: (root: any, args: any, ctx: any, info: any) => {
            rootReturnIntValue = root.returnInt;
            return {
              returnInt: 1234
            };
          }
        }
      };
      const resp: any = ergonomock(schema, testQuery, mocks);
      expect(resp.data.returnShape.nestedShape.returnInt).toBe(1234);
      expect(rootReturnIntValue).toBe(4321);
      expect(resp.data.returnShape.returnInt).toBe(4321);
    });
  });

  describe("mocking errors", () => {
    test("can provide Errors for basic types", () => {
      const testQuery = /* GraphQL */ `
        {
          returnInt
          returnString
        }
      `;
      const resp: any = ergonomock(schema, testQuery, {
        returnInt: new Error("foo bar")
      });
      expect(resp.data).toMatchObject({
        returnInt: null,
        returnString: expect.toBeString()
      });
      expect(resp.errors).toStrictEqual([new GraphQLError("foo bar")]);
    });

    test("can provide Errors for enums", () => {
      const testQuery = /* GraphQL */ `
        {
          returnEnum
          returnString
        }
      `;
      const resp: any = ergonomock(schema, testQuery, {
        returnEnum: new Error("foo enum")
      });
      expect(resp.data).toMatchObject({
        returnEnum: null,
        returnString: expect.toBeString()
      });
      expect(resp.errors).toStrictEqual([new GraphQLError("foo enum")]);
    });

    test("can provide Errors for objects", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            id
          }
          returnString
        }
      `;
      const resp: any = ergonomock(schema, testQuery, {
        returnShape: new Error("foo shape")
      });
      expect(resp.data).toMatchObject({
        returnShape: null,
        returnString: expect.toBeString()
      });
      expect(resp.errors).toStrictEqual([new GraphQLError("foo shape")]);
    });

    test("can provide Errors for lists (one error among list items)", () => {
      const testQuery = /* GraphQL */ `
        {
          returnStringList
          returnString
        }
      `;
      const resp: any = ergonomock(schema, testQuery, {
        returnStringList: ["Whiskey", new Error("foo Tango"), "Foxtrot"]
      });
      expect(resp.data).toMatchObject({
        returnStringList: ["Whiskey", null, "Foxtrot"],
        returnString: expect.toBeString()
      });
      expect(resp.errors).toStrictEqual([new GraphQLError("foo Tango")]);
    });

    test("can provide Errors for unions", () => {
      const testQuery = /* GraphQL */ `
        {
          returnBirdsAndBees {
            __typename
            id
          }
          returnString
        }
      `;
      const resp: any = ergonomock(schema, testQuery, {
        returnBirdsAndBees: [{ __typename: "Bird" }, new Error("foo Tango"), { __typename: "Bee" }]
      });
      expect(resp.data).toMatchObject({
        returnBirdsAndBees: [
          { __typename: "Bird", id: expect.toBeString() },
          null,
          { __typename: "Bee", id: expect.toBeString() }
        ],
        returnString: expect.toBeString()
      });
      expect(resp.errors).toStrictEqual([new GraphQLError("foo Tango")]);
    });
    test("can provide Errors for interfaces", () => {
      const testQuery = /* GraphQL */ `
        {
          returnFlying {
            __typename
            id
          }
          returnString
        }
      `;
      const resp: any = ergonomock(schema, testQuery, {
        returnFlying: [{ __typename: "Bird" }, new Error("foo Tango"), { __typename: "Bee" }]
      });
      expect(resp.data).toMatchObject({
        returnFlying: [
          { __typename: "Bird", id: expect.toBeString() },
          null,
          { __typename: "Bee", id: expect.toBeString() }
        ],
        returnString: expect.toBeString()
      });
      expect(resp.errors).toStrictEqual([new GraphQLError("foo Tango")]);
    });
    test("can throw errors in functions as resolver", () => {
      const testQuery = /* GraphQL */ `
        {
          returnShape {
            id
          }
          returnString
        }
      `;
      const resp: any = ergonomock(schema, testQuery, {
        returnShape: () => {
          throw new Error("foo shape");
        }
      });
      expect(resp.data).toMatchObject({
        returnShape: null,
        returnString: expect.toBeString()
      });
      expect(resp.errors).toStrictEqual([new GraphQLError("foo shape")]);
    });
  });

  test("base case - TBD remove this test later", () => {
    const query = /* GraphQL */ `
      query SampleQuery {
        returnInt
        returnString
        returnFlying {
          __typename
          id
          ... on Bird {
            returnString
          }
          ... on Bee {
            returnEnum
          }
          returnInt
        }
      }
    `;

    const mocks = {
      returnString: "bar",
      returnFlying: [
        { __typename: "Bee", id: "123" },
        { __typename: "Bee" },
        { __typename: "Bird" }
      ]
    };

    const resp: any = ergonomock(schema, query, mocks);

    expect(resp).toMatchObject({
      data: {
        returnInt: expect.toBeNumber(),
        returnString: "bar",
        returnFlying: [
          { __typename: "Bee", id: "123", returnEnum: expect.toBeOneOf(["A", "B", "C"]) },
          {
            __typename: "Bee",
            id: expect.toBeString(),
            returnEnum: expect.toBeOneOf(["A", "B", "C"])
          },
          { __typename: "Bird", id: expect.toBeString(), returnString: expect.toBeString() }
        ]
      }
    });
  });
});
