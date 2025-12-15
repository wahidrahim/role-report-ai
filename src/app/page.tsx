import { isFeatureEnabled } from '@/core/featureFlags';

import Dashboard from './Dashboard';

export default function Home() {
  const isDeepResearchEnabled = isFeatureEnabled('deepResearch');

  return <Dashboard isDeepResearchEnabled={isDeepResearchEnabled} />;
}
