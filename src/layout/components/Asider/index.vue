<template>
  <div
    v-if="isDesktop" class="asider" :class="{ 'app-menu-dark': appStore.menuDark }"
    :style="appStore.menuDark ? appStore.themeCSSVar : undefined"
  >
    <a-layout-sider
      class="menu" collapsible breakpoint="xl" hide-trigger :width="230"
      :collapsed="appStore.menuCollapse" @collapse="handleCollapse"
    >
      <div class="logo-container">
        <h2 class="company-title" :class="{ 'collapsed': appStore.menuCollapse }">
          <div class="gradient-wrapper">
            <div class="title-group">
              <span class="main-title">特种设备考试系统</span>
              <!-- <span class="subtitle"></span> -->
            </div>
            <div class="phone-number">后台管理</div>
          </div>
        </h2>
      </div>
      <a-scrollbar outer-class="menu-scroll-view" style="height: 100%; overflow: auto">
        <Menu></Menu>
      </a-scrollbar>
    </a-layout-sider>
  </div>
</template>

<script setup lang="ts">
import Menu from '../Menu/index.vue'
// import Logo from '../Logo.vue'
import { useAppStore } from '@/stores'
import { useDevice } from '@/hooks'

defineOptions({ name: 'Asider' })
const appStore = useAppStore()
const { isDesktop } = useDevice()

const handleCollapse = (isCollapsed: boolean) => {
  appStore.menuCollapse = isCollapsed
}
</script>

<style scoped lang="scss">
:deep(.arco-menu.arco-menu-vertical.arco-menu-collapsed) {

  // Menu菜单组件修改
  .arco-menu-icon {
    margin-right: 0;
    padding: 10px 0;
  }

  .arco-menu-has-icon {
    padding: 0;
    justify-content: center;
  }

  .arco-menu-title {
    display: none;
  }
}

:deep(.arco-layout-sider-children) {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.asider {
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border-2);
  box-sizing: border-box;
  color: var(--color-text-1);
  background-color: #26262b !important;

  .menu-scroll-view {
    flex: 1;
    overflow: hidden;
  }

  .menu {
    flex: 1;
    overflow: hidden;
    background-color: #26262b !important;
  }
}

.logo-container {
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #26262b;
}

.company-title {
  margin: 0;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;

  .gradient-wrapper {
    background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    display: inline-block;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-size: 200% auto;
    animation: shine 3s linear infinite;
    text-align: center;
  }

  .title-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .main-title {
    font-size: 20px;
  }

  .subtitle {
    font-size: 14px;
  }

  .phone-number {
    font-size: 14px;
    margin-top: 4px;
  }

  &.collapsed {
    .gradient-wrapper {
      background-size: 100%;
    }
    .title-group {
      flex-direction: column;
      gap: 2px;
    }
    .subtitle, .phone-number {
      display: none;
    }
  }
}

@keyframes shine {
  from {
    background-position: -200% 0;
  }
  to {
    background-position: 0 200%;
  }
}

// 当菜单折叠时的样式
:deep(.arco-layout-sider-collapsed) {
  .logo-container {
    padding: 16px 8px;
  }
  
  .company-title {
    font-size: 16px;
    .text-gradient {
      width: 32px;
      overflow: hidden;
    }
  }
}

:deep(.arco-layout-sider) {
  background-color: #26262b !important;
}
</style>
