# Experimental Apollo Rest Link Implementation

This is just me experimenting with GraphQL AST stuff.

If you have ideas or want to contribute feel free to open issues or pull requests 😊

# Example Query

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

# Tests

```shell
npx jest
```
