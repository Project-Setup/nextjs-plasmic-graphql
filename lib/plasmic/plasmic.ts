import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';
import getIsProduction from 'lib/utils/getIsProduction';

export const Plasmic = initPlasmicLoader({
  projects: [
    {
      id: process.env.PLASMIC_ID || '',
      token: process.env.PLASMIC_TOKEN || '',
    },
  ],
  preview: !getIsProduction(),
});
