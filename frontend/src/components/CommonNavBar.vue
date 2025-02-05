<template>
  <van-nav-bar
    :title="title"
    left-arrow
    @click-left="$router.back()"
  >
    <template #right>
      <van-icon name="logout" @click="handleLogout" />
    </template>
  </van-nav-bar>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast, showFailToast } from 'vant';
import { authApi } from '../api';

const props = defineProps<{
  title: string;
}>();

const userStore = useUserStore();
const router = useRouter();

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
    });

    await authApi.logout();
    userStore.clearUser();
    showToast('已退出登录');
    router.push('/login');
  } catch (error: any) {
    if (!error.toString().includes('cancel')) {
      showFailToast('退出失败');
    }
  }
};
</script>

<style scoped>
:deep(.van-nav-bar) {
  background-color: var(--primary-color);
}

:deep(.van-nav-bar__title) {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

:deep(.van-icon) {
  color: white !important;
}

:deep(.van-nav-bar__text) {
  color: white;
}
</style>