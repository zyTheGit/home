<template>
  <div class="house-detail">
    <van-nav-bar
      title="房屋详情"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
      right-text="退出"
      @click-right="handleLogout"
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

      <!-- 缴费状态 - 仅管理员可见 -->
      <van-cell-group inset title="缴费状态" v-if="isAdmin">
        <van-cell title="状态">
          <template #default>
            <van-tag
              v-if="house.status === 'rented'"
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

      <!-- 缴费记录 - 仅管理员可见 -->
      <van-cell-group inset title="缴费记录" v-if="isAdmin">
        <!-- 添加缴费按钮 - 仅管理员可见 -->
        <div
          v-if="shouldShowPaymentButton(house.status, paymentStatus.status)"
          class="add-payment-section"
        >
          <van-button
            type="primary"
            size="small"
            @click="openAddPayment"
            class="add-payment-btn"
          >
            添加缴费记录
          </van-button>
        </div>

        <!-- 缴费记录列表 -->
        <template v-if="payments.length > 0">
          <div
            class="payment-card"
            v-for="payment in payments"
            :key="payment.id"
          >
            <div class="payment-header">
              <span class="payment-date">{{
                formatDate(payment.createdAt)
              }}</span>
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
                <div class="fee-item" v-if="payment.waterUsage">
                  <span>水费</span>
                  <span
                    >¥{{
                      calculateMoney.multiply(
                        calculateMoney.subtract(
                          payment.waterUsage,
                          lastWaterUsage
                        ),
                        house.waterRate
                      )
                    }}</span
                  >
                </div>

                <div class="fee-item" v-if="payment.electricityUsage">
                  <span>电费</span>
                  <span
                    >¥{{
                      calculateMoney.multiply(
                        calculateMoney.subtract(
                          payment.electricityUsage,
                          lastElectricityUsage
                        ),
                        house.electricityRate
                      )
                    }}</span
                  >
                </div>

                <div class="fee-item" v-if="payment.otherAmount">
                  <span>其他费用</span>
                  <span>¥{{ calculateMoney.format(payment.otherAmount) }}</span>
                </div>

                <div class="fee-item">
                  <span>房租</span>
                  <span>¥{{ calculateMoney.format(house.baseRent) }}</span>
                </div>

                <div class="fee-item" v-if="payment?.balance">
                  <span>{{
                    payment.balance >= 0 ? "上次结余" : "上次欠费"
                  }}</span>
                  <span :class="payment.balance >= 0 ? 'positive' : 'negative'">
                    {{ payment.balance >= 0 ? "+" : "-" }}
                    ¥{{ calculateMoney.format(Math.abs(payment.balance)) }}
                  </span>
                </div>

                <div class="fee-item total">
                  <span>应缴总额</span>
                  <span>¥{{ calculateTotalAmount }}</span>
                </div>

                <div class="fee-item total">
                  <span>实收总额</span>
                  <span>¥{{ payment.amount }}</span>
                </div>
              </div>

              <div class="payment-item balance">
                <span class="label">结余</span>
                <span
                  :class="[
                    'amount',
                    payment.balance >= 0 ? 'positive' : 'negative',
                  ]"
                >
                  ¥{{ formatNumber(Math.abs(payment.balance)) }}
                  {{ payment.balance >= 0 ? "结余" : "欠费" }}
                </span>
              </div>
            </div>

            <div class="payment-footer" v-if="payment.remark">
              <span class="remark-label">备注：</span>
              <span class="remark-content">{{ payment.remark }}</span>
            </div>
          </div>
        </template>
        <van-empty v-else description="暂无缴费记录" />
      </van-cell-group>
    </div>

    <!-- 添加缴费弹窗 - 仅管理员可见 -->
    <van-dialog
      v-if="isAdmin"
      v-model:show="showAddPayment"
      title="添加缴费记录"
      :show-cancel-button="true"
      @confirm="handleAddPayment"
    >
      <van-form @submit.prevent>
        <van-cell-group inset>
          <!-- 水费输入 -->
          <van-field
            v-model="paymentForm.waterUsage"
            type="number"
            label="水表读数"
            placeholder="请输入水表读数"
            :rules="[
              {
                validator: validateWaterUsage,
                message: '水表读数不能小于上次读数',
              },
            ]"
          >
            <template #extra>
              <div class="usage-info">
                <span>上次：{{ lastWaterUsage }}</span>
                <span v-if="paymentForm.waterUsage">
                  用量：{{
                    calculateMoney.subtract(
                      paymentForm.waterUsage,
                      lastWaterUsage
                    )
                  }}吨
                </span>
              </div>
            </template>
          </van-field>

          <!-- 电费输入 -->
          <van-field
            v-model="paymentForm.electricityUsage"
            type="number"
            label="电表读数"
            placeholder="请输入电表读数"
            :rules="[
              {
                validator: validateElectricityUsage,
                message: '电表读数不能小于上次读数',
              },
            ]"
          >
            <template #extra>
              <div class="usage-info">
                <span>上次：{{ lastElectricityUsage }}</span>
                <span v-if="paymentForm.electricityUsage">
                  用量：{{
                    calculateMoney.subtract(
                      paymentForm.electricityUsage,
                      lastElectricityUsage
                    )
                  }}度
                </span>
              </div>
            </template>
          </van-field>

          <!-- 其他费用 -->
          <van-field
            v-model="paymentForm.otherAmount"
            type="number"
            label="其他费用"
            placeholder="请输入其他费用"
          />

          <!-- 房租金额 -->
          <van-field
            v-model="paymentForm.baseRent"
            type="number"
            label="房租金额"
            :placeholder="`默认金额：${house.value?.baseRent || 0}`"
          />

          <!-- 费用明细 -->
          <div class="fee-details">
            <!-- 水费明细 -->
            <div class="fee-item" v-if="paymentForm.waterUsage">
              <span>水费</span>
              <div class="fee-detail">
                <span class="usage"
                  >用量：{{
                    calculateMoney.subtract(
                      paymentForm.waterUsage,
                      lastWaterUsage
                    )
                  }}吨</span
                >
                <span>¥{{ calculateWaterFee }}</span>
              </div>
            </div>

            <!-- 电费明细 -->
            <div class="fee-item" v-if="paymentForm.electricityUsage">
              <span>电费</span>
              <div class="fee-detail">
                <span class="usage"
                  >用量：{{
                    calculateMoney.subtract(
                      paymentForm.electricityUsage,
                      lastElectricityUsage
                    )
                  }}度</span
                >
                <span>¥{{ calculateElectricityFee }}</span>
              </div>
            </div>

            <!-- 其他费用 -->
            <div class="fee-item" v-if="paymentForm.otherAmount">
              <span>其他费用</span>
              <span>¥{{ calculateMoney.format(paymentForm.otherAmount) }}</span>
            </div>

            <!-- 房租 -->
            <div class="fee-item">
              <span>房租</span>
              <span>¥{{ calculateActualRent }}</span>
            </div>

            <!-- 上次欠费 -->
            <div class="fee-item">
              <span>{{
                lastPayment.balance >= 0 ? "上次结余" : "上次欠费"
              }}</span>
              <span :class="lastPayment.balance >= 0 ? 'positive' : 'negative'">
                {{ lastPayment.balance >= 0 ? "+" : "-" }}
                ¥{{ calculateMoney.format(Math.abs(lastPayment.balance)) }}
              </span>
            </div>

            <!-- 应缴总额 -->
            <div class="fee-item total">
              <span>应缴总额</span>
              <span>¥{{ calculateTotalAmount }}</span>
            </div>

            <!-- 实收金额 -->
            <div class="fee-item" v-if="paymentForm.actualAmount">
              <span>实收金额</span>
              <span class="positive"
                >¥{{ calculateMoney.format(paymentForm.actualAmount) }}</span
              >
            </div>

            <!-- 本次结余/欠费 -->
            <div class="fee-item balance" v-if="paymentForm.actualAmount">
              <span>{{ calculateBalance >= 0 ? "本次结余" : "本次欠费" }}</span>
              <span :class="calculateBalance >= 0 ? 'positive' : 'negative'">
                ¥{{ calculateMoney.format(Math.abs(calculateBalance)) }}
              </span>
            </div>
          </div>

          <!-- 实收金额 -->
          <van-field
            v-model="paymentForm.actualAmount"
            type="number"
            label="实收金额"
            placeholder="请输入实际收款金额"
            required
          />

          <!-- 备注 -->
          <van-field
            v-model="paymentForm.remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注信息"
            rows="2"
          />
        </van-cell-group>
      </van-form>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import dayjs from "dayjs";
