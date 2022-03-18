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
