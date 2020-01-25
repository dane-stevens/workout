import ApolloClient from 'apollo-boost'

const client = new ApolloClient({
  uri: '/.netlify/functions/apollo-graphql',
})

export default client