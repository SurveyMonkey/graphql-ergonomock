import { ApolloLink, Operation, Observable, FetchResult } from "@apollo/client";

export default class MockLink extends ApolloLink {
  constructor() {
    super();
  }

  public request(operation: Operation): Observable<FetchResult> | null {}
}
