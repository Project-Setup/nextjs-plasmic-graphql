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
    /** @type {import('eslint').Linter.Config} */
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
    pnpm i -D jest @jest/types @testing-library/react @testing-library/jest-dom
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

    /** @type {import('@jest/types').Config.InitialOptions} */
    const customJestConfig = {
        rootDir: '../',
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
    import { ssrExchange } from 'urql';
    import { WithUrqlState } from 'next-urql';

    export interface PageProps {}

    export interface StaticProps extends WithUrqlState, PageProps {}

    export const getStaticProps: GetStaticProps<StaticProps> = async () => {
        const ssrCache = ssrExchange({ isClient: false });
        const urqlClientOption = getUrqlClientOptions(ssrCache);
        const client = initUrqlClient(urqlClientOption, false);

        await client?.query(USER_QUERY).toPromise();

        return {
            props: {
                urqlState: ssrCache.extractData(),
            },
            revalidate: 600,
        };
    };
    ```

1. add `lib/urql/withStaticUrqlClient.ts` to wrap static generated pages

    ```ts
    import { withUrqlClient } from 'next-urql';
    import getUrqlClientOptions from './getUrqlClientOptions';

    const withStaticUrqlClient = withUrqlClient(getUrqlClientOptions, {
        neverSuspend: true, // don't use Suspense on server side
        ssr: false, // don't generate getInitialProps for the page
        staleWhileRevalidate: true, // tell client to do network-only data fetching again if the cached data is outdated
    });

    export default withStaticUrqlClient;
    ```

1. wrap the page with `withStaticUrqlClient`

    ```ts
    import withStaticUrqlClient from 'lib/urql/withStaticUrqlClient';

    // ...

    export default withStaticUrqlClient(Page);
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

-   choose either integration method below depending on the usage of Plasmic

### Use plasmic as [Headless API](https://docs.plasmic.app/learn/nextjs-quickstart)

1. install plasmic dependencies

    ```sh
    pnpm i @plasmicapp/loader-nextjs
    ```

1. add plasmic client

    ```ts
    import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';

    export const Plasmic = initPlasmicLoader({
        projects: [
            {
                id: process.env.PLASMIC_ID || '',
                token: process.env.PLASMIC_TOKEN || '',
            },
        ],
        preview: true, // set false for production env
    });
    ```

1. remove `pages/index.tsx`

1. add `pages/[[...catchall]].tsx` to generate all pages created in plasmic studio

    ```tsx
    import {
        ComponentRenderData,
        PlasmicComponent,
        PlasmicRootProvider,
    } from '@plasmicapp/loader-nextjs';
    import { Plasmic } from 'lib/plasmic/plasmic';
    import withStaticUrqlClient from 'lib/urql/withStaticUrqlClient';
    import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
    import Error from 'next/error';

    export interface PageProps {
        plasmicData?: ComponentRenderData;
    }

    /**
     * Use fetchPages() to fetch list of pages that have been created in Plasmic
     */
    export const getStaticPaths: GetStaticPaths = async () => {
        const pages = await Plasmic.fetchPages();
        return {
            paths: pages.map((page) => ({
                params: {
                    catchall: page.path.substring(1).split('/'),
                },
            })),
            fallback: 'blocking',
        };
    };

    /**
     * For each page, pre-fetch the data we need to render it
     */
    export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
        const { catchall } = ctx.params ?? {};

        const plasmicPath =
            typeof catchall === 'string'
                ? catchall
                : Array.isArray(catchall)
                ? `/${catchall.join('/')}`
                : '/';

        const plasmicData = await Plasmic.maybeFetchComponentData(plasmicPath);

        if (plasmicData) {
            return {
                props: {
                    plasmicData,
                },
                revalidate: 300,
            };
        } else {
            return {
                props: {},
            };
        }
    };

    const CatchallPage: NextPage<PageProps> = ({ plasmicData }) => {
        if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
            return <Error statusCode={404} />;
        }
        const pageMeta = plasmicData.entryCompMetas[0];
        return (
            // Pass in the data fetched in getStaticProps as prefetchedData
            <PlasmicRootProvider loader={Plasmic} prefetchedData={plasmicData}>
                {
                    // plasmicData.entryCompMetas[0].name contains the name
                    // of the component you fetched.
                }
                <PlasmicComponent component={pageMeta.name} />
            </PlasmicRootProvider>
        );
    };

    export default withStaticUrqlClient(CatchallPage);
    ```

1. add `pages/plasmic-host.tsx` to preview the pages on plasmic studio

    ```tsx
    import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
    import { Plasmic } from 'lib/plasmic/plasmic';
    import withStaticUrqlClient from 'lib/urql/withStaticUrqlClient';
    import Script from 'next/script';

    const PlasmicHost = () => {
        return (
            Plasmic && (
                <div>
                    <Script
                        src="https://static1.plasmic.app/preamble.js"
                        strategy="beforeInteractive"
                    />
                    <PlasmicCanvasHost />
                </div>
            )
        );
    };

    export default withStaticUrqlClient(PlasmicHost);
    ```

1. configure plasmic studio project settings to preview the project using `http://localhost:3000/plasmic-host`

### Use plasmic to [code generate](https://docs.plasmic.app/learn/codegen-guide/) components

1. install plasmic dependencies

    ```sh
    pnpm i -g @plasmicapp/cli
    pnpm i @plasmicapp/react-web
    ```

1. authenticate plasmic cli

    ```sh
    plasmic auth
    ```

1. create a project on plasmic studio if not yet done

1. note the project id in the url, i.e. `fyLUsDXMW8eJuJ9WwfAaag` in `https://studio.plasmic.app/projects/fyLUsDXMW8eJuJ9WwfAaag,`

1. sync plasmic studio project down as react components

    ```sh
    plasmic sync -p <project-id>
    ```

1. continue designing and using the generated pages and components in `pages/` and `components/` folder using the default setup
