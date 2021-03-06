# Experimental Apollo Rest Link Implementation

[![CircleCI](https://circleci.com/gh/n1ru4l/apollo-link-rest.svg?style=svg)](https://circleci.com/gh/n1ru4l/apollo-link-rest)

Demo: https://codesandbox.io/s/5yknn3jjzp

If you have ideas or want to contribute feel free to open issues or pull requests 😊

## Install

```shell
yarn add @n1ru4l/apollo-link-rest
```

## Rest Schema Generator

Generate an executable Schema from typeDefs annotated with `@rest` directives
 This can be used by apollo-server or a schema link.

### Example Schema

```graphql
type User {
  id: ID!
  login: String!
  friends: [User]!
    @rest(
      route: "/users/:userId/friends"
      provides: { userId: "id" } # map id from parent object to :userId route param
    )
}

type Query {
  user(id: ID!): User @rest(route: "/users/:id")
}
```

### Usage

```javascript
import { generateRestSchema } from 'apollo-rest-link'
import { graphql } from 'graphql'
import fetch from 'node-fetch'

const typeDefs = `
  type User {
    id: ID!
    login: String!
    friends: [User]!
      @rest(
        route: "/users/:userId/friends"
        provides: { userId: "id" } # map id from parent object to :userId route param
      )
  }

  type Query {
    user(id: ID!): User @rest(route: "/users/:id")
  }
`

const schema = generateRestSchema({
  typeDefs,
  fetcher: fetch,
})

const query = `
  query user {
    user(id: "2") {
      id
      login
      friends {
        id
        login
      }
    }
  }
`

graphql(schema, query)
  .then(console.log)
  .catch(console.log)
```

## Schema Link

Query a generated schema.

### Usage

```javascript
import { generateRestSchema, createSchemaLink } from 'apollo-rest-link'
import { execute, makePromise } from 'apollo-link'
import gql from 'graphql-tag'
import fetch from 'node-fetch'

const typeDefs = `
  type User {
    id: ID!
    login: String!
    friends: [User]!
      @rest(
        route: "/users/:userId/friends"
        provides: { userId: "id" } # map id from parent object to :userId route param
      )
  }

  type Query {
    user(id: ID!): User @rest(route: "/users/:id")
  }
`

const schema = generateRestSchema({
  typeDefs,
  fetcher: fetch,
})

const link = createSchemaLink({ schema })

const query = gql`
  query user {
    user(id: "2") {
      id
      login
      friends {
        id
        login
      }
    }
  }
`

makePromise(execute(link, { operationName: `userProfile`, query }))
  .then(console.log)
  .catch(console.log)
```


## Rest Link

This implementation uses query directives and maps them to rest endpoints.
At the moment there is only support for queries which are mapped to GET requests

### Example Query

```graphql
query userProfile($id: ID!) {
  userProfile(id: $id) @rest(type: "User", route: "/users/:id", params: { id: $id }) {
    id
    login
    friends @rest(
      type: "User"
      route: "/users/:userId/friends"
      provides: { userId: "id" } # map id from parent object to :userId route param
    ) {
      id
      login
    }
  }
}
```

### Usage

```javascript
import gql from 'graphql-tag'
import { execute, makePromise } from 'apollo-link'
import fetch from 'node-fetch'
import { createRestLink } from 'apollo-rest-link'

const link = createRestLink({ fetcher: fetch })

const query = gql`
  query userProfile($id: ID!) {
    userProfile(id: $id) @rest(type: "User", route: "/users/:id", params: { id: $id }) {
      id
      login
      friends @rest(
        type: "User"
        route: "/users/:userId/friends"
        provides: { userId: "id" } # map id from parent object to :userId route param
      ) {
        id
        login
      }
    }
  }
`

makePromise(execute(link, { operationName: `userProfile`, query }))
  .then(console.log)
  .catch(console.log)

```

# Tests

```shell
yarn test
```
