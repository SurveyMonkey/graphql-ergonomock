import {
  GraphQLField,
  GraphQLSchema,
  DocumentNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  Kind,
  FieldNode,
  isAbstractType,
  isObjectType
} from "graphql";
import { getFieldDef } from "graphql/execution/execute";

type IteratorFn = (fieldDef: GraphQLField<any, any>, parentType: string, fieldName: string) => void;

export default function forEachFieldInQuery(
  schema: GraphQLSchema,
  document: DocumentNode,
  fn: IteratorFn
) {
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
