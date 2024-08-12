<script setup lang="ts">
import { PointOptionsObject, SeriesOptionsRegistry } from 'highcharts'
import { Chart } from 'highcharts-vue'
import { computed, ref } from 'vue'
import useWebSocket from '@/websocket'
import { Currency, CurrencyQuote } from 'demo-common'

const usdData: Array<PointOptionsObject> = []
const eurData: Array<PointOptionsObject> = []
const gbpData: Array<PointOptionsObject> = []

const series = ref<Array<SeriesOptionsRegistry['SeriesLineOptions']>>([
  { data: usdData, type: 'line', name: 'USD' },
  { data: eurData, type: 'line', name: 'EUR' },
  { data: gbpData, type: 'line', name: 'GBP' }
])

const { on } = useWebSocket()
on('currency:quotes', (cqs: CurrencyQuote[]) => {
  cqs.forEach(cq => {
    const now = Date.now()
    const dataItem: PointOptionsObject = { x: now, y: cq.quote }
    if (cq.currency === Currency.USD) {
      series.value[0].data?.push(dataItem)
    } else if (cq.currency === Currency.EUR) {
      series.value[1].data?.push(dataItem)
    } else if (cq.currency === Currency.GBP) {
      series.value[2].data?.push(dataItem)
    }
  })
})

const chartOptions = computed<Highcharts.Options>(() => ({
  title: { text: 'Currency Quotes' },
  xAxis: {
    type: 'datetime'
  },
  yAxis: {
    title: {
      text: ''
    }
  },
  chart: {
    animation: {
      duration: 1000
    }
  },
  series: series.value,
  accessibility: {
    enabled: false
  }
}))

</script>

<template>
  <Chart class="hc" :options="chartOptions" />
</template>

<style scoped>

</style>