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
import MockLink from "./MockLink";

export interface ErgonoMockedProviderProps<TSerializedCache = {}> {
  mocks?: any; // TODO: replace by mock shape interface
  addTypename?: boolean;
  defaultOptions?: DefaultOptions;
  cache?: ApolloCache<TSerializedCache>;
  resolvers?: Resolvers;
  children?: React.ReactElement;
  link?: ApolloLink;
}

export default function ErgonoMockedProvider(props: ErgonoMockedProviderProps) {
  const { mocks, addTypename, link, cache, resolvers, defaultOptions } = props;
  const [client, setClient] = React.useState<ApolloClient<NormalizedCacheObject>>();
  React.useEffect(() => {
    const c = new ApolloClient({
      cache: cache || new InMemoryCache({ addTypename }),
      defaultOptions,
      link: link || new MockLink(mocks, { addTypename }),
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
