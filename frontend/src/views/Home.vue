<template>
  <div class="home">
    <van-nav-bar title="首页" />

    <div class="content">
      <!-- 快捷操作 -->
      <div class="quick-actions">
        <van-grid :column-num="2" :gutter="16">
          <van-grid-item icon="home-o" text="房源管理" to="/houses" />
          <van-grid-item icon="friends-o" text="租客管理" to="/tenants" />
        </van-grid>
      </div>

      <!-- 概览数据 -->
      <div class="overview-section">
        <div class="section-title">数据概览</div>
        <van-grid :column-num="2" :gutter="16">
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
                {{ statistics.rentedHouses || 0 }}
              </div>
              <div class="overview-card__label">已租房源</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="overview-card">
              <div class="overview-card__value">
                {{ statistics.occupancyRate }}%
              </div>
              <div class="overview-card__label">出租率</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="overview-card">
              <div class="overview-card__value">
                ¥{{ formatNumber(statistics.totalIncome || 0) }}
              </div>
              <div class="overview-card__label">总收入</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 房屋列表 -->
      <div class="house-list-section">
        <div class="section-header">
          <span class="section-title">房屋状态</span>
          <van-button
            size="small"
            type="primary"
            plain
            icon="plus"
            to="/houses"
          >
            管理房源
          </van-button>
        </div>
        <div class="house-list">
          <van-cell
            v-for="house in houses"
            :key="house.id"
            :title="house.title"
            :label="house.address"
            is-link
            @click="showHouseDetail(house)"
          >
            <template #right-icon>
              <van-tag :type="getStatusType(house.status)">
                {{ getStatusText(house.status) }}
              </van-tag>
            </template>
          </van-cell>
        </div>
      </div>

      <!-- 租客列表 -->
      <div class="tenant-list-section">
        <div class="section-header">
          <span class="section-title">最近租客</span>
          <van-button
            size="small"
            type="primary"
            plain
            icon="plus"
            to="/tenants"
          >
            管理租客
          </van-button>
        </div>
        <div class="tenant-list">
          <van-cell
            v-for="tenant in recentTenants"
            :key="tenant.id"
            :title="tenant.name"
            :label="tenant.phone"
            is-link
            @click="showTenantDetail(tenant)"
          >
            <template #right-icon>
              <span class="tenant-house">{{ tenant.house?.title || "-" }}</span>
            </template>
          </van-cell>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { houseApi, statisticsApi, tenantApi } from "../api";
import type { House, Tenant } from "../types";

const router = useRouter();
const houses = ref<House[]>([]);
const recentTenants = ref<Tenant[]>([]);
const statistics = ref({
  totalHouses: 0,
  rentedHouses: 0,
  availableHouses: 0,
  occupancyRate: "0.0",
  totalIncome: 0,
  totalTenants: 0,
});

const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN", { minimumFractionDigits: 2 });
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

const showHouseDetail = (house: House) => {
  router.push({
    name: "HouseDetail",
    params: { id: house.id.toString() },
  });
};

const showTenantDetail = (tenant: Tenant) => {
  router.push(`/tenants/${tenant.id}`);
};

const loadData = async () => {
  try {
    const [housesResponse, statsResponse, tenantsResponse] = await Promise.all([
      houseApi.getHouses(),
      statisticsApi.getOverview(),
      tenantApi.getTenants(),
    ]);

    // 更新房屋状态
    const houseList = housesResponse.data;
    const tenants = tenantsResponse.data;

    // 根据租客信息更新房屋状态
    houseList.forEach((house) => {
      if (house.tenants?.length > 0) {
        house.status = "rented";
      }
    });

    houses.value = houseList;
    const statsData = statsResponse.data;
    const occupancyRate = (
      (statsData.rentedHouses / statsData.totalHouses) *
      100
    ).toFixed(2);
    statsData.occupancyRate = occupancyRate;
    statistics.value = statsData;
    recentTenants.value = tenants.slice(0, 5);
  } catch (error) {
    console.error("Failed to load data:", error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  padding: 16px;
}

.quick-actions {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--van-text-color);
}

.overview-section,
.house-list-section,
.tenant-list-section {
  margin-bottom: 24px;
}

.overview-card {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.overview-card__value {
  font-size: 20px;
  font-weight: bold;
  color: var(--van-primary-color);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overview-card__label {
  margin-top: 8px;
  font-size: 14px;
  color: var(--van-text-color-2);
}

.house-list,
.tenant-list {
  background: #fff;
  border-radius: 8px;
}

.tenant-house {
  font-size: 12px;
  color: var(--van-text-color-2);
}

:deep(.van-grid-item__content) {
  padding: 16px 8px;
}

:deep(.van-grid-item__icon) {
  font-size: 28px;
}

:deep(.van-grid-item__text) {
  margin-top: 8px;
  color: var(--van-text-color);
  font-size: 14px;
}

:deep(.van-tag) {
  height: 24px;
  padding: 0 6px;
}
</style>

