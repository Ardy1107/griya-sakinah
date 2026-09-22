# GraphQL — Best Practices 2025

## Summary
GraphQL = typed API query language. Client requests exactly what it needs. Key: client-centric schema, cursor pagination, query depth limiting, DataLoader for N+1.

## Schema Design
```graphql
# ✅ Naming: PascalCase types, camelCase fields, ALL_CAPS enums
type User {
  id: ID!
  firstName: String!
  email: String!
  posts(first: Int, after: String): PostConnection!
  role: UserRole!
}

enum UserRole {
  ADMIN
  EDITOR
  VIEWER
}

# ✅ Input types for mutations
input CreateUserInput {
  firstName: String!
  email: String!
  role: UserRole = VIEWER
}

# ✅ Cursor-based pagination (not offset)
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}
type PostEdge {
  node: Post!
  cursor: String!
}
type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}
```

## Queries
```graphql
# ✅ Request only what you need
query GetUser($id: ID!) {
  user(id: $id) {
    firstName
    email
    posts(first: 10) {
      edges { node { title } }
    }
  }
}
```

## Mutations
```graphql
# ✅ Verb-first naming, input type, return affected data
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    user { id firstName email }
    errors { field message }
  }
}
```

## Security
- Disable introspection in production
- Implement query depth limiting (max 10)
- Query complexity analysis
- Rate limiting per client
- Authentication via JWT/OAuth

## Performance
- DataLoader for batching (solves N+1)
- Persisted queries in production
- Cache at field level
- Pagination for all lists

## When to Use
| Use Case | Choice |
|----------|--------|
| Simple CRUD | REST |
| Complex nested data | **GraphQL** |
| Real-time updates | GraphQL Subscriptions |
| Multiple frontends | **GraphQL** |
| File uploads | REST |

## Date: 2026-03-17 | Sources: graphql.org, apollographql.com
