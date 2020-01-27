import { ApolloClient } from 'apollo-client';
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    ...process.env.NODE_ENV === 'production' ? [createPersistedQueryLink({ useGETForHashedQueries: true })] : [],
    new HttpLink({
      uri: '/.netlify/functions/apollo-graphql',
      credentials: 'same-origin'
    })
  ]),
  cache: new InMemoryCache()
});

export default client