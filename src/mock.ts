import {
  GraphQLSchema,
  parse,
  execute,
  GraphQLType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  getNamedType,
  getNullableType,
  GraphQLNullableType,
  GraphQLResolveInfo,
  GraphQLFieldResolver,
  GraphQLList,
  GraphQLEnumType,
  isObjectType
} from "graphql";
import getRandomElement from "./utils/getRandomElement";
import forEachFieldInQuery from "./utils/forEachFieldInQuery";

const defaultMockMap: Map<string, GraphQLFieldResolver<any, any>> = new Map();
defaultMockMap.set("Int", () => Math.round(Math.random() * 200) - 100);
defaultMockMap.set("Float", () => Math.random() * 200 - 100);
defaultMockMap.set("String", () => "Hello World");
defaultMockMap.set("Boolean", () => Math.random() > 0.5);
defaultMockMap.set("ID", () => "123456");

export function ergonomock(schema: GraphQLSchema, query: string, partialMock?: any, options?: any) {
  const document = parse(query);

  const mockResolverFunction = function(type: GraphQLType, typeName?: string, fieldName?: string) {
    // TODO: clean up this comment, which was taken as-is from apollo
    // order of precendence for mocking:
    // 1. if the object passed in already has fieldName, just use that
    // --> if it's a function, that becomes your resolver
    // --> if it's a value, the mock resolver will return that
    // 2. if the nullableType is a list, recurse
    // 2. if there's a mock defined for this typeName, that will be used
    // 3. if there's no mock defined, use the default mocks for this type
    return (
      root: any,
      args: { [key: string]: any },
      context: any,
      info: GraphQLResolveInfo
    ): any => {
      // nullability doesn't matter for the purpose of mocking.
      const fieldType = getNullableType(type) as GraphQLNullableType;
      const namedFieldType = getNamedType(fieldType);

      if (root && fieldName && typeof root[fieldName] !== "undefined") {
        const mock = root[fieldName];
        if (typeof mock === "function") {
          return mock(root, args, context, info);
        }
        return root[fieldName];
      }

      // Default mock for enums
      if (fieldType instanceof GraphQLEnumType) {
        return getRandomElement(fieldType.getValues()).value;
      }

      // Automock object types
      if (isObjectType(fieldType)) {
        return { __typename: fieldType.name };
      }

      // Lists
      if (fieldType instanceof GraphQLList) {
        return [
          mockResolverFunction(fieldType.ofType)(root, args, context, info),
          mockResolverFunction(fieldType.ofType)(root, args, context, info)
        ];
      }

      // Unions and interfaces
      if (fieldType instanceof GraphQLUnionType || fieldType instanceof GraphQLInterfaceType) {
        let implementationType;
        const possibleTypes = schema.getPossibleTypes(fieldType);
        implementationType = getRandomElement(possibleTypes);
        return Object.assign(
          { __typename: implementationType },
          mockResolverFunction(implementationType)(root, args, context, info)
        );
      }

      // Mock default scalars
      if (defaultMockMap.has(fieldType.name)) {
        return defaultMockMap.get(fieldType.name)!(root, args, context, info);
      }
    };
  };

  forEachFieldInQuery(schema, document, (field, typeName, fieldName) => {
    assignResolveType(field.type); // assign the default .resolveType resolver.
    let mockResolver: GraphQLFieldResolver<any, any>;

    // we have to handle the root mutation and root query types differently,
    // because no resolver is called at the root.
    const isOnQueryType: boolean = !!(
      schema.getQueryType() && schema.getQueryType()?.name === typeName
    );
    const isOnMutationType: boolean = !!(
      schema.getMutationType() && schema.getMutationType()?.name === typeName
    );

    if (isOnQueryType || isOnMutationType) {
      mockResolver = (
        root: any,
        args: { [key: string]: any },
        context: any,
        info: GraphQLResolveInfo
      ) => {
        return mockResolverFunction(field.type, typeName, fieldName)(
          partialMock,
          args,
          context,
          info
        );
      };
    } else {
      mockResolver = mockResolverFunction(field.type, typeName, fieldName);
    }
    field.resolve = mockResolver;
  });

  const resp = execute({
    schema,
    document,
    rootValue: {},
    contextValue: {}
  });
  return resp;
}

function assignResolveType(type: GraphQLType) {
  const fieldType = getNullableType(type) as GraphQLNullableType;
  const namedFieldType = getNamedType(fieldType);

  if (
    namedFieldType instanceof GraphQLUnionType ||
    namedFieldType instanceof GraphQLInterfaceType
  ) {
    // the default `resolveType` always returns null. We add a fallback
    // resolution that works with how unions and interface are mocked
    namedFieldType.resolveType = (data: any, context: any, info: GraphQLResolveInfo) => {
      return info.schema.getType(data.__typename) as GraphQLObjectType;
    };
  }
}
