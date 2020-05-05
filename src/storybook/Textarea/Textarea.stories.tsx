import React from 'react';
import { Textarea } from './Textarea';

export default { title: 'Atoms|TextArea' };

export const Default = () => <Textarea name="default" />;

export const Disabled = () => <Textarea disabled={true} name="disabled" />;

export const Placeholder = () => <Textarea name="placeholder" placeholder="placeholder" />;
