<template>
  <div class="house-detail">
    <van-nav-bar
      title="房源详情"
      left-arrow
      @click-left="handleBack"
    >
      <template #right>
        <van-button 
          type="primary" 
          size="small" 
          plain 
          @click="handleEdit"
        >编辑</van-button>
      </template>
    </van-nav-bar>

    <div class="detail-content">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h2>{{ house.title }}</h2>
          <van-tag :type="house.status === 'available' ? 'success' : 'warning'" round>
            {{ house.status === 'available' ? '可租' : '已租' }}
          </van-tag>
        </div>
        <div class="address">
          <van-icon name="location-o" />
          <span>{{ house.address }}</span>
        </div>
        
        <div class="key-stats">
          <div class="stat-item">
            <div class="value">¥{{ formatNumber(house.baseRent) }}</div>
            <div class="label">月租金</div>
          </div>
          <div class="stat-item">
            <div class="value">{{ house.area }}㎡</div>
            <div class="label">面积</div>
          </div>
          <div class="stat-item">
            <div class="value">¥{{ house.waterRate }}</div>
            <div class="label">水费/吨</div>
          </div>
          <div class="stat-item">
            <div class="value">¥{{ house.electricityRate }}</div>
            <div class="label">电费/度</div>
          </div>
        </div>
      </div>

      <!-- 租客信息卡片 -->
      <div class="info-card" v-if="currentTenant">
        <div class="card-header">
          <h3>当前租客</h3>
        </div>
        <div class="tenant-info">
          <van-cell-group inset>
            <van-cell title="姓名" :value="currentTenant.name" />
            <van-cell title="联系电话" :value="currentTenant.phone" />
            <van-cell title="入住时间" :value="formatDate(currentTenant.checkInDate)" />
          </van-cell-group>
        </div>
      </div>

      <!-- 收费记录卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h3>收费记录</h3>
          <van-button type="primary" size="small" plain @click="showAddPayment = true">
            添加记录
          </van-button>
        </div>
        <div class="payment-list">
          <van-empty v-if="!payments.length" description="暂无收费记录" />
          <template v-else>
            <div class="payment-item" v-for="payment in payments" :key="payment.id">
              <div class="payment-info">
                <div class="payment-type">{{ payment.type }}</div>
                <div class="payment-date">{{ formatDate(payment.date) }}</div>
              </div>
              <div class="payment-amount">¥{{ formatNumber(payment.amount) }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 添加收费记录弹窗 -->
    <van-dialog
      v-model:show="showAddPayment"
      title="添加收费记录"
      show-cancel-button
      @confirm="handleAddPayment"
      class="custom-dialog"
    >
      <van-form @submit="handleAddPayment">
        <van-cell-group inset>
          <van-field
            v-model="paymentForm.type"
            name="type"
            label="费用类型"
            placeholder="请选择费用类型"
            readonly
            is-link
            @click="showTypeSelector = true"
          />
          <van-field
            v-model.number="paymentForm.amount"
            name="amount"
            label="金额"
            type="digit"
            placeholder="请输入金额"
          >
            <template #right-icon>
              <span class="field-unit">元</span>
            </template>
          </van-field>
          <van-field
            v-model="paymentForm.date"
            name="date"
            label="日期"
            type="date"
          />
          <van-field
            v-model="paymentForm.remark"
            name="remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注"
            rows="2"
          />
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 费用类型选择器 -->
    <van-popup v-model:show="showTypeSelector" position="bottom" round>
      <van-picker
        title="选择费用类型"
        :columns="['租金', '水费', '电费', '其他']"
        @confirm="onTypeSelect"
        @cancel="showTypeSelector = false"
        show-toolbar
      />
    </van-popup>
  </div>
</template>

<style scoped>
.house-detail {
  min-height: 100vh;
  background: var(--background-color);
}

.detail-content {
  padding: 16px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(100, 100, 100, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.address {
  display: flex;
  align-items: center;
  color: var(--text-color-secondary);
  font-size: 14px;
  margin: 12px 0;
}

.address .van-icon {
  margin-right: 6px;
  font-size: 16px;
}

.key-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  text-align: center;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-item .label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.payment-list {
  margin-top: 12px;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-type {
  font-size: 15px;
  color: var(--text-color);
}

.payment-date {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.payment-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

:deep(.van-tag--round) {
  height: 22px;
  line-height: 20px;
  padding: 0 10px;
  font-size: 12px;
}

:deep(.van-cell-group--inset) {
  margin: 0;
}

.field-unit {
  color: var(--text-color-secondary);
  font-size: 14px;
}

/* 添加进入动画 */
.detail-content {
  animation: fade-slide-in 0.3s ease-out;
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { houseApi, paymentApi } from '../api'
import type { House, Payment, Tenant } from '../types'

const router = useRouter()
const route = useRoute()
const house = ref<House>({} as House)
const currentTenant = ref<Tenant | null>(null)
const payments = ref<Payment[]>([])
const showAddPayment = ref(false)
const showTypeSelector = ref(false)

const paymentForm = reactive({
  type: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  remark: ''
})

const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  // 实现编辑逻辑
}

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const onTypeSelect = (value: string) => {
  paymentForm.type = value
  showTypeSelector.value = false
}

const handleAddPayment = async () => {
  try {
    await paymentApi.createPayment({
      ...paymentForm,
      houseId: house.value.id
    })
    showToast('添加成功')
    showAddPayment.value = false
    loadPayments()
  } catch (error) {
    showToast('添加失败')
  }
}

const loadHouseDetail = async () => {
  try {
    const response = await houseApi.getHouse(Number(route.params.id))
    house.value = response.data
  } catch (error) {
    showToast('加载房源详情失败')
  }
}

const loadPayments = async () => {
  try {
    const response = await paymentApi.getPayments(Number(route.params.id))
    payments.value = response.data
  } catch (error) {
    showToast('加载收费记录失败')
  }
}

onMounted(() => {
  loadHouseDetail()
  loadPayments()
})
</script> 