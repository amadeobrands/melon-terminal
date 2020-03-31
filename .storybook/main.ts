// @ts-ignore
const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    {
      name: '@storybook/preset-create-react-app',
      options: {
        scriptsPackageName: 'react-scripts',
      },
    },
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
      },
    },
    '@storybook/addon-knobs/register',
    '@storybook/addon-viewport',
    '@storybook/addon-actions',
    '@storybook/addon-storysource',
    './.storybook/addons/theme/register',
  ],
  webpackFinal: async (config: any) => {
    config.resolve.alias = Object.assign(config.resolve.alias || {}, {
      '~': path.resolve(process.cwd(), 'src'),
    });

    return config;
  },
};
