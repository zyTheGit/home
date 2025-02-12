export const paymentRules = {
  waterUsage: [
    { 
      validator: (v: string) => /^\d+$/.test(v), 
      message: '请输入有效用水量' 
    }
  ],
  electricityUsage: [
    {
      validator: (v: string) => Number(v) > 0,
      message: '用电量必须大于0'
    }
  ]
  // 统一其他表单验证规则
}

// 添加手机号验证等通用规则
export const phoneValidator = (v: string) => /^1[3-9]\d{9}$/.test(v) 