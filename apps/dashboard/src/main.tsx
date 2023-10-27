import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        items: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

axios.interceptors.request.use(function (config) {
  const { token } = JSON.parse(localStorage.getItem("credentials") ?? "{}");
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const { token } = JSON.parse(localStorage.getItem("credentials") ?? "{}");
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  };
});

const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
