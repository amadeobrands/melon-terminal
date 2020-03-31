import React, { ChangeEvent } from 'react';
import { FieldArray, useField, getIn, Wrapper, Label, Error } from '~/components/Form/Form';
import { CheckboxItem } from '~/components/Form/Checkbox/Checkbox';

export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  name: string;
  label?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = props => {
  const [field, meta] = useField({ type: 'checkbox', ...props });

  return (
    <Wrapper>
      {props.label && <Label>{props.label}</Label>}

      <FieldArray name={field.name}>
        {array => {
          const handle = (event: ChangeEvent<HTMLInputElement>) => {
            if (field.value.includes(event.target.value)) {
              array.remove(field.value.indexOf(event.target.value));
            } else {
              array.push(event.target.value);
            }
          };

          const mapping = Array.isArray(field.value)
            ? field.value.reduce<{ [key: number]: number }>((carry, current, index) => {
                const key = props.options.findIndex(inner => inner.value === current);
                return key !== -1 ? { ...carry, [key]: index } : carry;
              }, {})
            : ({} as { [key: number]: number });

          return props.options.map((item, index) => {
            const key = `${item.label}:${item.value}`;
            const name = `${array.name}.${index}`;

            const checked = field.value.includes(item.value);
            const error =
              Array.isArray(array.form.errors[array.name]) && mapping[index] != null
                ? getIn(array.form.errors[array.name], `${mapping[index]}`)
                : undefined;

            const touched =
              Array.isArray(array.form.touched[array.name]) && mapping[index] != null
                ? getIn(array.form.touched[array.name], `${mapping[index]}`)
                : undefined;

            const initialTouched =
              Array.isArray(array.form.initialTouched[array.name]) && mapping[index] != null
                ? getIn(array.form.initialTouched[array.name], `${mapping[index]}`)
                : undefined;

            return (
              <CheckboxItem
                key={key}
                name={name}
                checked={checked}
                error={error}
                touched={touched}
                initialTouched={initialTouched}
                onChange={handle}
                {...item}
              />
            );
          });
        }}
      </FieldArray>

      {meta.error && typeof meta.error === 'string' && <Error>{meta.error}</Error>}
    </Wrapper>
  );
};
