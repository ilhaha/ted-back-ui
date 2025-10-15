<template>
  <div class="menu-demo">
    <a-menu
      :mode="mode"
      :selected-keys="activeMenu"
      :auto-open-selected="autoOpenSelected"
      :accordion="appStore.menuAccordion"
      :breakpoint="appStore.layout === 'mix' ? 'xl' : undefined"
      :trigger-props="{ animationName: 'slide-dynamic-origin' }"
      :collapsed="!isDesktop ? false : appStore.menuCollapse"
      :style="{ height: '100%', ...menuStyle }"
      @menu-item-click="onMenuItemClick"
      @collapse="onCollapse"
    >
      <MenuItem v-for="(item, index) in sidebarRoutes" :key="item.path + index" :item="item"></MenuItem>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import type { CSSProperties } from 'vue'
import MenuItem from './MenuItem.vue'
import { useAppStore, useRouteStore } from '@/stores'
import { isExternal } from '@/utils/validate'
import { useDevice } from '@/hooks'

defineOptions({ name: 'AppMenu' })
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  (e: 'menu-item-click-after'): void
}>()

interface Props {
  menus?: RouteRecordRaw[]
  menuStyle?: CSSProperties
}

const { isDesktop } = useDevice()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const routeStore = useRouteStore()
const sidebarRoutes = computed(() => (props.menus ? props.menus : routeStore.routes))

// 菜单垂直模式/水平模式
const mode = computed(() => {
  if (!['left', 'mix'].includes(appStore.layout)) {
    return 'horizontal'
  } else {
    return 'vertical'
  }
})

// 是否默认展开选中的菜单
const autoOpenSelected = computed(() => {
  // 垂直模式下，默认展开选中的菜单
  return ['left', 'mix'].includes(appStore.layout)
})

// 当前页面激活菜单路径，先从路由里面找
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return [meta.activeMenu]
  }
  return [path]
})

// 菜单项点击事件
const onMenuItemClick = (key: string) => {
  if (isExternal(key)) {
    window.open(key)
    return
  }
  router.push({ path: key })
  emit('menu-item-click-after')
}

// 折叠状态改变时触发
const onCollapse = (collapsed: boolean) => {
  if (appStore.layout === 'mix') {
    appStore.menuCollapse = collapsed
  }
}
</script>

<style scoped lang="scss">
.menu-demo {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.arco-menu) {
    flex: 1;
    background-color: #26262b;

    // 菜单项背景
    .arco-menu-item {
      background-color: #26262b;
      color: rgba(255, 255, 255, 0.85);
      &:hover {
        background-color: #26262b;
      }
    }

    // 选中的菜单项
    .arco-menu-item.arco-menu-selected {
      background-color: #1890ff;
      color: #ffffff;
    }

    // 子菜单
    .arco-menu-inline-header {
      background-color: #26262b;
      color: rgba(255, 255, 255, 0.85);
      &:hover {
        background-color: #26262b;
      }
    }

    // 展开的子菜单
    .arco-menu-inline {
      background-color: #26262b;
    }

    // 子菜单标题
    .arco-menu-sub-title {
      color: rgba(255, 255, 255, 0.85);
    }

    // 折叠时的弹出菜单
    .arco-menu-pop {
      background-color: #26262b;
      .arco-menu-item {
        background-color: #26262b;
      }
    }
  }
}
</style>
