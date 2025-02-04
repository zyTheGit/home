<template>
  <div class="houses page-container">
    <van-nav-bar title="房源管理" />

    <van-button class="action-button" type="primary" block @click="showAddDialog = true">
      <van-icon name="plus" /> 添加房源
    </van-button>

    <div class="house-list">
      <van-swipe-cell v-for="house in houses" :key="house.id" :before-close="beforeClose">
        <div class="card" @click="viewHouse(house)">
          <van-cell :title="house.title" :label="house.address">
            <template #right-icon>
              <van-tag :type="house.status === 'available' ? 'success' : 'warning'" round size="small">
                {{ house.status === "available" ? "可租" : "已租" }}
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

        <!-- 左滑操作按钮 -->
        <template #right>
          <div class="swipe-buttons">
            <van-button square type="primary" class="swipe-btn" @click="editHouse(house)">
              <div class="btn-content">
                <van-icon name="edit" />
                <span>编辑</span>
              </div>
            </van-button>
            <van-button square type="danger" class="swipe-btn" @click="() => deleteHouse(house.id)">
              <div class="btn-content">
                <van-icon name="delete" />
                <span>删除</span>
              </div>
            </van-button>
          </div>
        </template>
      </van-swipe-cell>
    </div>

    <!-- 添加/编辑房源弹窗 -->
    <van-dialog v-model:show="showAddDialog" :title="currentHouse ? '编辑房源' : '添加房源'" show-cancel-button
      :before-close="handleDialogClose" class="custom-dialog">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field v-model="formData.title" name="title" label="标题" placeholder="请输入房源标题"
            :rules="[{ required: true, message: '请填写标题' }]" />
          <van-field v-model="formData.address" name="address" label="地址" placeholder="请输入地址"
            :rules="[{ required: true, message: '请填写地址' }]" />
          <van-field v-model.number="formData.baseRent" name="baseRent" label="基础租金" placeholder="请输入基础租金"
            :rules="[{ required: true, message: '请填写基础租金' }]">
            <template #right-icon>
              <span class="field-unit">元/月</span>
            </template>
          </van-field>
          <van-field v-model.number="formData.waterRate" name="waterRate" label="水费单价" placeholder="请输入水费单价"
            :rules="[{ required: true, message: '请填写水费单价' }]">
            <template #right-icon>
              <span class="field-unit">元/吨</span>
            </template>
          </van-field>
          <van-field v-model.number="formData.electricityRate" name="electricityRate" label="电费单价" placeholder="请输入电费单价"
            :rules="[{ required: true, message: '请填写电费单价' }]">
            <template #right-icon>
              <span class="field-unit">元/度</span>
            </template>
          </van-field>
          <van-field v-model.number="formData.area" name="area" label="面积" placeholder="请输入面积"
            :rules="[{ required: true, message: '请填写面积' }]">
            <template #right-icon>
              <span class="field-unit">㎡</span>
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 房源详情弹窗 -->
    <van-dialog v-model:show="showDetailDialog" title="房源详情" class="detail-dialog" show-cancel-button
      cancel-button-text="关闭" confirm-button-text="编辑" @cancel="onCancel" @confirm="editHouse(selectedHouse)">
      <div class="detail-content" v-if="selectedHouse">
        <van-cell-group inset v-once>
          <van-cell title="房源标题" :value="selectedHouse.title" />
          <van-cell title="地址" :value="selectedHouse.address" />
          <van-cell title="基础租金" :value="`¥${formatNumber(selectedHouse.baseRent)}/月`" />
          <van-cell title="水费单价" :value="`¥${selectedHouse.waterRate}/吨`" />
          <van-cell title="电费单价" :value="`¥${selectedHouse.electricityRate}/度`" />
          <van-cell title="面积" :value="`${selectedHouse.area}㎡`" />
          <van-cell title="状态">
            <template #right-icon>
              <van-tag :type="selectedHouse.status === 'available' ? 'success' : 'warning'" round>
                {{ selectedHouse.status === "available" ? "可租" : "已租" }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { showSuccessToast, showConfirmDialog } from "vant";
import { houseApi } from "../api";
import type { House } from "../types";

const houses = ref<House[]>([]);
const loading = ref(false);
const finished = ref(false);
const showAddDialog = ref(false);
const showDetailDialog = ref(false);
const currentHouse = ref<House | null>(null);
const selectedHouse = ref<House | null>(null);
const formDataDefault = {
  title: "",
  address: "",
  baseRent: 0,
  waterRate: 0,
  electricityRate: 0,
  area: 0,
  status: "available" as const,
};
const formData = reactive(formDataDefault);

const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

const beforeClose = ({ position }) => {
  return true;
};

const viewHouse = (house: House) => {
  selectedHouse.value = house;
  showDetailDialog.value = true;
};

const loadData = async () => {
  loading.value = true;
  try {
    const data = await houseApi.getHouses();
    houses.value = data;
    finished.value = true;
  } catch (error) {
    showFailToast("加载失败");
  }
  loading.value = false;
};

const handleSubmit = async () => {
  try {
    if (currentHouse.value) {
      await houseApi.updateHouse(currentHouse.value.id, formData);
      showSuccessToast("更新成功");
    } else {
      await houseApi.createHouse(formData);
      showSuccessToast("添加成功");
    }

    showAddDialog.value = false;
    loadData();
    return true;
  } catch (error) {
    showFailToast(error.response?.data?.message || "操作失败");
    return false;
  }
};

const handleDialogClose = (action: string) => {
  if (action === 'confirm' ) {

    // 添加校验逻辑
    const formFields = [
      {
        field: "title",
        label: "标题",
        rules: [{ required: true, message: "请填写标题" }],
      },
      {
        field: "address",
        label: "地址",
        rules: [{ required: true, message: "请填写地址" }],
      },
      {
        field: "baseRent",
        label: "基础租金",
        rules: [{ required: true, message: "请填写基础租金" }],
      },
      {
        field: "waterRate",
        label: "水费单价",
        rules: [{ required: true, message: "请填写水费单价" }],
      },
      {
        field: "electricityRate",
        label: "电费单价",
        rules: [{ required: true, message: "请填写电费单价" }],
      },
      {
        field: "area",
        label: "面积",
        rules: [{ required: true, message: "请填写面积" }],
      },
    ];

    for (const { field, label } of formFields) {
      if (!formData[field]) {
        showFailToast(`请填写${label}`);
        return false;
      }
    }

    handleSubmit();
    return true;
  } else {
    onCancel();
    return true;
  }
};

const editHouse = (house: House) => {
  currentHouse.value = house;
  Object.assign(formData, house);
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
    showSuccessToast('删除成功');
    loadData();
  } catch (error) {
    if (error?.toString().includes("cancel")) {
      return;
    }
    showFailToast('删除失败');
  }
};

const onCancel = () => {
  formData.value = { ...formDataDefault };
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.house-list {
  margin-top: 16px;
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
  background-color: var(--primary-color);
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

.swipe-btn:last-child {
  background-color: var(--danger-color);
}

.detail-dialog {
  :deep(.van-dialog__content) {
    padding: 16px 0;
  }
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.house-info {
  display: flex;
  padding: 8px 16px 12px;
  border-top: 1px solid var(--border-color);
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  margin-right: 16px;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.info-item .van-icon {
  margin-right: 4px;
  font-size: 16px;
}

.field-unit {
  color: var(--text-color-secondary);
  font-size: 14px;
  margin-right: 4px;
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
