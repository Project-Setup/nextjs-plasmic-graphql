# Setup

## [Node](https://github.com/nvm-sh/nvm)

1. [install nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if not done yet
1. use latest node version
    ```sh
    nvm use node || nvm install node
    ```

## [NextJs](https://nextjs.org)

1. create nextjs app in the parent folder

    ```sh
    npx create-next-app@latest --typescript <project-name>
    # or
    pnpm create next-app -- --typescript <project-name>
    ```

## [PNPM](https://pnpm.io/)

1. pin nodejs version in the project

    ```sh
    node -v > .nvmrc
    ```

1. remove the `package.json` and `node_modules/`

    ```sh
    rm package.json
    rm -rf node_modules
    ```

1. install pnpm globally

    ```sh
    npm i -g pnpm
    ```

1. install dependencies

    ```sh
    pnpm install
    ```

## [Eslint and Prettier](https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb)

1. remove `.eslintrc.json`

    ```sh
    rm .eslintrc.json
    ```

1. install prettier

    ```sh
    pnpm i -D prettier eslint-config-prettier eslint-plugin-prettier
    ```

1. add `.eslintrc.js`

    ```js
    module.exports = {
        extends: ['next', 'prettier', 'plugin:prettier/recommended'],
    };
    ```

1. add `.prettier.js`

    ```js
    /** @type {import('prettier').Config} */
    module.exports = {
        tabWidth: 2,
        overrides: [
            {
                files: '*.md',
                options: {
                    tabWidth: 4,
                },
            },
        ],
        semi: true,
        singleQuote: true,
        printWidth: 80,
        trailingComma: 'es5',
    };
    ```

## [Jest](https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler)

1. install jest and react-testing-library
    ```sh
    pnpm i -D jest @testing-library/react @testing-library/jest-dom
    ```
1. add `__tests__/` folder
    ```sh
    mkdir -p __tests__
    ```
1. add `__tests__/jest.config.js`

    ```js
    const nextJest = require('next/jest');

    const createJestConfig = nextJest({
        dir: './',
    });

    const customJestConfig = {
        setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
        moduleDirectories: ['node_modules', '<rootDir>/'],
        testRegex: '__tests__/.*\\.test\\.tsx?$',
        testEnvironment: 'jest-environment-jsdom',
    };

    module.exports = createJestConfig(customJestConfig);
    ```

1. add `__tests__/jest.setup.ts`
    ```ts
    import '@testing-library/jest-dom/extend-expect';
    ```
1. add to `package.json`
    ```json
    {
        "scripts": {
            "test": "jest --config ./__tests__/jest.config.js",
            "test:watch": "jest --config ./__tests__/jest.config.js --watch"
        }
    }
    ```

## [URQL](https://www.npmjs.com/package/next-urql)

1. install urql and nextjs bindings

    ```sh
    pnpm i urql graphql next-urql react-is @urql/core @urql/exchange-graphcache
    pnpm i -D @urql/devtools
    ```

1. add `lib/urql/getUrqlClientOptions.ts`

    ```ts
    import { devtoolsExchange } from '@urql/devtools';
    import { cacheExchange } from '@urql/exchange-graphcache';
    import { NextUrqlClientConfig } from 'next-urql';
    import { debugExchange, dedupExchange, fetchExchange } from 'urql';
    import getIsClient from 'lib/utils/getIsClient';

    const getUrqlClientOptions: NextUrqlClientConfig = (ssrCache) => {
        const isClient = typeof window !== 'undefined';
        const isProd = process.env.NEXT_PUBLIC_ENV === 'production';
        return {
            url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
            exchanges: [
                ...(isClient && !isProd
                    ? [devtoolsExchange, debugExchange]
                    : []),
                dedupExchange,
                cacheExchange({}),
                ssrCache, // ssrExchange has to come before fetchExchange
                fetchExchange,
            ],
        };
    };

    export default getUrqlClientOptions;
    ```

1. add graphql query, i.e. `graphql/query/userQuery.ts`

    ```ts
    export const USER_QUERY = `
        query {
            post(id: 1) {
            id
            title
            body
            }
        }
    `;
    ```

1. instantiate graphql client in one of the `getStaticProps` or `getServerSideProps` methods

    ```ts
    import type { GetStaticProps } from 'next';
    import getUrqlClientOptions from 'lib/urql/getUrqlClientOptions';
    import { initUrqlClient } from 'next-urql';
    import { USER_QUERY } from 'graphql/query/userQuery';
    import { ssrExchange, useQuery } from 'urql';

    export const getStaticProps: GetStaticProps<PageProps> = async () => {
        const ssrCache = ssrExchange({ isClient: false });
        const urqlClientOption = getUrqlClientOptions(ssrCache);
        const client = initUrqlClient(urqlClientOption, false);

        const result = await client?.query(USER_QUERY).toPromise();

        return {
            props: {
                urqlState: ssrCache.extractData(),
            },
            revalidate: 600,
        };
    };
    ```

1. wrap the page with `withUrqlClient`

    ```ts
    import { withUrqlClient, initUrqlClient, SSRData } from 'next-urql';

    export default withUrqlClient(getUrqlClientOptions, {
        neverSuspend: true, // don't use Suspend on server side
        ssr: false, // don't generate getInitialProps for the page
        staleWhileRevalidate: true, // tell client to do network-only data fetching again if the cached data is outdated
    })(TestGraphql);
    ```

## [GraqphQL Codegen](https://www.graphql-code-generator.com/docs/guides/react#optimal-configuration-for-apollo-and-urql)

1. install graphql codegen dependencies

    ```ts
    pnpm i @graphql-typed-document-node/core
    pnpm i -D @graphql-codegen/cli @graphql-codegen/typed-document-node @graphql-codegen/typescript @graphql-codegen/typescript-operations
    ```

1. add `lib/graphql-codegen/codegen.yml`

    ```yml
    schema: <html-to-graphql-endpoint-or-path-to-server-graphql>
    documents: './graphql/**/*.graphql' # custom frontend query or mutation defined in graphql
    generates:
    ./graphql/generated.ts:
        plugins:
            - typescript
            - typescript-operations
            - typed-document-node
        config:
        fetcher: fetch
    ```

1. add to `package.json`
    ```json
    {
        "scripts": {
            "codegen": "graphql-codegen --config lib/grpahql-codegen/codegen.yml"
        }
    }
    ```

## [Plasmic](https://docs.plasmic.app/learn/nextjs-quickstart)

1. install plasmic dependencies

    ```sh
    pnpm i @plasmicapp/loader-nextjs
    ```
