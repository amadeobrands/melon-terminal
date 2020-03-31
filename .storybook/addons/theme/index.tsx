import React from 'react';
import { makeDecorator } from '@storybook/addons';
import { useAddonState } from '@storybook/client-api';
import { ThemeProvider } from 'styled-components';
import { Reset } from 'styled-reset';
import { Global, lightTheme, darkTheme } from '~/theme';
import { ColorProvider } from '~/components/Contexts/Color/Color';

export default makeDecorator({
  name: 'withTheme',
  parameterName: 'theme',
  wrapper: (getStory, context, { parameters }) => {
    const [mode] = useAddonState('theme');
    let theme = mode ? darkTheme : lightTheme;

    if (parameters?.customize && typeof parameters.customize === 'function') {
      theme = parameters.customize(theme);
    }

    return (
      <ThemeProvider theme={theme}>
        <Reset />
        <Global />
        <ColorProvider default={theme.otherColors.logo}>{getStory(context)}</ColorProvider>
      </ThemeProvider>
    );
  },
});
