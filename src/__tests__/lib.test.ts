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
  type RootQuery {
    returnInt: Int
    returnFloat: Float
    returnString: String
    returnBoolean: Boolean
    returnID: ID
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
    test("mocks the default types automatically", () => {
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

    test("can mock enums", () => {
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

    test("can mock unions", () => {
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

    test("can mock interfaces", () => {
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
  });

  describe("With partial mocks provided", () => {
    test("mocking simple root query field", () => {
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