import { useRouter, useRoute } from "vue-router";
import { showDialog, showNotify } from "vant";
import { houseApi, paymentApi, tenantApi } from "../api";
import { calculateMoney } from "../utils/decimal";
import { dateUtils } from "../utils/date";
import { useUserStore } from "../stores/user";
import type { House, Payment } from "../types";

const router = useRouter();
const route = useRoute();
const house = ref<House>({} as House);
const payments = ref<Payment[]>([]);
const showAddPayment = ref(false);
const paymentForm = reactive({
  waterUsage: "",
  electricityUsage: "",
  otherAmount: "",
  actualAmount: "",
  baseRent: 0,
  date: dayjs().format("YYYY-MM-DDTHH:mm"),
  remark: "",
});

const balance = ref(0);
const lastWaterUsage = ref(0);
const lastElectricityUsage = ref(0);

const paymentStatus = ref({
  status: "paid",
  amount: 0,
  lastPaymentDate: null,
  monthsDiff: 0,
});

const userStore = useUserStore();
const isAdmin = computed(() => userStore.isAdmin);
const isOwner = computed(() => {
  return house.value?.userId === userStore.userInfo?.id;
});

const lastPayment = computed(() => payments.value[0] || { balance: 0 });

const tenant = ref(null);

const calculateWaterFee = computed(() => {
  if (!paymentForm.waterUsage) return "0.00";
  const waterUsed = calculateMoney.subtract(
    paymentForm.waterUsage,
    lastWaterUsage.value
  );
  return calculateMoney.multiply(waterUsed, house.value.waterRate);
});

