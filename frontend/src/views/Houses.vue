<template>
  <div class="houses-container">
    <CommonNavBar />

    <div class="content-wrapper">
      <van-button
        v-if="showManageButtons"
        class="add-button"
        type="primary"
        block
        @click="showAddDialog = true"
      >
        添加房源
      </van-button>

      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadData"
        class="house-list"
      >
        <van-swipe-cell
          v-for="house in houses"
          :key="house.id"
          class="house-item"
        >
          <van-card class="house-card">
            <template #title>
              <div class="house-title">{{ house.title }}</div>
            </template>
            <template #desc>
              <div class="house-address">
                <van-icon name="location" />
                {{ house.address }}
              </div>
            </template>
            <template #tags>
              <van-tag :type="getStatusType(house.status)" class="status-tag">
                {{ getStatusText(house.status) }}
              </van-tag>
              <div class="amenities-tags" v-if="house.amenities?.length">
                <van-tag
                  v-for="item in house.amenities"
                  :key="item"
                  plain
                  type="primary"
                  class="amenity-tag"
                >
                  {{ item }}
                </van-tag>
              </div>
            </template>
            <template #price>
              <div class="price">¥{{ house.baseRent }}/月</div>
            </template>
            <template #bottom>
              <div class="house-info">
                <span class="info-item">
                  <van-icon name="expand" />
                  {{ house.area }}㎡
                </span>
                <span class="info-item">
                  <van-icon name="water" />
                  {{ house.waterRate }}元/吨
                </span>
                <span class="info-item">
                  <van-icon name="flash" />
                  {{ house.electricityRate }}元/度
                </span>
              </div>
              <div class="house-description" v-if="house.description">
                {{ house.description }}
              </div>
            </template>
          </van-card>

          <template #right v-if="showManageButtons">
            <div class="swipe-buttons">
              <van-button
                class="swipe-btn"
                type="primary"
                @click="editHouse(house)"
              >
                <div class="btn-content">
                  <van-icon name="edit" />
                  <span>编辑</span>
                </div>
              </van-button>
              <van-button
                class="swipe-btn delete"
                type="danger"
                @click="deleteHouse(house.id)"
              >
                <div class="btn-content">
                  <van-icon name="delete" />
                  <span>删除</span>
                </div>
              </van-button>
            </div>
          </template>
        </van-swipe-cell>
      </van-list>
    </div>

    <!-- 添加/编辑房源弹窗 -->
    <van-dialog
      v-model:show="showAddDialog"
      :title="currentHouse ? '编辑房源' : '添加房源'"
      show-cancel-button
      @confirm="onSubmit"
      @cancel="onCancel"
      class="house-dialog"
    >
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formData.title"
            label="房源标题"
            placeholder="请输入房源标题"
            required
            :rules="[{ required: true, message: '请填写房源标题' }]"
          />
          <van-field
            v-model="formData.address"
            label="地址"
            placeholder="请输入地址"
            required
            :rules="[{ required: true, message: '请填写地址' }]"
          />
          <van-field
            v-model="formData.baseRent"
            label="基础租金"
            placeholder="请输入月租金"
            type="number"
            required
            :rules="[{ required: true, message: '请填写月租金' }]"
          >
            <template #right-icon>元/月</template>
          </van-field>
          <van-field
            v-model="formData.waterRate"
            label="水费单价"
            placeholder="请输入水费单价"
            type="number"
            required
            :rules="[{ required: true, message: '请填写水费单价' }]"
          >
            <template #right-icon>元/吨</template>
          </van-field>
          <van-field
            v-model="formData.electricityRate"
            label="电费单价"
            placeholder="请输入电费单价"
            type="number"
            required
            :rules="[{ required: true, message: '请填写电费单价' }]"
          >
            <template #right-icon>元/度</template>
          </van-field>
          <van-field
            v-model="formData.area"
            label="面积"
            placeholder="请输入面积"
            type="number"
            required
            :rules="[{ required: true, message: '请填写面积' }]"
          >
            <template #right-icon>㎡</template>
          </van-field>
          <van-field
            v-model="formData.initialWaterReading"
            label="初始水表读数"
            type="number"
            required
            placeholder="请输入初始水表读数"
          >
            <template #right-icon>吨</template>
          </van-field>
          <van-field
            v-model="formData.initialElectricityReading"
            label="初始电表读数"
            type="number"
            required
            placeholder="请输入初始电表读数"
          >
            <template #right-icon>度</template>
          </van-field>
          <van-field
            v-model="statusText"
            label="状态"
            placeholder="请选择状态"
            readonly
            required
            :rules="[{ required: true, message: '请选择状态' }]"
            @click="showStatusPicker = true"
          />
          <van-field
            v-model="formData.description"
            label="描述"
            type="textarea"
            placeholder="请输入房源描述（选填）"
            rows="2"
            autosize
          />
          <van-field
            v-model="amenitiesText"
            label="设施"
            placeholder="请输入设施，用逗号分隔（选填）"
            @input="handleAmenitiesInput"
          />
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusOptions"
        @confirm="onStatusSelect"
        @cancel="showStatusPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showNotify } from "vant";
