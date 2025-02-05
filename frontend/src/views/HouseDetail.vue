<template>
  <div class="house-detail">
    <van-nav-bar
      title="房屋详情"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
    />

    <div class="content">
      <!-- 房屋基本信息 -->
      <van-cell-group inset title="基本信息">
        <van-cell title="房屋名称" :value="house.title" />
        <van-cell title="地址" :value="house.address" />
        <van-cell title="状态">
          <template #default>
            <van-tag :type="getStatusType(house.status)">
              {{ getStatusText(house.status) }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell
          title="基础租金"
          :value="`¥${formatNumber(house.baseRent)}/月`"
        />
        <van-cell title="面积" :value="`${house.area}㎡`" />
        <van-cell title="水费" :value="`¥${house.waterRate}/吨`" />
        <van-cell title="电费" :value="`¥${house.electricityRate}/度`" />
      </van-cell-group>

      <!-- 缴费状态 -->
      <van-cell-group inset title="缴费状态">
        <van-cell title="状态">
          <template #default>
            <van-tag
              :type="paymentStatus.status === 'paid' ? 'success' : 'danger'"
            >
              {{ paymentStatus.status === "paid" ? "已缴费" : "欠费" }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell
          v-if="paymentStatus.status === 'unpaid'"
          title="欠费金额"
          :value="`¥${formatNumber(paymentStatus.amount)}`"
        />
        <van-cell
          title="最近缴费日期"
          :value="
            paymentStatus.lastPaymentDate
              ? formatDate(paymentStatus.lastPaymentDate)
              : '暂无'
          "
        />
      </van-cell-group>

      <!-- 缴费记录 -->
      <van-cell-group inset title="缴费记录" class="payment-section">
        <van-button
          type="primary"
          size="small"
          @click="showAddPayment = true"
          class="add-payment-btn"
        >
          添加缴费记录
        </van-button>

        <div class="payment-list">
          <van-cell
            v-for="payment in payments"
            :key="payment.id"
            :title="getPayTypeText(payment.type)"
            :label="formatDate(payment.date)"
          >
            <template #value>
              <span :class="{ income: true }"
                >+¥{{ formatNumber(payment.amount) }}</span
              >
            </template>
            <template #label>
              <div class="payment-info">
                <span>{{ formatDate(payment.date) }}</span>
                <span v-if="payment.remark" class="payment-remark">{{
                  payment.remark
                }}</span>
              </div>
            </template>
          </van-cell>
        </div>
      </van-cell-group>
    </div>

    <!-- 添加缴费记录弹窗 -->
    <van-dialog
      v-model:show="showAddPayment"
      title="添加缴费记录"
      show-cancel-button
      @confirm="handleAddPayment"
    >
      <van-form @submit.prevent>
        <van-cell-group>
          <!-- 上次应缴费用 -->
          <van-cell
            title="上次应缴费用"
            :value="`¥${formatNumber(lastMonthFees)}`"
          />

          <!-- 水费输入 -->
          <van-cell-group inset title="水费">
            <van-field
              v-model="paymentForm.waterUsage"
              type="number"
              label="本次读数"
              required
              placeholder="请输入水表读数"
            >
              <template #extra>
                <span class="usage-info">上次读数：{{ lastWaterUsage }}</span>
              </template>
            </van-field>
            <van-cell
              title="水费金额"
              :value="`¥${formatNumber(calculateWaterFee())}`"
            />
          </van-cell-group>

          <!-- 电费输入 -->
          <van-cell-group inset title="电费">
            <van-field
              v-model="paymentForm.electricityUsage"
              type="number"
              label="本次读数"
              required
              placeholder="请输入电表读数"
            >
              <template #extra>
                <span class="usage-info"
                  >上次读数：{{ lastElectricityUsage }}</span
                >
              </template>
            </van-field>
            <van-cell
              title="电费金额"
              :value="`¥${formatNumber(calculateElectricityFee())}`"
            />
          </van-cell-group>

          <!-- 其他费用 -->
          <van-field
            v-model="paymentForm.otherAmount"
            type="number"
            label="其他费用"
            placeholder="请输入其他费用金额"
          />

          <!-- 本月应缴总额 -->
          <van-cell title="本月应缴总额">
            <template #value>
              <span class="amount"
                >¥{{ formatNumber(calculateTotalAmount()) }}</span
              >
            </template>
          </van-cell>

          <!-- 实际缴费金额 -->
          <van-field
            v-model="paymentForm.actualAmount"
            type="number"
            label="实际缴费金额"
            required
            placeholder="请输入实际缴费金额"
          />

          <van-field
            v-model="paymentForm.date"
            label="缴费日期"
            type="datetime-local"
            placeholder="请选择日期和时间"
          />

          <van-field
            v-model="paymentForm.remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注"
            rows="2"
          />
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 缴费类型选择器 -->
    <van-popup v-model:show="showTypeSelector" position="bottom" round>
      <van-picker
        :columns="paymentTypes"
        @confirm="onTypeSelect"
        @cancel="showTypeSelector = false"
        show-toolbar
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import dayjs from "dayjs";
import { useRouter, useRoute } from "vue-router";
import { showNotify } from "vant";
import { houseApi, paymentApi, tenantApi } from "../api";
import { calculateMoney } from "../utils/decimal";
import { dateUtils } from "../utils/date";
import type { House, Payment } from "../types";

const router = useRouter();
const route = useRoute();
const house = ref<House>({} as House);
const payments = ref<Payment[]>([]);
const showAddPayment = ref(false);
const showTypeSelector = ref(false);

const paymentTypes = [
  { text: "房租", value: "rent" },
  { text: "水费", value: "water" },
  { text: "电费", value: "electricity" },
  { text: "预存", value: "deposit" },
  { text: "其他", value: "other" },
];

const paymentForm = reactive({
  waterUsage: "",
  electricityUsage: "",
  otherAmount: "",
  actualAmount: "",
  date: dayjs().format("YYYY-MM-DDTHH:mm"),
  remark: "",
});

const balance = ref(0);
const selectedTypes = ref<string[]>([]);
const lastWaterUsage = ref(0);
const lastElectricityUsage = ref(0);

const paymentStatus = ref({
  status: "paid",
  amount: 0,
  lastPaymentDate: null,
  monthsDiff: 0,
});

const lastMonthFees = ref(0);

const getPayTypeText = (type: string) =>
  paymentTypes.find((i) => i.value === type)?.text;

const calculateWaterFee = () => {
  if (!paymentForm.waterUsage) return 0;
  const waterUsed = Number(paymentForm.waterUsage) - lastWaterUsage.value;
  return calculateMoney.multiply(waterUsed, house.value.waterRate);
};

const calculateElectricityFee = () => {
  if (!paymentForm.electricityUsage) return 0;
  const electricityUsed =
    Number(paymentForm.electricityUsage) - lastElectricityUsage.value;
  return calculateMoney.multiply(electricityUsed, house.value.electricityRate);
};

const calculateTotalAmount = () => {
  const waterFee = calculateWaterFee();
  const electricityFee = calculateElectricityFee();
  const otherFee = calculateMoney.format(paymentForm.otherAmount || 0);
  const baseRent = calculateMoney.format(house.value.baseRent || 0);

  return calculateMoney.add(
    calculateMoney.add(waterFee, electricityFee),
    calculateMoney.add(otherFee, baseRent)
  );
};
const getStatusType = (status: string) => {
  const typeMap = {
    available: "success",
    rented: "warning",
    maintenance: "danger",
  };
  return typeMap[status] || "default";
};

const getStatusText = (status: string) => {
  const textMap = {
    available: "可租",
    rented: "已租",
    maintenance: "维护中",
  };
  return textMap[status] || status;
};

const formatNumber = (num: number) => {
  return num?.toLocaleString("zh-CN", { minimumFractionDigits: 2 });
};
const formatDate = (date: string) => {
  return dateUtils.formatDateTime(date);
};
const handleBack = () => {
  router.back();
};

const onTypeSelect = (value: { text: string; selectedValues: string[] }) => {
  selectedTypes.value = value.selectedValues;
  showTypeSelector.value = false;

  // 重置表单相关字段
  paymentForm.amount = "";
  paymentForm.currentUsage = "";

  // 如果是水费或电费，加载上次读数
  if (value.value === "water" || value.value === "electricity") {
    loadLastUsage();
  }
};

const loadLastUsage = async () => {
  try {
    const response = await paymentApi.getHousePayments(Number(route.params.id));
    const lastWaterPayment = response.data.find((p) => p.type === "water");
    const lastElectricityPayment = response.data.find(
      (p) => p.type === "electricity"
    );

    lastWaterUsage.value = lastWaterPayment?.waterUsage || 0;
    lastElectricityUsage.value = lastElectricityPayment?.electricityUsage || 0;
  } catch (error) {
    console.error("Failed to load last usage:", error);
  }
};

const handleAddPayment = async () => {
  try {
    const submitData = {
      amount: Number(paymentForm.actualAmount),
      date: dateUtils.formatDateTime(paymentForm.date), // 使用统一的日期格式化工具
      remark: paymentForm.remark || "",
      houseId: Number(route.params.id),
      waterUsage: paymentForm.waterUsage
        ? Number(paymentForm.waterUsage)
        : undefined,
      electricityUsage: paymentForm.electricityUsage
        ? Number(paymentForm.electricityUsage)
        : undefined,
      otherAmount: Number(paymentForm.otherAmount || 0),
    };

    await paymentApi.createPayment(submitData);
    showNotify({ type: "success", message: "添加成功" });
    showAddPayment.value = false;
    loadPayments();
    loadBalance();

    // 重置表单
    Object.assign(paymentForm, {
      waterUsage: "",
      electricityUsage: "",
      otherAmount: "",
      actualAmount: "",
      date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      remark: "",
    });
  } catch (error) {
    console.error("Failed to add payment:", error);
    showNotify({
      type: "danger",
      message: error.response?.data?.message || "添加失败",
    });
  }
};

const loadHouseDetail = async () => {
  try {
    const response = await houseApi.getHouse(Number(route.params.id));
    if (!response.data) {
      showNotify({ type: "danger", message: "房屋信息不存在" });
      router.push("/");
      return;
    }

    house.value = response.data;
    await loadPayments();

    // 如果房屋已租，加载租客信息和费用
    if (house.value.status === "rented") {
      const tenantResponse = await tenantApi.getTenantByHouse(house.value.id);
      if (tenantResponse.data) {
        const monthlyFees = calculateMonthlyFees();
        if (monthlyFees > 0) {
          showNotify({
            type: "warning",
            message: `当前应缴费用：¥${formatNumber(monthlyFees)}`,
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to load house detail:", error);
    showNotify({ type: "danger", message: "加载房屋信息失败" });
    router.push("/");
  }
};

const loadPayments = async () => {
  try {
    const houseId = Number(route.params.id);
    const response = await paymentApi.getHousePayments(houseId);
    payments.value = response.data;
  } catch (error) {
    console.error("Failed to load payments:", error);
    showNotify({ type: "danger", message: "加载缴费记录失败" });
  }
};

const loadBalance = async () => {
  try {
    const response = await paymentApi.getBalance(Number(route.params.id));
    balance.value = response.data;
  } catch (error) {
    console.error("Failed to load balance:", error);
  }
};

const calculateMonthlyFees = () => {
  if (!house.value || !tenant.value) return 0;

  const startDate = dayjs(tenant.value.startDate);
  const now = dayjs();
  const monthsDiff = now.diff(startDate, "month");

  let totalFees = 0;

  // 基础房租
  totalFees += house.value.baseRent * monthsDiff;

  // 获取上次抄表记录
  const lastPayment = payments.value[0];
  if (lastPayment) {
    // 水费
    if (lastPayment.waterUsage) {
      const waterUsed = paymentForm.waterUsage - lastPayment.waterUsage;
      totalFees += waterUsed * house.value.waterRate;
    }

    // 电费
    if (lastPayment.electricityUsage) {
      const electricityUsed =
        paymentForm.electricityUsage - lastPayment.electricityUsage;
      totalFees += electricityUsed * house.value.electricityRate;
    }
  }

  return totalFees;
};

const loadPaymentStatus = async () => {
  try {
    const response = await paymentApi.getHousePaymentStatus(
      Number(route.params.id)
    );
    paymentStatus.value = response.data;
  } catch (error) {
    console.error("Failed to load payment status:", error);
  }
};

onMounted(() => {
  loadHouseDetail();
  loadBalance();
  loadLastUsage();
  loadPaymentStatus();
});
</script>

<style scoped>
.house-detail {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding: 16px;
}

.payment-section {
  margin-top: 16px;
  position: relative;
  padding-top: 50px;
}

.add-payment-btn {
  position: absolute;
  right: 16px;
  top: 8px;
}

.payment-list {
  margin-top: 12px;
}

.payment-info {
  display: flex;
  gap: 8px;
  color: var(--van-text-color-2);
  font-size: 12px;
}

.payment-remark {
  color: var(--van-text-color-3);
}

.income {
  color: #ee0a24;
  font-weight: bold;
}

:deep(.van-cell-group__title) {
  padding: 16px 16px 8px;
}

.amount {
  color: #ee0a24;
  font-weight: bold;
}

.negative-balance {
  color: #ee0a24;
}

.picker-buttons {
  padding: 16px;
}

:deep(.van-dialog) {
  width: calc(100% - 24px);
  margin: 0 12px;
}

:deep(.van-dialog__content .van-cell-group) {
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.van-cell .van-field__label) {
  flex: 1;
}

:deep(.van-cell) {
  align-items: center;
}
</style>
