import React from "react";
import {
  ApolloClient,
  DefaultOptions,
  ApolloCache,
  Resolvers,
  ApolloLink,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject
} from "@apollo/client";
import MockLink, { ApolloErgonoMockMap, MockLinkCallHandler } from "./MockLink";
import { GraphQLSchema } from "graphql";

export interface ErgonoMockedProviderProps<TSerializedCache = {}> {
  schema: GraphQLSchema;
  onCall?: MockLinkCallHandler;
  mocks?: ApolloErgonoMockMap;
  addTypename?: boolean;
  defaultOptions?: DefaultOptions;
  cache?: ApolloCache<TSerializedCache>;
  resolvers?: Resolvers;
  children?: React.ReactElement;
  link?: ApolloLink;
}

export default function ErgonoMockedProvider(props: ErgonoMockedProviderProps) {
  const {
    mocks,
    addTypename = true,
    onCall,
    link,
    cache,
    resolvers,
    defaultOptions,
    schema
  } = props;
  const [client, setClient] = React.useState<ApolloClient<NormalizedCacheObject>>();
  React.useEffect(() => {
    const c = new ApolloClient({
      cache: cache || new InMemoryCache({ addTypename }),
      defaultOptions,
      link: link || new MockLink(schema, mocks || {}, { addTypename, onCall }),
      resolvers
    });
    setClient(c);
    return () => client && ((client as unknown) as ApolloClient<any>).stop();
  }, [mocks, addTypename, link, cache, defaultOptions]);

  if (!client) {
    return null;
  }
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}
