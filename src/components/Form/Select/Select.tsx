import React from 'react';
import {
  default as SelectBase,
  Props as SelectPropsBase,
  OptionProps,
  OptionsType,
  ActionMeta,
  ValueType,
  components,
  MultiValueProps,
  SingleValueProps,
} from 'react-select';
import { useField, Wrapper, Label, Error } from '~/components/Form/Form';
import { Icons, IconName } from '~/storybook/Icons/Icons';
import * as S from './Select.styles';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  [key: string]: any;
}

export interface SelectProps<TOption extends SelectOption = SelectOption> extends SelectPropsBase<TOption> {
  options: OptionsType<TOption>;
  name: string;
  label?: string;
  Component?: React.ElementType<SelectPropsBase<TOption>>;
}

export const Select: React.FC<SelectProps> = props => {
  const [field, meta, { setValue }] = useField({ type: 'select', name: props.name });
  const value = React.useMemo(() => {
    if (props.isMulti) {
      return props.options?.filter(option => field.value?.includes(option.value));
    }

    return props.options?.find((option: SelectOption) => option.value === field.value);
  }, [field.value, props.options, props.isMulti]);

  const onChange = React.useCallback(
    (option: ValueType<SelectOption>, action: ActionMeta) => {
      const selection = props.isMulti
        ? ((option as any) as SelectOption[]).map(item => item.value)
        : ((option as any) as SelectOption).value;

      setValue(selection);

      if (typeof props.onChange === 'function') {
        props.onChange(option, action);
      }
    },
    [setValue, props.isMulti, props.onChange]
  );

  return <SelectWidget {...meta} {...field} {...props} value={value} onChange={onChange} />;
};

export const SelectWidget: React.FC<SelectProps> = ({ label, ...props }) => {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <SelectField {...props} />
      {props.error && <Error>{props.error}</Error>}
    </Wrapper>
  );
};

export const SelectField: React.FC<SelectProps> = ({ Component = SelectBase, ...props }) => {
  const hasDescriptions = React.useMemo(() => {
    return props.options.some((option: any) => !!option.description);
  }, [props.options]);

  const hasIcons = React.useMemo(() => {
    return props.options.some((option: any) => !!option.icon);
  }, [props.options]);

  return (
    <Component
      {...props}
      components={{ Option, SingleValue, MultiValue, ...props.components }}
      hasDescriptions={hasDescriptions}
      hasIcons={hasIcons}
    />
  );
};

export interface SelectLabelProps {
  label: string;
  icon?: string;
}

export const SelectLabel: React.FC<SelectLabelProps> = props => (
  <S.SelectWrapper>
    {props.icon ? (
      <S.SelectIcon>
        <Icons name={props.icon as IconName} size="small" />
      </S.SelectIcon>
    ) : null}
    <S.SelectLabel>{props.label}</S.SelectLabel>
  </S.SelectWrapper>
);

const Option: React.FC<OptionProps<SelectOption>> = props => {
  const hasDescriptions = !!props.selectProps.hasDescriptions;

  return (
    <components.Option {...props}>
      <S.SelectWrapper>
        {props.data.icon ? (
          <S.SelectIcon>
            <Icons name={props.data.icon as IconName} size={hasDescriptions ? 'normal' : 'small'} />
          </S.SelectIcon>
        ) : null}

        {props.data.description ? (
          <S.SelecLabelWrapper>
            <S.SelectLabel>{props.data.label}</S.SelectLabel>
            <S.SelectDescription>{props.data.description}</S.SelectDescription>
          </S.SelecLabelWrapper>
        ) : (
          <S.SelectLabel>{props.data.label}</S.SelectLabel>
        )}
      </S.SelectWrapper>
    </components.Option>
  );
};

const SingleValue: React.FC<SingleValueProps<SelectOption>> = props => (
  <components.SingleValue {...props}>
    <SelectLabel {...props.data} />
  </components.SingleValue>
);

const MultiValue: React.FC<MultiValueProps<SelectOption>> = props => (
  <components.MultiValue {...props}>
    <SelectLabel {...props.data} />
  </components.MultiValue>
);
