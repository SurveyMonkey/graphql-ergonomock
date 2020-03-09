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

describe("Mocking", () => {
  test("base case", () => {
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