const calculateElectricityFee = computed(() => {
  if (!paymentForm.electricityUsage) return "0.00";
  const electricityUsed = calculateMoney.subtract(
    paymentForm.electricityUsage,
    lastElectricityUsage.value
  );
  return calculateMoney.multiply(electricityUsed, house.value.electricityRate);
});

const calculateTotalAmount = computed(() => {
  let total = "0";

  // 添加水费
  total = calculateMoney.add(total, calculateWaterFee.value);

  // 添加电费
  total = calculateMoney.add(total, calculateElectricityFee.value);

  // 添加其他费用
  if (paymentForm.otherAmount) {
    total = calculateMoney.add(total, paymentForm.otherAmount);
  }

  // 添加房租
  total = calculateMoney.add(total, house.value.baseRent);

  // 处理上次结余/欠费
  if (lastPayment.value?.balance) {
    if (lastPayment.value.balance < 0) {
      // 如果是欠费，需要加到应缴总额中
      total = calculateMoney.add(total, Math.abs(lastPayment.value.balance));
    } else {
      // 如果是结余，需要从应缴总额中减去
      total = calculateMoney.subtract(total, lastPayment.value.balance);
    }
  }

  return total;
});

const calculateBalance = computed(() => {
  if (!paymentForm.actualAmount) return "0";

  // 实收金额减去应缴总额
  return calculateMoney.subtract(
    paymentForm.actualAmount,
    calculateTotalAmount.value
  );
});

const getStatusType = (status: "available" | "rented" | "maintenance") => {
  const typeMap = {
    available: "success",
    rented: "warning",
    maintenance: "danger",
  };
  return typeMap[status] || "default";
};

const getStatusText = (status: "available" | "rented" | "maintenance") => {
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
  return dateUtils.format(date);
};
const handleBack = () => {
  router.back();
};

const loadLastUsage = async () => {
  try {
    const response = await paymentApi.getHousePayments(Number(route.params.id));
    const payments = response.data;

    if (payments && payments.length > 0) {
      // 获取最新的一条缴费记录
      const lastPayment = payments[0];
      lastWaterUsage.value = lastPayment?.waterUsage || 0;
      lastElectricityUsage.value = lastPayment?.electricityUsage || 0;
    } else {
      // 如果没有缴费记录，使用房屋的初始读数
      lastWaterUsage.value = house.value?.initialWaterReading || 0;
      lastElectricityUsage.value = house.value?.initialElectricityReading || 0;
    }
  } catch (error) {
    console.error("Failed to load last usage:", error);
  }
};

const resetForm = () => {
  Object.assign(paymentForm, {
    waterUsage: "",
    electricityUsage: "",
    otherAmount: "",
    actualAmount: "",
    baseRent: house.value?.baseRent || 0,
    remark: "",
  });
};

const openAddPayment = () => {
  resetForm();
  loadLastUsage(); // 打开弹窗时重新加载最新的水电读数
  showAddPayment.value = true;
};

