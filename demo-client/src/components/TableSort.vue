<script setup lang="ts">
import { SORT_BY_CURRENCY, SORT_BY_QUOTE } from '@/common'

interface TableSortProps {
  label: string
}

defineProps<TableSortProps>()
const selected = defineModel()
</script>

<template>
  <label>
    {{ label }}
    <select
      class="font-sans px-5 py-2 font-medium bg-white/10 text-white border border-transparent placeholder:text-white/60 hover:border-white/40 focus:outline-none focus:bg-white/20 rounded-full transition-colors duration-300"
      v-model="selected"
    >
      <option disabled value="">
        Please select one
      </option>
      <option>
        {{ SORT_BY_CURRENCY }}
      </option>
      <option>
        {{ SORT_BY_QUOTE }}
      </option>
    </select>
  </label>
</template>

<style scoped></style>
