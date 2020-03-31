import React from 'react';
import * as Yup from 'yup';
import { Input } from '~/components/Form/Input/Input';
import { Textarea } from '~/components/Form/Textarea/Textarea';
import { Button } from '~/components/Form/Button/Button';
import { Checkbox } from '~/components/Form/Checkbox/Checkbox';
import { CheckboxGroup } from '~/components/Form/CheckboxGroup/CheckboxGroup';
import { useFormik, Form } from './Form';
import { Select } from './Select/Select';

export default { title: 'Forms|Form' };

const options = [
  {
    value: 'value1',
    label: 'label1',
  },
  {
    value: 'value2',
    label: 'label2',
  },
  {
    value: 'value3',
    label: 'label3',
  },
];

const selectOptions = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

const validationSchema = Yup.object({
  input: Yup.string()
    .max(15, 'Must be 15 characters or less')
    .required('Required'),
  noLabel: Yup.string()
    .max(15, 'Must be 15 characters or less')
    .required('Required'),
  textarea: Yup.string()
    .max(20, 'Must be 20 characters or less')
    .required('Required'),
  checkboxes: Yup.array()
    .min(1)
    .max(2)
    .required(),
});

const initialValues = {
  input: 'Hello',
  noLabel: 'No Label',
  textarea: 'Foo',
  checkbox: false,
  checkboxes: [],
};

export const Basic = () => {
  const formik = useFormik({
    validationSchema,
    initialValues,
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <Form formik={formik}>
      <Input name="input" label="Input" />
      <Input name="noLabel" />
      <Textarea name="textarea" label="Textarea" />
      <Checkbox name="checkbox" label="Checkbox" />
      <CheckboxGroup name="checkboxes" label="Checkbox group" options={options} />
      <Select name="select" options={selectOptions} label="Select" />
      <Select name="selectMultiple" options={selectOptions} label="Select multiple" isMulti={true} />
      <Button type="submit">Submit</Button>
    </Form>
  );
};
