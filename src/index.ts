import {
  GraphQLSchema,
  parse,
  execute,
  DocumentNode,
  visitWithTypeInfo,
  TypeInfo,
  GraphQLType,
  FieldNode,
  GraphQLObjectType,
  visit,
  Kind,
  GraphQLInterfaceType,
  GraphQLUnionType,
  getNamedType,
  GraphQLField,
  getNullableType,
  GraphQLNullableType,
  GraphQLResolveInfo,
  GraphQLFieldResolver,
  GraphQLList,
  GraphQLEnumType,
  isAbstractType,
  isObjectType
} from "graphql";
import { getFieldDef } from "graphql/execution/execute";

type IteratorFn = (fieldDef: GraphQLField<any, any>, parentType: string, fieldName: string) => void;

function forEachFieldInQuery(schema: GraphQLSchema, document: DocumentNode, fn: IteratorFn) {
  const typeInfo = new TypeInfo(schema);
  visit(
    document,
    visitWithTypeInfo(typeInfo, {
      [Kind.FIELD](node: FieldNode): FieldNode | null | undefined {
        const fieldName = node.name.value;
        if (fieldName === "__typename") {
          return;
        }
        const parentType = typeInfo.getParentType();
        // const fieldType = typeInfo.getType(); // the return type of this field.
        if (isAbstractType(parentType)) {
          const possibleTypes = schema.getPossibleTypes(parentType);
          possibleTypes.forEach(t => {
            const fieldDef = getFieldDef(schema, t, fieldName);
            if (fieldDef) {
              fn(fieldDef, t.name, fieldName);
            }
          });
        }
        if (isObjectType(parentType)) {
          const parentFields = parentType.getFields();
          const fieldDef = parentFields[node.name.value]; // the schame field definition
          fn(fieldDef, parentType.name, fieldName);
        }
      }
    })
  );
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

function getRandomElement(ary: ReadonlyArray<any>) {
  const sample = Math.floor(Math.random() * ary.length);
  return ary[sample];
}

const defaultMockMap: Map<string, GraphQLFieldResolver<any, any>> = new Map();
defaultMockMap.set("Int", () => Math.round(Math.random() * 200) - 100);
defaultMockMap.set("Float", () => Math.random() * 200 - 100);
defaultMockMap.set("String", () => "Hello World");
defaultMockMap.set("Boolean", () => Math.random() > 0.5);
defaultMockMap.set("ID", () => "123456");

export function mock(schema: GraphQLSchema, query: string, partialMock?: any, options?: any) {
  const document = parse(query);

  const mockResolverFunction = function(type: GraphQLType, typeName?: string, fieldName?: string) {
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
        let result: any;

        // if we're here, the field is already defined on the root object so use it
        if (typeof root[fieldName] === "function") {
          result = root[fieldName](root, args, context, info);
        } else {
          result = root[fieldName];
        }

        return result;
      }

      // Default mock for enums
      if (fieldType instanceof GraphQLEnumType) {
        return getRandomElement(fieldType.getValues()).value;
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
    /* istanbul ignore next: Must provide schema DefinitionNode with query type or a type named Query. */
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
