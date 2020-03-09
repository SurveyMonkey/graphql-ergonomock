import {
  GraphQLSchema,
  parse,
  execute,
  DocumentNode,
  visitWithTypeInfo,
  TypeInfo,
  ASTNode,
  OperationDefinitionNode,
  GraphQLType,
  isScalarType,
  isObjectType,
  FieldNode,
  SelectionSetNode,
  GraphQLObjectType,
  isExecutableDefinitionNode,
  visit,
  Kind,
  GraphQLInterfaceType,
  GraphQLUnionType
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

// function _mock(
//   typeNode: GraphQLType,
//   queryNode: ASTNode,
//   schema: GraphQLSchema,
//   mocks: Record<any, any>
// ): any {
//   // Unfurl the first wrapping queryNode
//   if (isDocumentNode(queryNode)) {
//     const firstDefinition = queryNode.definitions[0];
//     if (isOperationDefinitionNode(firstDefinition)) {
//       return _mock(
//         (firstDefinition.operation === "query"
//           ? schema.getQueryType()
//           : schema.getMutationType()) as GraphQLObjectType,
//         firstDefinition,
//         schema,
//         mocks
//       );
//     }
//   }

//   if (isOperationDefinitionNode(queryNode) || isFieldNode(queryNode)) {
//     if (queryNode.selectionSet) {
//       if (isObjectType(typeNode)) {
//         const fields = typeNode.getFields();
//         return queryNode.selectionSet.selections.reduce((previous, current) => {
//           if (isFieldNode(current)) {
//             return {
//               ...previous,
//               [current.name.value]: _mock(fields[current.name.value].type, current, schema, mocks)
//             };
//           }
//           return previous;
//         }, {});
//       }
//     }

//     if (isScalarType(typeNode)) {
//       return 3;
//     }
//   }
// }

export function mock(schema: GraphQLSchema, query: string, partialMock?: any, options?: any) {
  const ast = parse(query);

  console.log(JSON.stringify(ast, undefined, 2));
  const typeInfo = new TypeInfo(schema);
  const newAST = visit(
    ast, // Query
    visitWithTypeInfo(typeInfo, {
      [Kind.SELECTION_SET](node: SelectionSetNode): SelectionSetNode | null | undefined {
        const parentType: GraphQLType = typeInfo.getParentType();
        let selections = node.selections;
        console.log("fooo", parentType);
        if (
          parentType &&
          (parentType instanceof GraphQLInterfaceType || parentType instanceof GraphQLUnionType) &&
          !selections.find(
            _ =>
              (_ as FieldNode).kind === Kind.FIELD && (_ as FieldNode).name.value === "__typename"
          )
        ) {
          selections = selections.concat({
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: "__typename"
            }
          });
        }

        if (selections !== node.selections) {
          return {
            ...node,
            selections
          };
        }
      }
    })
  );

  console.log(JSON.stringify(newAST, undefined, 2));
  // forEveryField((queryField, ) => {

  // })

  // // console.log(JSON.stringify(ast, undefined, 2));
  // execute({
  //   schema,
  //   document: ast,
  //   rootValue: {},
  //   contextValue: {},
  //   fieldResolver: (source, args, context, info) => console.log(source, args, context, info)
  // });

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
