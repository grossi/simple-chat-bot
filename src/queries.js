import { gql } from 'apollo-boost';

const GET_MESSAGES = gql`
  query GET_MESSAGES($limit: Int) {
    messages(limit: $limit){
      id
      text
      timeStamp
      creator {
        name
      }
    }
  }
`;

const ADD_MESSAGE = gql`
  mutation ADD_MESSAGE($text: String!) {
    addMessage(text:$text) {
      id
      text
      creator {
        name
      }
    }
  }
`; 

const AUTH_USER = gql`
  mutation AUTH_USER($name: String!, $password: String!) {
    authUser(name: $name, password: $password)
  }
`;

const ADD_USER = gql`
  mutation ADD_USER($name: String!, $password: String!, $passwordSalt: String) {
    addUser(name: $name, password: $password, passwordSalt: $passwordSalt) {
      id
    }
  }
`;

const PASSWORD_SALT = gql`
  mutation PASSWORD_SALT($name: String!) {
    passwordSalt(name: $name)
  }
`;

const NEW_MESSAGE = gql`
  subscription NEW_MESSAGE{
    newMessage {
      text
    }
  }
`;

module.exports = { GET_MESSAGES, AUTH_USER, ADD_USER, PASSWORD_SALT, ADD_MESSAGE, NEW_MESSAGE };
