import React from "react";
import { GraphQLSchema, DocumentNode } from "graphql";
import {
  ApolloClient,
  DefaultOptions,
  ApolloCache,
  ApolloLink,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject
} from "@apollo/client";
import MockLink, { ApolloErgonoMockMap, MockLinkCallHandler } from "./MockLink";
import { DefaultMockResolvers } from '../mock';

export interface ErgonoMockedProviderProps<TSerializedCache = {}> {
  schema: GraphQLSchema | DocumentNode;
  onCall?: MockLinkCallHandler;
  mocks?: ApolloErgonoMockMap;
  addTypename?: boolean;
  defaultOptions?: DefaultOptions;
  cache?: ApolloCache<TSerializedCache>;
  resolvers?: DefaultMockResolvers;
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
      link: link || new MockLink(schema, mocks || {}, { addTypename, onCall, resolvers }),
    });
    setClient(c);
    return () => client && ((client as unknown) as ApolloClient<any>).stop();
  }, [mocks, addTypename, link, cache, defaultOptions]);

  if (!client) {
    return null;
  }
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}
