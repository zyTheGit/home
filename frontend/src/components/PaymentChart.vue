<template>
  <v-chart class="chart" :option="mergedOptions" :theme="theme" autoresize />
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { computed } from 'vue'

use([CanvasRenderer, PieChart, LineChart, TitleComponent, TooltipComponent])

const props = defineProps({
  chartData: {
    type: Object as () => {
      categories: string[];
      values: number[];
    },
    required: true
  },
  options: {
    type: Object as () => EChartsOption,
    default: () => ({})
  },
  theme: {
    type: String,
    default: 'light'
  }
})

const mergedOptions = computed<EChartsOption>(() => ({
  title: {
    text: '缴费统计',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  dataset: {
    source: [
      ['category', 'amount'],
      ...props.chartData.categories.map((cat, index) => [cat, props.chartData.values[index]])
    ]
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [{ type: 'bar' }],
  ...props.options
}))

// 实现支付数据可视化
</script> 