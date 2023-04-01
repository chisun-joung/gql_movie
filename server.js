import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.API_KEY;

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
    author: User
  }

  type SpokenLanguage {
    iso_639_1: String!
    name: String!
  }

  type ProductionCompany {
    id: Int!
    logo_path: String
    name: String!
    origin_country: String!
  }

  type ProductionCountry {
    iso_3166_1: String!
    name: String!
  }

  type Genre {
    id: Int!
    name: String!
  }

  type Movie {
    adult: Boolean!
    backdrop_path: String
    belongs_to_collection: String
    budget: Int!
    genres: [Genre!]!
    homepage: String
    id: Int!
    imdb_id: String
    original_language: String!
    original_title: String!
    overview: String
    popularity: Float!
    poster_path: String
    production_companies: [ProductionCompany!]!
    production_countries: [ProductionCountry!]!
    release_date: String!
    revenue: Int!
    runtime: Int
    spoken_languages: [SpokenLanguage!]!
    status: String!
    tagline: String
    title: String!
    video: Boolean!
    vote_average: Float!
    vote_count: Int!
  }

  type topRatedMovies {
    adult: Boolean!
    backdrop_path: String
    genre_ids: [Int!]!
    id: Int!
    original_language: String!
    original_title: String!
    overview: String!
    popularity: Float!
    poster_path: String
    release_date: String!
    title: String!
    video: Boolean!
    vote_average: Float!
    vote_count: Int!
  }

  type Query {
    allMovies: [topRatedMovies!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: ID!): Movie
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
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}`
      )
        .then((res) => res.json())
        .then((res) => res.results);
    },
    movie: (root, { id }) => {
      return fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
      )
        .then((res) => res.json())
        .then((res) => res);
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
    author: (tweet) => users.find((user) => user.id === tweet.userId),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
