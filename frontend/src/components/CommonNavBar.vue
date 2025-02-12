<template>
  <van-nav-bar
    :title="route.meta?.title || '租房管理系统'"
    :left-text="shouldShowBack ? '返回' : ''"
    :left-arrow="shouldShowBack"
    @click-left="handleBack"
    :right-text="userStore.isLoggedIn ? '退出' : ''"
    @click-right="handleLogout"
  >
    <template #right v-if="!userStore.isLoggedIn">
      <van-button size="small" type="primary" @click="router.push('/login')">
        登录
      </van-button>
    </template>
  </van-nav-bar>
</template>

<script setup lang="ts">
import { showDialog, showToast } from "vant";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";
import { useUserStore } from "../stores/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const shouldShowBack = computed(() => {
  // 管理员专属返回按钮
  if (route.meta?.showBackForAdmin) {
    return userStore.isAdmin;
  }
  // 普通返回按钮逻辑
  return route.meta?.showBack ?? false;
});

const handleBack = () => {

  router.go(-1);
};

const handleLogout = async () => {
  try {
    await showDialog({
      title: "退出登录",
      message: "确定要退出登录吗？",
      showCancelButton: true,
    });
    userStore.clearUserInfo();
    showToast("已退出登录");
    router.push("/login");
  } catch (error) {
    if (!error?.message?.includes("cancel")) {
      showToast("退出失败");
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

:deep(.van-button) {
  height: 28px;
  line-height: 28px;
}
</style>