import { houseApi } from "../api";
import type { House } from "../types";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();
const houses = ref<House[]>([]);
const loading = ref(false);
const finished = ref(false);
const showAddDialog = ref(false);
const showStatusPicker = ref(false);
const currentHouse = ref<House | null>(null);

const formDataDefault = {
  title: "",
  address: "",
  baseRent: "",
  waterRate: "",
  electricityRate: "",
  area: "",
  status: "available",
  description: "",
  amenities: [] as string[],
  initialWaterReading: 0,
  initialElectricityReading: 0,
};

const formData = reactive({ ...formDataDefault });
const amenitiesText = computed(() => formData.amenities.join(","));

const statusOptions = [
  { text: "可租", value: "available" },
  { text: "已租", value: "rented" },
  { text: "维护中", value: "maintenance" },
];

const getStatusText = (status: string) => {
  const option = statusOptions.find((opt) => opt.value === status);
  return option ? option.text : status;
};

const getStatusType = (status: string) => {
  switch (status) {
    case "available":
      return "success";
    case "rented":
      return "warning";
    case "maintenance":
      return "danger";
    default:
      return "default";
  }
};

const loadData = async () => {
  try {
    const { data } = await houseApi.getHouses();
    houses.value = data;
    finished.value = true;
  } catch (error) {
    showNotify({ type: "danger", message: "加载失败" });
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  try {
    const submitData = {
      ...formData,
      baseRent: Number(formData.baseRent),
      waterRate: Number(formData.waterRate),
      electricityRate: Number(formData.electricityRate),
      area: Number(formData.area),
      initialWaterReading: Number(formData.initialWaterReading || 0),
      initialElectricityReading: Number(formData.initialElectricityReading || 0),
      amenities:
        formData.amenities instanceof Array
          ? formData.amenities
          : formData.amenities.split(",").filter(Boolean),
    };

    if (currentHouse.value) {
      await houseApi.updateHouse(currentHouse.value.id, submitData);
      showNotify({ type: "success", message: "更新成功" });
    } else {
      await houseApi.createHouse(submitData);
      showNotify({ type: "success", message: "添加成功" });
    }

    showAddDialog.value = false;
    loadData();
  } catch (error: any) {
    showNotify({
      type: "danger",
      message: error.response?.data?.message || "操作失败",
    });
  }
};

const onStatusSelect = (item: { text: string; value: string }) => {
  formData.status = item.value;
  showStatusPicker.value = false;
};

const editHouse = (house: House) => {
  currentHouse.value = house;
  Object.assign(formData, {
    ...house,
    amenities: house.amenities || [],
  });
  showAddDialog.value = true;
};

const deleteHouse = async (id: number) => {
  try {
    await showConfirmDialog({
      title: "确认删除",
      message: "确定要删除该房源吗？删除后无法恢复",
      confirmButtonText: "确认删除",
      confirmButtonColor: "#ee0a24",
    });

    await houseApi.deleteHouse(id);

    showNotify({ type: "success", message: "删除成功" });
    loadData();
  } catch (error: any) {
    if (!error.toString().includes("cancel")) {
      showNotify({ type: "danger", message: "删除失败" });
    }
  }
};

const onCancel = () => {
  Object.assign(formData, formDataDefault);
  currentHouse.value = null;
};

// 控制编辑和删除按钮的显示
const showManageButtons = computed(() => userStore.isAdmin);

// 新增状态文本的计算属性
const statusText = computed(() => {
  return getStatusText(formData.status);
});

// 新增设施文本的计算属性和处理方法
const handleAmenitiesInput = (value: string) => {
  formData.amenities = value.split(",").filter(Boolean);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.houses-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 16px;
}

.add-button {
  margin: 0 0 16px 0;
}

.house-item {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.house-card {
  background-color: #fff;
  padding: 16px;
}

.house-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

.house-address {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #969799;
  font-size: 14px;
}

.status-tag {
  margin-right: 8px;
}

.amenities-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.amenity-tag {
  font-size: 12px;
}

.house-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.house-description {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.price {
  color: var(--van-danger-color);
  font-weight: bold;
  font-size: 16px;
}

.swipe-buttons {
  height: 100%;
  display: flex;
}

.swipe-btn {
  height: 100%;
  width: 60px;
  margin: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swipe-btn.delete {
  background-color: var(--van-danger-color);
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.btn-content .van-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.btn-content span {
  font-size: 12px;
}

:deep(.van-card__header) {
  padding-top: 0;
}

:deep(.van-card__bottom) {
  margin-top: 8px;
}

:deep(.van-dialog__content) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
