import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from "subscriptions-transport-ws";
import ws from 'ws';
import fetch from 'cross-fetch';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { decode } from './decode';
import { GET_MESSAGES, AUTH_USER, ADD_USER, PASSWORD_SALT, ADD_MESSAGE, NEW_MESSAGE } from './queries';

dotenv.config();

const httpLink = createHttpLink({
  uri: process.env.GRAPHQL_PATH,
  fetch,
});

const client = new SubscriptionClient(process.env.GRAPHQL_SUBSCRIPTION_PATH, {
  reconnect: true
}, ws);
 
const wsLink = new WebSocketLink(client);

const login = async () => {
  // Creates the login client without authentication
  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });

  try {

    const { data: { passwordSalt: salt } } = await client.mutate({ mutation: PASSWORD_SALT, variables: { name: process.env.USERNAME } });

    const password = await bcrypt.hash(process.env.PASSWORD, salt);

    const { data: { authUser: token } } = await client.mutate({ mutation: AUTH_USER, variables: { name: process.env.USERNAME, password } });

    return token;
  } catch(e) {
    console.log("error", e);
    return null;
  }
}

const register = async () => {
  // Creates the register client without authentication
  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(process.env.PASSWORD, salt);

  try {
    await client.mutate({ mutation: ADD_USER, variables: { name: process.env.USERNAME, password, passwordSalt: salt } });
  } catch(e) {
    console.log("error", e);
  }
}

const sendMessage = async (message, client) => {
  try {
    const data = await client.mutate({ mutation: ADD_MESSAGE, variables: { text: message }});
  } catch(e) {
    console.log("error", e);
  }
}

const processMessage = async (message, client) => {
  if(/^\/stock=/.test(message) ) {
    const stockCode = message.split('=')[1];
    const answer = await decode(stockCode);
    await sendMessage(answer, client);
  }
}

const main = async () => {
  let token = await login();
  if(!token) {
    await register();
    token = await login();
  }

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    wsLink,
    cache: new InMemoryCache()
  });

  client.watchQuery({ query: GET_MESSAGES, variables: { limit: 1 }, pollInterval: 500 }).subscribe(data => processMessage(data.data.messages[0].text, client));

  (function wait () {
    setTimeout(wait, 10000);
  })();
}

main();

