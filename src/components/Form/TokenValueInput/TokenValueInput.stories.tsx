import React from 'react';
import { text } from '@storybook/addon-knobs';
import { withForm } from '~/components/Form/Form.decorator';
import { TokenValueInput } from './TokenValueInput';
import { tokens } from './TokenValue';

export default {
  title: 'Forms|TokenValueInput',
  decorators: [withForm()],
};

export const Default = () => <TokenValueInput name="input" label={text('label', "I'm a label")} tokens={tokens} />;
