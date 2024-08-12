<script setup lang="ts">

import { SORT_BY_CURRENCY, SORT_BY_QUOTE } from '@/common'

interface TableSortProps {
  label: string,
}

defineProps<TableSortProps>()
const selected = defineModel()

</script>

<template>
  <label>
    {{label}}
    <select
      class='bg-gradient-to-br from-gray-700 via-gray-900 to-black transition-all text-white'
      v-model='selected'
    >
      <option disabled value="">Please select one</option>
      <option>{{SORT_BY_CURRENCY}}</option>
      <option>{{SORT_BY_QUOTE}}</option>
    </select>
  </label>
</template>

<style scoped>

</style>