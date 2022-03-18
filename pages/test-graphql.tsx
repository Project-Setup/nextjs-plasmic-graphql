import type { GetStaticProps, NextPage } from 'next';
import styles from 'styles/Home.module.css';
import { initUrqlClient, SSRData } from 'next-urql';
import { ssrExchange, useQuery } from 'urql';
import getUrqlClientOptions from 'lib/urql/getUrqlClientOptions';
import {
  GetPostByIdDocument,
  GetPostByIdQuery,
  GetPostByIdQueryVariables,
} from 'graphql/generated';
import withStaticUrqlClient from 'lib/urql/withStaticUrqlClient';
export interface PageProps {
  urqlState?: SSRData;
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const ssrCache = ssrExchange({ isClient: false });
  const urqlClientOption = getUrqlClientOptions(ssrCache);
  const client = initUrqlClient(urqlClientOption, false);

  await client
    ?.query<GetPostByIdQuery, GetPostByIdQueryVariables>(GetPostByIdDocument, {
      id: '1',
    })
    .toPromise();

  return {
    props: {
      urqlState: ssrCache.extractData(),
    },
    revalidate: 600,
  };
};

const TestGraphql: NextPage<PageProps> = (props) => {
  const [result] = useQuery<GetPostByIdQuery, GetPostByIdQueryVariables>({
    query: GetPostByIdDocument,
    variables: {
      id: '1',
    },
  });
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Graphql Tester</h1>
      <div className={styles.grid}>
        <div className="graphql-container">
          <button className={styles.card} type="button">
            try fetch
          </button>
          <div className="grapql-result">
            <p className={styles.code}>{JSON.stringify(result.data)}</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .graphql-testing-container {
          display: flex;
          flex-flow: row nowrap;
          justify-content: space-between;
          align-items: flex-start;
        }
        .graphql-testing-container > div {
          width: 100%;
          border-color: black;
        }
        button.${styles.card} {
          cursor: pointer;
          background: transparent;
        }
        button.${styles.card}:active {
          border-color: lightblue;
          color: lightblue;
        }
      `}</style>
    </div>
  );
};

export default withStaticUrqlClient(TestGraphql);
