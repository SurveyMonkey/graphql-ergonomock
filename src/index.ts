import {
  GraphQLSchema,
  parse,
  execute,
  DocumentNode,
  ASTNode,
  OperationDefinitionNode,
  GraphQLType,
  isScalarType,
  isObjectType,
  FieldNode,
  SelectionSetNode,
  GraphQLObjectType,
  isExecutableDefinitionNode
} from "graphql";
import Maybe from "graphql/tsutils/Maybe";

function isDocumentNode(x: ASTNode): x is DocumentNode {
  return x.kind === "Document";
}

function isFieldNode(x: ASTNode): x is FieldNode {
  return x.kind === "Field";
}

function isOperationDefinitionNode(x: ASTNode): x is OperationDefinitionNode {
  return x.kind === "OperationDefinition";
}

function _mock(
  typeNode: GraphQLType,
  queryNode: ASTNode,
  schema: GraphQLSchema,
  mocks: Record<any, any>
): any {
  // Unfurl the first wrapping queryNode
  if (isDocumentNode(queryNode)) {
    const firstDefinition = queryNode.definitions[0];
    if (isOperationDefinitionNode(firstDefinition)) {
      return _mock(
        (firstDefinition.operation === "query"
          ? schema.getQueryType()
          : schema.getMutationType()) as GraphQLObjectType,
        firstDefinition,
        schema,
        mocks
      );
    }
  }

  if (isOperationDefinitionNode(queryNode) || isFieldNode(queryNode)) {
    if (queryNode.selectionSet) {
      if (isObjectType(typeNode)) {
        const fields = typeNode.getFields();
        return queryNode.selectionSet.selections.reduce((previous, current) => {
          if (isFieldNode(current)) {
            return {
              ...previous,
              [current.name.value]: _mock(fields[current.name.value].type, current, schema, mocks)
            };
          }
          return previous;
        }, {});
      }
    }

    if (isScalarType(typeNode)) {
      return 3;
    }
  }
}

export function mock(schema: GraphQLSchema, query: string, partialMock?: any, options?: any) {
  const ast = parse(query);

  console.log(JSON.stringify(ast, undefined, 2));
  return _mock(undefined, ast, schema, partialMock || {});

  // Given a query Document node
  // Get the corresponding schema type
  // If the document node has NO selection set
  // check if there's a corresponding mock,
  // if so, return it or call it
  // if NOT, generate a random value

  // If the document has a selection set
  // For each field in the selection set
  // recurse
}
