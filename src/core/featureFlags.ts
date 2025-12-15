import 'server-only';

function readBooleanEnv(name: string, defaultValue = false): boolean {
  const raw = process.env[name];

  if (raw == null) return defaultValue;
  if (raw === 'true') return true;
  if (raw === 'false') return false;

  return defaultValue;
}

export function getFeatureFlags() {
  return {
    deepResearch: readBooleanEnv('FEATURE_DEEP_RESEARCH', false),
  };
}

export type FeatureFlagName = keyof ReturnType<typeof getFeatureFlags>;

export function isFeatureEnabled(name: FeatureFlagName) {
  return getFeatureFlags()[name];
}
