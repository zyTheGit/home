<template>
  <div class="tenants page-container">
    <van-nav-bar title="租客管理" />

    <van-button class="action-button" type="primary" block @click="showAddDialog = true">
      <van-icon name="plus" /> 添加租客
    </van-button>

    <div class="tenant-list">
      <van-swipe-cell v-for="tenant in tenants" :key="tenant.id" :before-close="beforeClose">
        <div class="card" @click="viewTenant(tenant)">
          <div class="tenant-header">
            <div class="tenant-info">
              <span class="tenant-name">{{ tenant.name }}</span>
              <van-tag :type="tenant.endDate ? 'warning' : 'success'" round size="small">
                {{ tenant.endDate ? "已退租" : "在租" }}
              </van-tag>
            </div>
          </div>
          <div class="tenant-content">
            <div class="info-item">
              <van-icon name="phone-o" />
              <span>{{ tenant.phone }}</span>
            </div>
            <div class="info-item">
              <van-icon name="clock-o" />
              <span>入住时间：{{ formatDate(tenant.startDate) }}</span>
            </div>
            <div class="info-item">
              <van-icon name="home-o" />
              <span>所租房源：{{ tenant.house?.title || "未分配" }}</span>
            </div>
          </div>
        </div>

        <!-- 左滑操作按钮 -->
        <template #right>
          <div class="swipe-buttons">
            <van-button square type="primary" class="swipe-btn" @click="editTenant(tenant)">
              <div class="btn-content">
                <van-icon name="edit" />
                <span>编辑</span>
              </div>
            </van-button>
            <van-button square type="danger" class="swipe-btn" @click="() => deleteTenant(tenant.id)">
              <div class="btn-content">
                <van-icon name="delete" />
                <span>删除</span>
              </div>
            </van-button>
          </div>
        </template>
      </van-swipe-cell>
    </div>

    <!-- 添加/编辑租客弹窗 -->
    <van-dialog v-model:show="showAddDialog" :title="currentTenant ? '编辑租客' : '添加租客'" show-cancel-button
      :before-close="handleDialogClose" class="custom-dialog">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field v-model="formData.name" name="name" label="姓名" placeholder="请输入租客姓名"
            :rules="[{ required: true, message: '请填写姓名' }]" />
          <van-field v-model="formData.phone" name="phone" label="联系电话" placeholder="请输入联系电话"
            :rules="[{ required: true, message: '请填写联系电话' }]" />
          <van-field v-model="formData.idCard" name="idCard" label="身份证号" placeholder="请输入身份证号"
            :rules="[{ required: true, message: '请填写身份证号' }]" />
          <van-field v-model="formData.startDate" name="startDate" label="入住日期" type="date"
            :rules="[{ required: true, message: '请选择入住日期' }]" />
          <van-field v-model="formData.endDate" name="endDate" label="退租日期" type="date" />
          <van-field v-model="formData.houseId" name="houseId" label="所租房源" is-link readonly
            :model-value="selectedHouse?.title" placeholder="请选择房源" :rules="[{ required: true, message: '请填写房源' }]"
            @click="showHouseSelector = true" />
        </van-cell-group>
      </van-form>
    </van-dialog>

    <!-- 房源选择器 -->
    <van-popup v-model:show="showHouseSelector" position="bottom" round>
      <van-picker title="选择房源" :columns="availableHouses.map((h) => ({ text: h.title, value: h.id }))"
        @confirm="onHouseSelect" @cancel="showHouseSelector = false" show-toolbar />
    </van-popup>

    <!-- 租客详情弹窗 -->
    <van-dialog v-model:show="showDetailDialog" title="租客详情" class="detail-dialog" show-cancel-button
      cancel-button-text="关闭" confirm-button-text="编辑" @confirm="editTenant(selectedTenant)">
      <div class="detail-content" v-if="selectedTenant">
        <van-cell-group inset>
          <van-cell title="姓名" :value="selectedTenant.name" />
          <van-cell title="联系电话" :value="selectedTenant.phone" />
          <van-cell title="身份证号" :value="selectedTenant.idCard" />
          <van-cell title="入住日期" :value="formatDate(selectedTenant.startDate)" />
          <van-cell title="退租日期" :value="selectedTenant.endDate
            ? formatDate(selectedTenant.endDate)
            : '未退租'
            " />
          <van-cell title="所租房源" :value="selectedTenant.house?.title || '未分配'" />
        </van-cell-group>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { showSuccessToast, Dialog, showFailToast } from "vant";
import { tenantApi, houseApi } from "../api";
import type { Tenant, House } from "../types";

const tenants = ref<Tenant[]>([]);
const showAddDialog = ref(false);
const showHouseSelector = ref(false);
const showDetailDialog = ref(false);
const currentTenant = ref<Tenant | null>(null);
const selectedTenant = ref<Tenant | null>(null);
const availableHouses = ref<House[]>([]);
const selectedHouse = ref<House | null>(null);

