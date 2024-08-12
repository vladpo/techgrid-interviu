<script setup lang="ts">
import useSession from '../session'
import { computed } from 'vue'
import { Maybe } from 'purify-ts/Maybe'

const { session } = useSession()
const fullName = computed(() => {
  return Maybe.fromNullable(session)
    .chainNullable((s) => s.value.user)
    .map((u) => `${u.firstName} ${u.lastName}`)
    .orDefault('')
})
</script>

<template>Welcome {{ fullName }}</template>
