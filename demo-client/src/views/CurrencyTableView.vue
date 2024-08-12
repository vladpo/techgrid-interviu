<script setup lang="ts">
import useWebSocket from '../websocket'
import { Currency, CurrencyQuote } from 'demo-common'
import { computed, ref } from 'vue'
import { Tuple } from 'purify-ts'
import CurrencyFilter from '@/components/CurrencyFilter.vue'
import TableSort from '@/components/TableSort.vue'
import { all } from 'axios'
import { SORT_BY_CURRENCY, SORT_BY_QUOTE } from '@/common'

const { on } = useWebSocket()

const allEntries = ref<CurrencyQuote[]>([])

on('currency:quotes', (cqs: CurrencyQuote[]) => {
  cqs.forEach(cq => allEntries.value.push(cq))
})

function calcAvg(entries: CurrencyQuote[], currency: Currency) {
  return entries.reduce((t, e) => {
      if (e.currency === currency) {
        return Tuple(t.fst() + e.quote, t.snd() + 1)
      }
      return t
    }, Tuple(0, 0)
  )
}

function calcMedian(entries: CurrencyQuote[], currency: Currency): number {
  let values = entries.filter(e => e.currency === currency)
  if (values.length === 0) {
    return 0
  }
  values = [...values].sort((a, b) => a.quote - b.quote)
  const half = Math.floor(values.length / 2)
  return (values.length % 2 ? values[half].quote : (values[half - 1].quote + values[half].quote) / 2
  )
}

const usdAvg = computed(() => {
  const t = calcAvg(allEntries.value, Currency.USD)
  return t.fst() / t.snd()
})
const eurAvg = computed(() => {
  const t = calcAvg(allEntries.value, Currency.EUR)
  return t.fst() / t.snd()
})
const gbpAvg = computed(() => {
  const t = calcAvg(allEntries.value, Currency.GBP)
  return t.fst() / t.snd()
})

const usdMedian = computed(() => {
  return calcMedian(allEntries.value, Currency.USD)
})
const eurMedian = computed(() => {
  return calcMedian(allEntries.value, Currency.EUR)
})
const gbpMedian = computed(() => {
  return calcMedian(allEntries.value, Currency.GBP)
})

const selectedSortBy = ref()
const selectedCurrency = ref<Currency>()
const entries = computed(() => {
  let entries = allEntries.value
  if (selectedCurrency.value) {
    entries = allEntries.value.filter(e => e.currency === selectedCurrency.value)
  }
  if (selectedSortBy.value && selectedSortBy.value == SORT_BY_QUOTE) {
    entries = allEntries.value.slice().sort((a, b) => a.quote - b.quote)
  }

  if (selectedSortBy.value && selectedSortBy.value == SORT_BY_CURRENCY) {
    entries = allEntries.value.slice().sort((a, b) => a.currency.localeCompare(b.currency))
  }
  return entries;
})

</script>

<template>
  <div
    class="font-sans px-5 py-2 font-medium border border-transparent transition-colors duration-300"
  >
    <div>
      <span> USD Avg: {{ usdAvg }} Median: {{ usdMedian }}</span>
      <span> USD Avg: {{ eurAvg }} Median: {{ eurMedian }}</span>
      <span> USD Avg: {{ gbpAvg }} Median: {{ gbpMedian }}</span>
    </div>
    <CurrencyFilter
      v-model='selectedCurrency'
    />
    <TableSort
      label='Sort by'
      v-model='selectedSortBy'
    />
    <table class="w-full border-spacing-0 border-separate">
      <thead class="font-bold bg-white/10 text-white/70 transition-colors duration-300">
      <tr>
        <td>Currency</td>
        <td>Quote</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(entry, index) in entries" :key="index">
        <td>{{ entry.currency }}</td>
        <td>{{ entry.quote }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>