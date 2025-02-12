declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-virtual-scroller' {
  export const RecycleScroller: any
  export const DynamicScroller: any
  export const DynamicScrollerItem: any
} 