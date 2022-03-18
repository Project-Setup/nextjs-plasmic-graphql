# Development

-   Use the node version defined in `.nvmrc`

    ```sh
    $ nvm use || nvm install
    ```

-   Update npm dependencies

    ```sh
    $ pnpm install
    ```

-   Write custom query or mutations in `.graphql` files in the folder or any subfolder of `graphql/`. For example, `graphql/query/getPostsById.query.graphql`:

    ```graphql
    query GetPostById($id: ID!) {
        post(id: $id) {
            id
            title
            body
        }
    }
    ```

-   Run codegen in shell

    ```sh
    pnpm codegen
    ```

-   Use the generated typed-documents, query types and variable types in the `graphql/generated.ts` with `urql`. For example, `pages/test-graphql.tsx`:

    ```tsx
    import { useQuery } from 'urql';
    import {
        GetPostByIdDocument,
        GetPostByIdQuery,
        GetPostByIdQueryVariables,
    } from 'graphql/generated';

    // ...
    const [result] = useQuery<GetPostByIdQuery, GetPostByIdQueryVariables>({
        query: GetPostByIdDocument,
        variables: {
            id: '1',
        },
    });
    // ...
    ```

-   Write tests in `__tests__` folder with filename `*.test.ts(x)`
