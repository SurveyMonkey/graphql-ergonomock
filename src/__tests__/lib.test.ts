import { mock } from "..";
import { buildSchemaFromTypeDefinitions } from "graphql-tools";
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
    const query = /* GraphQL */ `
      query SampleQuery {
        returnInt
        returnString
      }
    `;
    const resp: any = mock(schema, query);
    expect(resp).toBe({
      returnInt: 3,
      returnString: "foo"
    });
  });
});
