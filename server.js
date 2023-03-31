import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

let tweets = [
  {
    id: "1",
    text: "Hello World",
    userId: "2",
  },
  {
    id: "2",
    text: "By World",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Doe",
  },
];

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
  }

  type Tweet {
    id: ID!
    text: String!
    autor: User
  }

  type Movie {
    description: String!
    favorite_count: Int!
    id: Int!
    item_count: Int!
    iso_639_1: String!
    list_type: String!
    name: String!
    poster_path: String
  }

  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    allTweets: () => tweets,
    tweet: (root, { id }) => tweets.find((tweet) => tweet.id === id),
    allUsers: () => users,
    allMovies: () => {
      return fetch(
        "https://api.themoviedb.org/3/movie/123/lists?api_key=a3cdf35924e8717e7bcf49d812091830"
      )
        .then((res) => res.json())
        .then((res) => res.results);
    },
  },
  Mutation: {
    postTweet: (root, { text, userId }) => {
      const newTweet = {
        id: String(tweets.length + 1),
        text,
        userId,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet: (root, { id }) => {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName: (user) => `${user.firstName} ${user.lastName}`,
  },
  Tweet: {
    autor: (tweet) => users.find((user) => user.id === tweet.userId),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
