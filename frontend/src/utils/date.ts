import dayjs from 'dayjs';

export const dateUtils = {
  format: (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
    return dayjs(date).format(format);
  },

  formatDate: (date: string | Date) => {
    return dayjs(date).format('YYYY-MM-DD');
  },

  formatDateTime: (date: string | Date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss.SSS');
  },

  formatMonth: (date: string | Date) => {
    return dayjs(date).format('YYYY-MM');
  },

  now: () => {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  },

  today: () => {
    return dayjs().format('YYYY-MM-DD');
  }
};