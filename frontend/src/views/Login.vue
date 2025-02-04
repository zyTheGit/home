<template>
  <div class="login-container">
    <div class="login-header">
      <img src="/logo.png" alt="Logo" class="logo" />
      <h2>租房管理系统</h2>
      <p class="subtitle">专业的房屋租赁管理平台</p>
    </div>

    <div class="login-box">
      <van-form @submit="onSubmit" class="login-form">
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="username"
            label=""
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          >
            <template #left-icon>
              <van-icon name="user-o" class="field-icon" />
            </template>
          </van-field>
          <van-field
            v-model="password"
            type="password"
            name="password"
            label=""
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          >
            <template #left-icon>
              <van-icon name="lock" class="field-icon" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="form-footer">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            size="large"
          >
            登录
          </van-button>
        </div>
      </van-form>
    </div>

    <div class="login-footer">
      <p>© 2024 租房管理系统 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const username = ref('')
const password = ref('')
const loading = ref(false)
const userStore = useUserStore()
const router = useRouter()

const onSubmit = async () => {
  loading.value = true
  try {
    // 这里添加实际的登录逻辑
    const token = 'dummy-token' // 替换为实际的token
    userStore.setToken(token)
    showToast({
      message: '登录成功',
      type: 'success'
    })
    router.push('/')
  } catch (error) {
    showToast({
      message: '登录失败，请检查用户名和密码',
      type: 'fail'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-header {
  text-align: center;
  margin: 40px 0;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.login-header h2 {
  font-size: 24px;
  color: var(--text-color);
  margin: 0;
  font-weight: 600;
}

.subtitle {
  color: var(--text-color-secondary);
  margin-top: 8px;
  font-size: 14px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.login-form {
  margin-top: 20px;
}

:deep(.van-cell-group--inset) {
  margin: 0;
}

:deep(.van-field) {
  padding: 16px;
}

.field-icon {
  font-size: 18px;
  color: var(--text-color-secondary);
}

.form-footer {
  margin-top: 24px;
  padding: 0 16px;
}

:deep(.van-button--primary) {
  height: 44px;
  font-size: 16px;
  background: linear-gradient(to right, var(--primary-color), #39a0ff);
}

.login-footer {
  margin-top: auto;
  padding: 20px 0;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 12px;
}

/* 添加输入框动画效果 */
:deep(.van-field__control) {
  transition: all 0.3s ease;
}

:deep(.van-field__control:focus) {
  transform: translateX(4px);
}

/* 添加按钮悬停效果 */
:deep(.van-button--primary:active) {
  transform: scale(0.98);
}
</style> 
</script> 