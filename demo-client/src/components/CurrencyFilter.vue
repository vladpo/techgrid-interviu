<script setup lang="ts">

import { Currency } from 'demo-common'

const selected = defineModel()

</script>

<template>
  <label>
    Currency
    <select
      class='bg-gradient-to-br from-gray-700 via-gray-900 to-black transition-all text-white'
      v-model='selected'
    >
      <option disabled value="">Please select one</option>
      <option :value='Currency.USD'>USD</option>
      <option :value='Currency.EUR'>EUR</option>
      <option :value='Currency.GBP'>GBP</option>
    </select>
  </label>
</template>

<style scoped>

</style>