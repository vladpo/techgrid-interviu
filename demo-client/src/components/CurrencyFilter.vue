<script setup lang="ts">
import { Currency } from 'demo-common'

const selected = defineModel()
</script>

<template>
  <label>
    Currency
    <select
      class="font-sans px-5 py-2 font-medium bg-white/10 text-white border border-transparent placeholder:text-white/60 hover:border-white/40 focus:outline-none focus:bg-white/20 rounded-full transition-colors duration-300"
      v-model="selected"
    >
      <option disabled value="">Please select one</option>
      <option :value="Currency.USD">USD</option>
      <option :value="Currency.EUR">EUR</option>
      <option :value="Currency.GBP">GBP</option>
    </select>
  </label>
</template>

<style scoped></style>
