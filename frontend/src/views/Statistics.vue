<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { statisticsApi } from '../api'
import type { Statistics } from '../types'

const active = ref(3)
const loading = ref(false)
const statistics = ref<Statistics>({
  totalIncome: 0,
  monthlyIncome: 0,
  totalHouses: 0,
  occupancyRate: 0,
  pendingPayments: 0,
  monthlyTrend: []
})

const loadData = async () => {
  loading.value = true
  try {
    const response = await statisticsApi.getStatistics()
    statistics.value = response.data
  } catch (error) {
    showToast('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script> 