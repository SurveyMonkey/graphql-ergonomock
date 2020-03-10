import { mock } from "..";
import { buildSchemaFromTypeDefinitions } from "graphql-tools";
import { visitWithTypeInfo } from "graphql";
// import { graphql, GraphQLResolveInfo } from "graphql";

const schemaSDL = /* GraphQL */ `
  scalar MissingMockType
  interface Flying {
    id: String!
    returnInt: Int
  }
  type Bird implements Flying {
    id: String!
    returnInt: Int
    returnString: String
    returnStringArgument(s: String): String
  }
  type Bee implements Flying {
    id: String!
    returnInt: Int
    returnEnum: SomeEnum
  }
  union BirdsAndBees = Bird | Bee
  enum SomeEnum {
    A
    B
    C
  }
  type Shape {
    id: String!
    returnInt: Int
    returnEnum: SomeEnum
    flying: [Flying]
    birdsAndBees: [BirdsAndBees]
    returnFloat: Float
    returnString: String
    returnBoolean: Boolean
    returnID: ID
    nestedShape: Shape
  }
  type RootQuery {
    returnInt: Int
    returnFloat: Float
    returnString: String
    returnBoolean: Boolean
    returnID: ID
    returnShape: Shape
    returnEnum: SomeEnum
    returnBirdsAndBees: [BirdsAndBees]
    returnFlying: [Flying]
    returnMockError: MissingMockType
    returnNullableString: String
    returnNonNullString: String!
    returnObject: Bird
    returnListOfInt: [Int]
    returnListOfIntArg(l: Int): [Int]
    returnListOfListOfInt: [[Int!]!]!
    returnListOfListOfIntArg(l: Int): [[Int]]
    returnListOfListOfObject: [[Bird!]]!
    returnStringArgument(s: String): String
    node(id: String!): Flying
    node2(id: String!): BirdsAndBees
  }
  type RootMutation {
    returnStringArgument(s: String): String
  }
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`;

const schema = buildSchemaFromTypeDefinitions(schemaSDL);

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
      const resp: any = mock(schema, testQuery);
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

    test("can automock enums", () => {
      const testQuery = /* GraphQL */ `
        {
          returnEnum
        }
      `;
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
      const resp: any = mock(schema, testQuery);
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
    test("can return string mock", () => {
      // Given a query
      const query = /* GraphQL */ `
        query SampleQuery {
          returnInt
          returnString
        }
      `;

      // And a partial mock
      const mocks = { returnString: "bar" };
      const resp: any = mock(schema, query, mocks);

      // Return a fully mocked response
      expect(resp).toMatchObject({
        data: {
          returnInt: expect.toBeNumber(),
          returnString: "bar"
        }
      });
    });

    test.todo("can return basic types in mock");
    test.todo("can return basic types list in mock");
    test.todo("can return basic enum mock");
    test.todo("can return basic enum list mock");
    test.todo("throws if provided enum mock is invalid");
    test.todo("can return object mock");
    test.todo("can return object mock list");
    test.todo("can return union mock list");
    test.todo("can return interface mock list");
    test.todo("can return partial inline fragment mock");
    test.todo("can return provided nested basic types");
    test.todo("can return provided nested basic types list");
    test.todo("can return provided nested enums");
    test.todo("can return provided nested enums list");
    test.todo("can return provided nested unions");
    test.todo("can return provided nested interfaces");
    test.todo("executes functions when provided, with variables as args");
  });

  describe("mocking errors", () => {
    test.todo("can provide Errors for basic types");
    test.todo("can provide Errors for enums");
    test.todo("can provide Errors for objects");
    test.todo("can provide Errors for lists (one error among list items)");
    test.todo("can provide Errors for unions");
    test.todo("can provide Errors for interfaces");
    test.todo("can throw errors in functions as resolver");
  });

  test("base case - TBD remove this test later", () => {
    // Given a query
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

    // And a partial mock
    const mocks = {
      returnString: "bar",
      returnFlying: [
        { __typename: "Bee", id: "123" },
        { __typename: "Bee" },
        { __typename: "Bird" }
      ]
    };

    const resp: any = mock(schema, query, mocks);

    // Return a fully mocked response
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
