import Decimal from 'decimal.js';

export const calculateMoney = {
  /**
   * 加法运算
   * @param a 第一个数
   * @param b 第二个数
   * @returns 计算结果，保留2位小数
   */
  add: (a: number | string, b: number | string): number => {
    return Number(new Decimal(a || 0).plus(b || 0).toFixed(2));
  },
  
  /**
   * 减法运算
   * @param a 被减数
   * @param b 减数
   * @returns 计算结果，保留2位小数
   */
  subtract: (a: number | string, b: number | string): number => {
    return Number(new Decimal(a || 0).minus(b || 0).toFixed(2));
  },
  
  /**
   * 乘法运算
   * @param a 第一个数
   * @param b 第二个数
   * @returns 计算结果，保留2位小数
   */
  multiply: (a: number | string, b: number | string): number => {
    return Number(new Decimal(a || 0).times(b || 0).toFixed(2));
  },
  
  /**
   * 除法运算
   * @param a 被除数
   * @param b 除数
   * @returns 计算结果，保留2位小数
   */
  divide: (a: number | string, b: number | string): number => {
    if (new Decimal(b || 0).equals(0)) {
      return 0;
    }
    return Number(new Decimal(a || 0).dividedBy(b || 1).toFixed(2));
  },
  
  /**
   * 格式化金额
   * @param num 需要格式化的数字
   * @returns 格式化后的数字，保留2位小数
   */
  format: (num: number | string): number => {
    return Number(new Decimal(num || 0).toFixed(2));
  }
}; 