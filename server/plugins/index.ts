import type { AWS } from '@serverless/typescript';
import esbuild from './esbuild';
import offline from './offline';
import dotenv from './dotenv';

const plugins = [
  dotenv,
  esbuild,
  offline,
];

// Check ./plugins for plugin order
export const attachPlugins = (config: AWS): AWS => {
  config.plugins = plugins.map((p) => p.name);
  config.custom = {
    ...config.custom,
    ...plugins.reduce((acc, current) => ({ ...acc, ...current.config }), {})
  };

  const existingStatements = config.provider.iamRoleStatements || [];
  const pluginIamStatements = plugins.reduce(
    (acc, current) => acc.concat(current.iamRoleStatements as any),
    []
  );
  config.provider.iamRoleStatements =
    existingStatements.concat(pluginIamStatements);

  return config;
};
