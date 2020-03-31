import withRouter from 'storybook-react-router';
import { addDecorator, addParameters } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import withTheme from './addons/theme';

addDecorator(withRouter() as any);
addDecorator(withTheme());
addDecorator(
  withKnobs({
    escapeHTML: false,
  })
);

addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS,
    defaultViewport: 'someDefault',
  },
});
