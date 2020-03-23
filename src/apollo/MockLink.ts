import { ApolloLink, Operation, Observable, FetchResult, ExecutionResult } from "@apollo/client";
import { ErgonoMockShape, ergonomock } from "../mock";
import { GraphQLSchema } from "graphql";
import stringify from "fast-json-stable-stringify";

type MockLinkOptions = {
  addTypename: Boolean;
  onCall?: MockLinkCallHandler;
};

export type ApolloErgonoMockMap = Record<
  string,
  ErgonoMockShape | ((operation: Operation) => ErgonoMockShape | null)
>;

type MockLinkCallArg = {
  operation: Operation;
  response: ExecutionResult;
};

export type MockLinkCallHandler = (spyObj: MockLinkCallArg) => void;

export default class MockLink extends ApolloLink {
  constructor(
    private schema: GraphQLSchema,
    private mockMap: ApolloErgonoMockMap,
    private options: MockLinkOptions = { addTypename: true }
  ) {
    super();
  }

  public request(operation: Operation): Observable<FetchResult> | null {
    // Find mock by operation name
    // TODO: potentially merge multiple mocks with the same name.
    let mock;
    if (this.mockMap[operation.operationName]) {
      mock = this.mockMap[operation.operationName];

      //  If mock is a function, call it with variables.
      if (typeof mock === "function") {
        mock = mock(operation);
      }
    }

    const seed = stringify({
      query: operation.query,
      variables: operation.variables,
      operationName: operation.operationName
    });

    // Call ergonomock() to get results
    const result = ergonomock(this.schema, operation.query, {
      mocks: mock || {},
      mockSeed: seed,
      variables: operation.variables
    });

    // Return Observer to be compatible with apollo
    return new Observable(observer => {
      Promise.resolve(result).then(r => {
        if (r) {
          observer.next(r);
        }
        // Call onCall with the right signature before calling observer.next(result)
        if (this.options.onCall) {
          this.options.onCall({ operation, response: r });
        }
        observer.complete();
      });
    });
  }
}
