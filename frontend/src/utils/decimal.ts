import { Decimal } from 'decimal.js';

// 设置全局配置
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export const calculateMoney = {
  add: (a: number | string, b: number | string) => {
    return new Decimal(a || 0).plus(b || 0).toFixed(2);
  },
  
  subtract: (a: number | string, b: number | string) => {
    return new Decimal(a || 0).minus(b || 0).toFixed(2);
  },
  
  multiply: (a: number | string, b: number | string) => {
    return new Decimal(a || 0).times(b || 0).toFixed(2);
  },
  
  divide: (a: number | string, b: number | string) => {
    if (new Decimal(b || 0).equals(0)) {
      return '0.00';
    }
    return new Decimal(a || 0).dividedBy(b || 1).toFixed(2);
  },
  
  format: (num: number | string) => {
    return new Decimal(num || 0).toFixed(2);
  }
};

// 添加新的格式化方法
export const formatCurrency = (num: number | string) => {
  return new Decimal(num).toDecimalPlaces(2).toNumber().toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  })
}