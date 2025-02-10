import  * as dayjs from "dayjs";

const isBetween = require("dayjs/plugin/isBetween");
// import isBetween from 'dayjs/plugin/isBetween' // ES 2015

dayjs.extend(isBetween);

export const dateUtils = {
  /**
   * 格式化日期时间
   * @param date 日期
   * @param format 格式，默认 YYYY-MM-DD HH:mm:ss
   */
  formatDateTime: (date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
    return dayjs(date).format(format);
  },

  /**
   * 格式化日期
   * @param date 日期
   * @param format 格式，默认 YYYY-MM-DD
   */
  formatDate: (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
    return dayjs(date).format(format);
  },

  /**
   * 计算两个日期之间的天数差
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param inclusive 是否包含当天，默认 true
   */
  getDaysDiff: (startDate: Date | string, endDate: Date | string, inclusive: boolean = true): number => {
    const diff = dayjs(endDate).diff(dayjs(startDate), 'day');
    return inclusive ? diff + 1 : diff;
  },

  /**
   * 获取指定月份的天数
   * @param date 日期
   */
  getDaysInMonth: (date: Date | string): number => {
    return dayjs(date).daysInMonth();
  },

  /**
   * 日期加上指定时间
   * @param date 日期
   * @param amount 数量
   * @param unit 单位（day, month, year等）
   */
  add: (date: Date | string, amount: number, unit: dayjs.ManipulateType): Date => {
    return dayjs(date).add(amount, unit).toDate();
  },

  /**
   * 日期减去指定时间
   * @param date 日期
   * @param amount 数量
   * @param unit 单位（day, month, year等）
   */
  subtract: (date: Date | string, amount: number, unit: dayjs.ManipulateType): Date => {
    return dayjs(date).subtract(amount, unit).toDate();
  },

  /**
   * 获取当前日期时间
   */
  now(): Date {
    return dayjs().toDate();
  },

  /**
   * 检查日期是否在指定范围内
   * @param date 要检查的日期
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param inclusivity 包含性 '()' - 不包含开始和结束, '[]' - 包含开始和结束, '[)' - 包含开始不包含结束, '(]' - 不包含开始包含结束
   */
  isBetween: (
    date: Date | string,
    startDate: Date | string,
    endDate: Date | string,
    inclusivity: '()' | '[]' | '[)' | '(]' = '[]'
  ): boolean => {
    return (dayjs(date) as any).isBetween(startDate, endDate, null, inclusivity);
  },

  /**
   * 解析日期字符串为 Date 对象
   * @param dateString 日期字符串
   */
  parse: (dateString: string): Date => {
    return dayjs(dateString).toDate();
  }
}; 