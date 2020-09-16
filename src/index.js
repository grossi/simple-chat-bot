import { ApolloClient, InMemoryCache, gql } from 'apollo-boost';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'cross-fetch';
import dotenv from 'dotenv';
import util from 'util';

dotenv.config();

const httpLink = createHttpLink({
  uri: process.env.GRAPHQL_PATH,
  fetch,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

const GET_MESSAGES = gql`
  query GET_MESSAGES {
    messages{
      id
      text
      timeStamp
      creator {
        name
      }
    }
  }
`;

const start = async () => {
  const data = await client.query({ query: GET_MESSAGES });

  console.log("rawr 2", util.inspect(data, false, null, true));
}

start();
