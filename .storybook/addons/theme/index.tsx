import React from 'react';
import { makeDecorator } from '@storybook/addons';
import { useAddonState } from '@storybook/client-api';
import { ThemeProvider } from '~/components/Theme';

export default makeDecorator({
  name: 'withTheme',
  parameterName: 'theme',
  wrapper: (getStory, context) => {
    const [dark] = useAddonState('theme', false);
    return <ThemeProvider dark={dark}>{getStory(context)}</ThemeProvider>;
  },
});
