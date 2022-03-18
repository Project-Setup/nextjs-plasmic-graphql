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
