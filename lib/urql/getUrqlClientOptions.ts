import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { NextUrqlClientConfig } from 'next-urql';
import { debugExchange, dedupExchange, fetchExchange } from 'urql';
import getIsClient from 'lib/utils/getIsClient';
import getIsProduction from 'lib/utils/getIsProduction';

const getUrqlClientOptions: NextUrqlClientConfig = (ssrCache) => {
  const isClient = getIsClient();
  const isProd = getIsProduction();
  return {
    url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
    exchanges: [
      ...(isClient && !isProd ? [devtoolsExchange, debugExchange] : []),
      dedupExchange,
      cacheExchange({}),
      ssrCache, // ssrExchange has to come before fetchExchange
      fetchExchange,
    ],
  };
};

export default getUrqlClientOptions;
