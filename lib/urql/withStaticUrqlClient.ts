import { withUrqlClient } from 'next-urql';
import getUrqlClientOptions from './getUrqlClientOptions';

const withStaticUrqlClient = withUrqlClient(getUrqlClientOptions, {
  neverSuspend: true, // don't use Suspense on server side
  ssr: false, // don't generate getInitialProps for the page
  staleWhileRevalidate: true, // tell client to do network-only data fetching again if the cached data is outdated
});

export default withStaticUrqlClient;
