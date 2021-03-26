import { buildSchemaFromTypeDefinitions } from "graphql-tools";

const schemaSDL = /* GraphQL */ `
  scalar MissingMockType
  scalar CustomScalarType
  interface Flying {
    id: ID!
    returnInt: Int
  }
  type Bird implements Flying {
    id: ID!
    returnInt: Int
    returnString: String
    returnStringArgument(s: String): String
  }
  type Bee implements Flying {
    id: ID!
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
    id: ID!
    flying: [Flying]
    birdsAndBees: [BirdsAndBees]
    returnInt: Int
    returnEnum: SomeEnum
    returnFloat: Float
    returnString: String
    returnBoolean: Boolean
    returnIntList: [Int]
    returnEnumList: [SomeEnum]
    returnFloatList: [Float]
    returnStringList: [String]
    returnBooleanList: [Boolean]
    returnID: ID
    returnIDList: [ID]
    nestedShape: Shape
    nestedShapeList: [Shape]
    returnCustomScalar: CustomScalarType
  }
  type RootQuery {
    returnInt: Int
    returnFloat: Float
    returnString: String
    returnBoolean: Boolean
    returnID: ID
    returnIDList: [ID]
    returnIntList: [Int]
    returnFloatList: [Float]
    returnStringList: [String]
    returnBooleanList: [Boolean]
    returnShape: Shape
    returnShapeList: [Shape]
    returnEnum: SomeEnum
    returnEnumList: [SomeEnum]
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
    queryShape(id: String): Shape
    node(id: String!): Flying
    node2(id: String!): BirdsAndBees
  }
  input ShapeInput {
    someID: ID!
    someInt: Int
  }
  type RootMutation {
    returnStringArgument(s: String): String
    createShape(input: ShapeInput): Shape
  }
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`;

const schema = buildSchemaFromTypeDefinitions(schemaSDL);

export default schema;
