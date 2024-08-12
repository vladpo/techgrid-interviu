import type { Path } from 'vee-validate'

export interface FormInput<T> {
  field: Path<T>
  type: string
}

export interface FormContainerProps<T> {
  formInputs: FormInput<T>[]
  onSubmit: (t: T, onError: (errMsg: string) => void) => void
  submitLabel: string
  direction?: 'row' | 'col'
}