const handleAddPayment = async () => {
  try {
    const submitData = {
      amount: Number(paymentForm.actualAmount),
      remark: paymentForm.remark || "",
      houseId: Number(route.params.id),
      waterUsage: paymentForm.waterUsage
        ? Number(paymentForm.waterUsage)
        : undefined,
      electricityUsage: paymentForm.electricityUsage
        ? Number(paymentForm.electricityUsage)
        : undefined,
      otherAmount: Number(paymentForm.otherAmount || 0),
      baseRent: Number(paymentForm.baseRent || house.value.baseRent),
      balance: Number(calculateBalance.value),
    };

    await paymentApi.createPayment(submitData);
    showNotify({ type: "success", message: "添加成功" });
    showAddPayment.value = false;
    loadPayments();
    loadBalance();
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

    const tenantInfo = userStore.userInfo?.tenant;
    // 如果是普通用户，只能查看自己租住的房屋
    if (!isAdmin.value && response.data.tenant?.id !== tenantInfo?.id) {
      showNotify({ type: "danger", message: "无权访问" });
      router.push(`/tenants/${tenantInfo?.id}`);
      return;
    }

    house.value = response.data;
    paymentForm.baseRent = house.value.baseRent;

    // 只有管理员可以加载缴费记录
    if (isAdmin.value) {
      await loadPayments();
      await loadBalance();
      await loadLastUsage();
      await loadPaymentStatus();
    }

    // Load tenant data if house is rented
    if (house.value.status === "rented" && house.value.tenant) {
      const tenantResponse = await tenantApi.getTenant(house.value.tenant.id);
      tenant.value = tenantResponse.data;
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

    // 如果是普通用户，传入当前用户ID
    const userId = isAdmin.value ? undefined : userStore.userInfo?.id;
    const response = await paymentApi.getHousePayments(houseId, userId);

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

// 计算实际房租
const calculateActualRent = computed(() => {
  if (paymentForm.baseRent) {
    return calculateMoney.format(paymentForm.baseRent);
  }

  return calculateMoney.format(house.value?.baseRent || 0);
});

const shouldShowPaymentButton = (
  houseStatus: "available" | "rented" | "maintenance",
  paymentStatus: string
) => {
  return (
    houseStatus !== "available" || (paymentStatus === "欠费" && isAdmin.value)
  );
};

const validateWaterUsage = (value: string) => {
  if (!value) return true;
  return Number(value) >= lastWaterUsage.value;
};

const validateElectricityUsage = (value: string) => {
  if (!value) return true;
  return Number(value) >= lastElectricityUsage.value;
};

onMounted(async () => {
  // if (!isAdmin.value && !isOwner.value) {
  //   showNotify({ type: "danger", message: "无权访问" });
  //   router.push("/");
  //   return;
  // }
  await loadHouseDetail();
  await loadBalance();
  await loadLastUsage();
  await loadPaymentStatus();
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

.payment-amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 12px;
}

.payment-remark {
  color: #666;
}

.payment-card {
  background: #fff;
  border-radius: 8px;
  margin: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.payment-date {
  color: #666;
  font-size: 14px;
}

.payment-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.payment-status.paid {
  background: #e8f5e9;
  color: #4caf50;
}

.payment-status.unpaid {
  background: #ffebee;
  color: #f44336;
}

.payment-body {
  padding: 12px 0;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  line-height: 1.5;
}

.payment-item .label {
  color: #666;
  font-size: 14px;
  min-width: 70px;
}

.payment-item .amount {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.usage-details {
  text-align: right;
  font-size: 14px;
  color: #666;
}

.usage-details .fee {
  color: #333;
  font-weight: 500;
  margin-top: 4px;
}

.payment-item.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.payment-item.balance {
  margin-top: 8px;
}

.payment-item .amount.positive {
  color: #4caf50;
}

.payment-item .amount.negative {
  color: #f44336;
}

.payment-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  font-size: 14px;
}

.remark-label {
  color: #999;
}

.remark-content {
  color: #666;
}

.add-payment-section {
  position: relative;
  padding: 12px;
  display: flex;
  justify-content: flex-end;
}

.add-payment-btn {
  margin-right: 16px;
}

.usage-info {
  font-size: 12px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.fee-details {
  margin: 12px 16px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.fee-detail {
  text-align: right;
}

.usage {
  font-size: 12px;
  color: #999;
  margin-right: 8px;
}

.fee-item.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
  font-weight: bold;
  color: #333;
}

.negative {
  color: #f44336;
}

.fee-item.balance {
  margin-top: 8px;
  font-weight: bold;
}

.positive {
  color: #4caf50;
}

.rent-info {
  font-size: 12px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
</style>
