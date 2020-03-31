import React from 'react';
import { Schema } from 'yup';
import { useUpdateEffect } from 'react-use';
import {
  useFormik as useFormikBase,
  FormikValues,
  FormikConfig as FormikConfigBase,
  FormikProvider,
  FormikContextType,
  Form as FormBase,
} from 'formik';

export * from 'formik';

export * from './Form.styles';

export interface FormikConfig<TValues extends FormikValues = FormikValues, TContext extends {} = any>
  extends FormikConfigBase<TValues> {
  validationContext?: TContext;
  validationSchema?: Schema<TValues>;
  validateOnValidationChange?: boolean;
}

export function useFormik<TValues extends FormikValues = FormikValues, TContext extends {} = any>(
  args: FormikConfig<TValues, TContext>
) {
  const {
    validate,
    validationSchema: $$validationSchema,
    validationContext,
    validateOnValidationChange = true,
    ...rest
  } = args;

  const validationSchema = React.useMemo(() => {
    if (!!$$validationSchema && !!validationContext) {
      return new Proxy($$validationSchema, {
        get: (object, property) => {
          if (property === 'validate') {
            const fn: Schema<any>['validate'] = (value, options) => {
              return $$validationSchema.validate(value, { ...options, context: validationContext });
            };

            return fn;
          }

          if (property === 'validateSync') {
            const fn: Schema<any>['validateSync'] = (value, options) => {
              return $$validationSchema.validateSync(value, { ...options, context: validationContext });
            };

            return fn;
          }

          if (property === 'validateAt') {
            const fn: Schema<any>['validateAt'] = (path, value, options) => {
              return $$validationSchema.validateAt(path, value, { ...options, context: validationContext });
            };

            return fn;
          }

          return (object as any)[property];
        },
      }) as Schema<any>;
    }

    return $$validationSchema;
  }, [validationContext, $$validationSchema]);

  const formik = useFormikBase({ ...rest, validate, validationSchema });
  useUpdateEffect(() => {
    if (!!validateOnValidationChange) {
      formik.validateForm();
    }
  }, [validate, validationSchema, validateOnValidationChange]);

  return formik;
}

export interface FormProps {
  formik: FormikContextType<any>;
}

export const Form: React.FC<React.PropsWithChildren<FormProps>> = props => {
  return (
    <FormikProvider value={props.formik}>
      <FormBase>{props.children}</FormBase>
    </FormikProvider>
  );
};
