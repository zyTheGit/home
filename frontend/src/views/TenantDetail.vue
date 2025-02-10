<template>
  <div class="tenant-detail">
    <van-nav-bar
      title="租客详情"
      :left-text="isAdmin ? '返回' : ''"
      :left-arrow="isAdmin ? true : false"
      @click-left="handleBack"
      :right-text="!isAdmin ? '退出' : ''"
      @click-right="handleLogout"
    />

    <div class="content">
      <!-- 租客基本信息 -->
      <van-cell-group inset title="基本信息">
        <van-cell title="姓名" :value="tenant.name" />
        <van-cell title="手机号" :value="tenant.phone" />
        <van-cell title="身份证号" :value="tenant.idCard" />
        <van-cell title="入住时间" :value="dateUtils.format(tenant.startDate)" />
        <van-cell title="到期时间" :value="dateUtils.format(tenant?.endDate)" />
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
        <van-cell
          title="基础租金"
          :value="`¥${formatNumber(tenant.house.baseRent)}/月`"
        />
      </van-cell-group>

      <!-- 缴费记录 -->
      <van-cell-group inset title="缴费记录">
        <div class="payment-list">
          <template v-if="payments.length > 0">
            <div
              class="payment-card"
              v-for="payment in payments"
              :key="payment.id"
            >
              <div class="payment-header">
                <span class="payment-date">{{ dateUtils.format(payment.createdAt) }}</span>
                <span
                  :class="[
                    'payment-status',
                    payment.balance >= 0 ? 'paid' : 'unpaid',
                  ]"
                >
                  {{ payment.balance >= 0 ? "已结清" : "欠费" }}
                </span>
              </div>

              <div class="payment-body">
                <div class="fee-details">
                  <!-- 实际缴费金额 -->
                  <div class="fee-item">
                    <span>实际缴费金额</span>
                    <span>¥{{ calculateMoney.format(payment.amount) }}</span>
                  </div>

                  <!-- 应缴金额 -->
                  <div class="fee-item">
                    <span>应缴金额</span>
                    <span>¥{{ calculateExpectedAmount(payment) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <van-empty v-else description="暂无缴费记录" />
        </div>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showDialog, showNotify } from "vant";
import { tenantApi, paymentApi } from "../api";
import { useUserStore } from "../stores/user";
import type { Tenant, Payment } from "../types";
import { calculateMoney } from "../utils/decimal";
import { dateUtils } from "../utils/date";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const tenant = ref<Tenant>({} as Tenant);
const payments = ref<Payment[]>([]);
const isAdmin = computed(() => userStore.isAdmin);

const handleBack = () => {
  router.back();
};

const handleLogout = () => {
  showDialog({
    title: "退出登录",
    message: "确定要退出登录吗？",
    showCancelButton: true,
  })
    .then(() => {
      userStore.clearUserInfo();
      router.push("/login");
    })
    .catch(() => {});
};

const formatNumber = (num: number) => {
  return num?.toLocaleString("zh-CN", { minimumFractionDigits: 2 });
};

const goToHouse = (houseId: number) => {
  router.push(`/houses/${houseId}`);
};

const loadTenantDetail = async () => {
  try {
    const tenantId = Number(route.params.id);
    if (isNaN(tenantId)) {
      showNotify({ type: "danger", message: "无效的租客ID" });
      router.push("/");
      return;
    }

    const response = await tenantApi.getTenant(tenantId);
    if (!response.data) {
      showNotify({ type: "danger", message: "租客信息不存在" });
      router.push("/");
      return;
    }

    tenant.value = response.data;
    await loadPayments();
  } catch (error) {
    console.error("Failed to load tenant detail:", error);
    showNotify({ type: "danger", message: "加载租客信息失败" });
    router.push("/");
  }
};

const loadPayments = async () => {
  try {
    if (tenant.value.id) {
      const response = await paymentApi.getTenantPayments(tenant.value.id);
      payments.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load payments:", error);
    showNotify({ type: "danger", message: "加载缴费记录失败" });
  }
};

// 计算应缴金额
const calculateExpectedAmount = (payment: any) => {
  let expectedAmount = '0';

  // 添加水费
  if (payment.waterUsage) {
    const waterUsed = calculateMoney.subtract(payment.waterUsage, payment.previousWaterUsage || 0);
    const waterFee = calculateMoney.multiply(waterUsed, tenant.value.house.waterRate);
    expectedAmount = calculateMoney.add(expectedAmount, waterFee);
  }

  // 添加电费
  if (payment.electricityUsage) {
    const electricityUsed = calculateMoney.subtract(payment.electricityUsage, payment.previousElectricityUsage || 0);
    const electricityFee = calculateMoney.multiply(electricityUsed, tenant.value.house.electricityRate);
    expectedAmount = calculateMoney.add(expectedAmount, electricityFee);
  }

  // 添加其他费用
  if (payment.otherAmount) {
    expectedAmount = calculateMoney.add(expectedAmount, payment.otherAmount);
  }

  // 添加房租
  expectedAmount = calculateMoney.add(expectedAmount, payment.baseRent || tenant.value.house.baseRent);

  return expectedAmount;
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

.payment-card {
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.payment-date {
  font-size: 14px;
  font-weight: bold;
}

.payment-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.paid {
  background-color: #dff0d8;
  color: #5cb85c;
}

.unpaid {
  background-color: #f2dede;
  color: #a94442;
}

.payment-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fee-details {
  display: flex;
  flex-direction: column;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
</style>