const formData = reactive({
  name: "",
  phone: "",
  idCard: "",
  startDate: "",
  endDate: "",
  houseId: null as number | null,
});

const loadTenants = async () => {
  try {
    const data = await tenantApi.getTenants();
    tenants.value = data;
  } catch (error) {
    showFailToast("加载租客数据失败");
  }
};

const loadAvailableHouses = async () => {
  try {
    const data = await houseApi.getHouses();
    availableHouses.value = data;
  } catch (error) {
    showFailToast("加载房源失败");
  }
};

const resetForm = () => {
  Object.assign(formData, {
    name: "",
    phone: "",
    idCard: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    houseId: undefined,
  });
  selectedHouse.value = null;
};

watch(showAddDialog, (newVal) => {
  if (!newVal) {
    resetForm();
    currentTenant.value = null;
  }
});

const handleSubmit = async () => {
  // 添加校验逻辑
  const formFields = [
    { field: 'name', label: '姓名', rules: [{ required: true, message: '请填写姓名' }] },
    { field: 'phone', label: '联系电话', rules: [{ required: true, message: '请填写联系电话' }] },
    { field: 'idCard', label: '身份证号', rules: [{ required: true, message: '请填写身份证号' }] },
    { field: 'startDate', label: '入住日期', rules: [{ required: true, message: '请填写入住日期' }] },
    { field: 'houseId', label: '房源', rules: [{ required: true, message: '请选择房源' }] },
  ];

  for (const { field, label, rules } of formFields) {
    const isRequired = rules.some(rule => rule.required);
    if (isRequired && !formData[field] && field !== 'houseId') {
      showFailToast(`请填写${label}`);
      return false;
    }
  }

  // 验证房源是否已选择
  if (!selectedHouse.value?.id) {
    showFailToast('请选择房源');
    return false;
  }

  try {
    // 格式化日期为YYYY-MM-DD格式
    const formatDate = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];  // 这会返回YYYY-MM-DD格式
    };

    const data = {
      ...formData,
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      houseId: Number(selectedHouse.value.id), // 确保houseId是数字类型
    };

    if (currentTenant.value) {
      await tenantApi.updateTenant(currentTenant.value.id, data);
      showSuccessToast("更新成功");
    } else {
      await tenantApi.createTenant(data);
      showSuccessToast("添加成功");
    }
    
    showAddDialog.value = false;
    loadTenants();
    return true;
  } catch (error) {
    showFailToast(error.response?.data?.message || "操作失败");
    return false;
  }
};

const viewTenant = (tenant: Tenant) => {
  selectedTenant.value = tenant;
  showDetailDialog.value = true;
};

const editTenant = (tenant: Tenant) => {
  currentTenant.value = tenant;
  Object.assign(formData, {
    ...tenant,
    houseId: tenant.house?.id,
  });
  selectedHouse.value = tenant.house;
  showAddDialog.value = true;
};

const deleteTenant = async (id: number) => {
  try {
    await Dialog.confirm({
      title: "确认删除",
      message: "确定要删除该租客吗？删除后无法恢复",
      confirmButtonText: "确认删除",
      confirmButtonColor: "#ee0a24",
    });

    await tenantApi.deleteTenant(id);
    showSuccessToast("删除成功");
    loadTenants();
  } catch (error) {
    if (error?.toString().includes("cancel")) {
      return;
    }
    showFailToast('删除失败');
  }
};

const onHouseSelect = ({ selectedValues }) => {
  const value = selectedValues[0];
  const house = availableHouses.value.find((h) => h.id === value);
  if (house) {
    selectedHouse.value = house;
    formData.houseId = house.id;
  }
  showHouseSelector.value = false;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const beforeClose = ({ position }) => {
  return true;
};

const handleDialogClose = (action: string) => {
  if (action === 'confirm') {
    handleSubmit();
  } else {
    showDialog({
      title: "确认关闭",
      message: "确定要关闭吗？",
      confirmButtonText: "确认关闭",
    }).then(() => {
      showAddDialog.value = false;

      return true
    });
  }
};

onMounted(() => {
  loadTenants();
  loadAvailableHouses();
});
</script>

<style scoped>
.page-container {
  padding: 16px;
  padding-bottom: 50px;
  background: var(--background-color);
}

.action-button {
  margin-bottom: 16px;
}

.tenant-list {
  margin-top: 16px;
}

.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.tenant-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.tenant-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tenant-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.tenant-content {
  padding: 12px 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.info-item .van-icon {
  margin-right: 8px;
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

:deep(.van-tag--round) {
  height: 20px;
  line-height: 18px;
  padding: 0 8px;
  font-size: 12px;
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
</style>
