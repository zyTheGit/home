<template>
  <div class="home">
    <van-nav-bar title="租房管理系统">
      <template #right>
        <van-icon name="setting-o" size="18" @click="showSettings" />
      </template>
    </van-nav-bar>

    <div class="page-container">
      <!-- 统计卡片 -->
      <div class="stat-grid">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <div class="stat-card">
              <div class="stat-card__title">总收入</div>
              <div class="stat-card__value">
                ¥{{ formatNumber(statistics.totalIncome) }}
              </div>
              <div class="stat-card__trend">
                <van-icon name="arrow-up" />
                <span>8.2%</span>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div
              class="stat-card"
              style="
                background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
              "
            >
              <div class="stat-card__title">本月收入</div>
              <div class="stat-card__value">
                ¥{{ formatNumber(statistics.monthlyIncome) }}
              </div>
              <div class="stat-card__trend">
                <van-icon name="arrow-up" />
                <span>12.5%</span>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 房屋概览 -->
      <div class="section-title">房屋概览</div>
      <div class="overview-cards">
        <van-grid :column-num="3" :gutter="10">
          <van-grid-item>
            <div class="overview-card">
              <div class="overview-card__value">
                {{ statistics.totalHouses || 0 }}
              </div>
              <div class="overview-card__label">总房源</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="overview-card">
              <div class="overview-card__value">
                {{ statistics.occupancyRate || 0 }}%
              </div>
              <div class="overview-card__label">出租率</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="overview-card">
              <div class="overview-card__value">
                {{ statistics.pendingPayments || 0 }}
              </div>
              <div class="overview-card__label">待收款</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 房屋列表 -->
      <div class="section-title">房屋状态</div>
      <div class="house-list">
        <div
          class="card"
          v-for="house in houses"
          :key="house.id"
          @click="showHouseDetail(house)"
        >
          <van-cell :title="house.title" :label="house.address" is-link>
            <template #right-icon>
              <van-tag :type="getStatusType(house.status)" round size="small">
                {{ getStatusText(house.status) }}
              </van-tag>
            </template>
          </van-cell>
          <div class="house-info">
            <div class="info-item">
              <van-icon name="cash-back-record" />
              <span>¥{{ formatNumber(house.baseRent) }}/月</span>
            </div>
            <div class="info-item">
              <van-icon name="area" />
              <span>{{ house.area }}㎡</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <van-tabbar v-model="active" route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/houses" icon="shop-o">房源</van-tabbar-item>
      <van-tabbar-item replace to="/tenants" icon="friends-o"
        >租客</van-tabbar-item
      >
      <van-tabbar-item replace to="/statistics" icon="chart-trending-o"
        >统计</van-tabbar-item
      >
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { showToast } from "vant";
import { houseApi } from "../api";
import type { House } from "../types";

const active = ref(0);
const houses = ref<House[]>([]);
const statistics = ref({
  totalIncome: 0,
  monthlyIncome: 0,
  totalHouses: 0,
  occupancyRate: 0,
  pendingPayments: 0,
});

const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

const getStatusType = (status: House["status"]) => {
  return status === "available" ? "success" : "warning";
};

const getStatusText = (status: House["status"]) => {
  return status === "available" ? "可租" : "已租";
};

const showHouseDetail = (house: House) => {
  // 实现房屋详情展示逻辑
};

const loadData = async () => {
  try {
    const response = await houseApi.getHouses();
    houses.value = response.data;
  } catch (error) {
    console.error("Failed to load houses:", error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.overview-cards {
  margin: 0 16px;
}

.overview-card {
  background: var(--card-background);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.overview-card__value {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

.overview-card__label {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

.house-list .card {
  margin: 0 16px 12px;
}

.house-info {
  display: flex;
  padding: 8px 16px 12px;
  border-top: 1px solid var(--border-color);
}

:deep(.van-field__right-icon) {
  height: 100%;
  display: flex;
  align-items: center;
}

:deep(.van-tag--round) {
  height: 20px;
  line-height: 18px;
  padding: 0 8px;
  font-size: 12px;
}

:deep(.van-cell__title) {
  flex: 1;
  padding-right: 12px;
}

:deep(.van-cell__value) {
  flex: none;
}
</style>
