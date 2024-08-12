<script setup lang="ts">
import { HttpError } from '@/httpclient'
import useSession, { type Credentials } from '../session'
import FormContainer from '@/components/form/FormContainer.vue'
import type { FormInput } from '@/components/form'

const formInputs: FormInput<Credentials>[] = [
  { field: 'email', type: 'text' },
  { field: 'password', type: 'password' }
]

const { login } = useSession()
const onSubmit = (c: Credentials, onError: (err: string) => void) =>
  login(c, (err: HttpError) => onError(err.message))
</script>

<template lang="html">
  <FormContainer :form-inputs="formInputs" :on-submit="onSubmit" submit-label="Login" />
</template>

<style scoped></style>
