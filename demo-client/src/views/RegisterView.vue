<script setup lang="ts">
import router, { PATH_LOGIN } from '@/router'
import restApi from '@/httpclient'
import FormContainer from '@/components/form/FormContainer.vue'
import type { FormInput } from '@/components/form'
import { type PublicUser } from 'demo-common'

const formInputs: FormInput<PublicUser & { password: string }>[] = [
  { field: 'firstName', type: 'text' },
  { field: 'lastName', type: 'text' },
  { field: 'email', type: 'email' },
  { field: 'password', type: 'password' }
]

const onSubmit = (user: PublicUser, onError: (errMsg: string) => void) => {
  restApi.tryRegister(user, (e) => {
    e.ifRight(() => router.push(PATH_LOGIN)).ifLeft((err) => onError(err.message))
  })
}
</script>

<template lang="html">
  <FormContainer :on-submit="onSubmit" :form-inputs="formInputs" submit-label="Register" />
</template>

<style scoped></style>
