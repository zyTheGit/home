<template>
  <div class="tenant-detail">
    <van-nav-bar
      title="租客详情"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
    />
    
    <div class="content">
      <!-- 租客基本信息 -->
      <van-cell-group inset title="基本信息">
        <van-cell title="姓名" :value="tenant.name" />
        <van-cell title="手机号" :value="tenant.phone" />
        <van-cell title="身份证号" :value="tenant.idCard" />
        <van-cell title="入住时间" :value="formatDate(tenant.startDate)" />
        <van-cell title="到期时间" :value="formatDate(tenant.endDate)" />
      </van-cell-group>

      <!-- 房屋信息 -->
      <van-cell-group inset title="房屋信息" v-if="tenant.house">
        <van-cell 
          title="房屋名称" 
          :value="tenant.house.title"
          is-link
          @click="goToHouse(tenant.house.id)"
        />
        <van-cell title="地址" :value="tenant.house.address" />
        <van-cell title="基础租金" :value="`¥${formatNumber(tenant.house.baseRent)}/月`" />
      </van-cell-group>

      <!-- 缴费记录 -->
      <van-cell-group inset title="缴费记录">
        <div class="payment-list">
          <template v-if="payments.length > 0">
            <van-cell
              v-for="payment in payments"
              :key="payment.id"
              :title="getPaymentTypeText(payment.type)"
              :label="formatDate(payment.date)"
            >
              <template #value>
                <span class="income">¥{{ formatNumber(payment.amount) }}</span>
              </template>
            </van-cell>
          </template>
          <van-empty v-else description="暂无缴费记录" />
        </div>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showNotify } from 'vant';
import { tenantApi, paymentApi } from '../api';
import type { Tenant, Payment } from '../types';

const router = useRouter();
const route = useRoute();
const tenant = ref<Tenant>({} as Tenant);
const payments = ref<Payment[]>([]);

const handleBack = () => {
  router.back();
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

const formatNumber = (num: number) => {
  return num?.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
};

const getPaymentTypeText = (type: string) => {
  const types = {
    rent: '房租',
    water: '水费',
    electricity: '电费',
    deposit: '预存',
    other: '其他'
  };
  return types[type] || type;
};

const goToHouse = (houseId: number) => {
  router.push(`/houses/${houseId}`);
};

const loadTenantDetail = async () => {
  try {
    const tenantId = Number(route.params.id);
    if (isNaN(tenantId)) {
      showNotify({ type: 'danger', message: '无效的租客ID' });
      router.push('/');
      return;
    }

    const response = await tenantApi.getTenant(tenantId);
    if (!response.data) {
      showNotify({ type: 'danger', message: '租客信息不存在' });
      router.push('/');
      return;
    }
    
    tenant.value = response.data;
    await loadPayments();
  } catch (error) {
    console.error('Failed to load tenant detail:', error);
    showNotify({ type: 'danger', message: '加载租客信息失败' });
    router.push('/');
  }
};

const loadPayments = async () => {
  try {
    if (tenant.value.id) {
      const response = await paymentApi.getTenantPayments(tenant.value.id);
      payments.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load payments:', error);
    showNotify({ type: 'danger', message: '加载缴费记录失败' });
  }
};

onMounted(() => {
  loadTenantDetail();
});
</script>

<style scoped>
.tenant-detail {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding: 16px;
}

.payment-list {
  margin-top: 12px;
  min-height: 120px;
}

.income {
  color: #ee0a24;
  font-weight: bold;
}

:deep(.van-cell-group__title) {
  padding: 16px 16px 8px;
}

.van-cell-group {
  margin-bottom: 16px;
}
</style> 