import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '../types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null
  )

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const clearUser = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const isAdmin = () => userInfo.value?.role === 'admin'

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearUser,
    isAdmin
  }
}) 