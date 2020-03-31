import React from 'react';
import addons, { types } from '@storybook/addons';
import { useAddonState } from '@storybook/api';
import { Separator, IconButton } from '@storybook/components';

const SvgSun = props => (
  <svg viewBox="0 0 512 512" {...props} width={12}>
    <path d="M256 96c-88.224 0-160 71.776-160 160s71.776 160 160 160 160-71.776 160-160S344.224 96 256 96zm0 288c-70.576 0-128-57.424-128-128s57.424-128 128-128 128 57.424 128 128-57.424 128-128 128zM240 0h32v64h-32zM240 448h32v64h-32zM448 240h64v32h-64zM0 240h64v32H0zM372.69 100.685l48.002-48.003 22.628 22.627-48.003 48.003zM68.692 75.316L91.32 52.688l48.003 48.003-22.627 22.628zM68.692 436.68l48.003-48.002 22.627 22.627-48.002 48.003zM372.672 411.32l22.628-22.628 48.003 48.003-22.628 22.627z" />
  </svg>
);

const SvgMoon = props => (
  <svg viewBox="-12 0 448 448.045" {...props} width={12}>
    <path d="M224.023 448.031c85.715.903 164.012-48.488 200.118-126.23a171.044 171.044 0 01-72.118 14.23c-97.156-.11-175.89-78.844-176-176 .973-65.719 37.235-125.832 94.91-157.351A334.474 334.474 0 00224.024.03c-123.714 0-224 100.29-224 224 0 123.715 100.286 224 224 224zm0 0" />
  </svg>
);

const Theme = () => {
  const [dark, setDark] = useAddonState('theme', false);
  const onClick = React.useCallback(() => setDark(!dark), [dark, setDark]);
  const Icon = dark ? SvgMoon : SvgSun;

  return (
    <>
      <Separator />
      <IconButton onClick={onClick}>
        <Icon />
      </IconButton>
    </>
  );
};

addons.register('theme', () => {
  addons.add('theme', {
    title: 'Theme',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <Theme />,
  });
});
