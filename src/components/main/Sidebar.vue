<script setup lang="ts">
import { Icon } from '@iconify/vue'
import navbarConfig from '~/config/navbar'
import type { INavbarLink } from '~/types/types'

const router = useRouter()
const route = useRoute()

function navigateTo(link: INavbarLink) {
  if (link.to) {
    router.push(link.to)
  }
}

function isActive(link: INavbarLink): boolean {
  if (!link.to)
    return false
  return route.path === link.to
}
const store = useAuthStore()

function isAuthorized(link: INavbarLink) {
  if (!link.rule)
    return link
  return store.user.rules.includes(link.rule) || store.user.rules.includes('admin')
}

const filteredLinks = computed(() => {
  return navbarConfig.links.filter((link) => {
    if (link.rule)
      return isAuthorized(link)
    link.children = link.children?.filter(child => isAuthorized(child))
    return link.children?.length
  })
})

</script>

<template>
  <q-drawer
    show-if-above
    :width="260"
    :breakpoint="500"
    class="sidebar-drawer"
  >
    <div class="sidebar-content" dark:bg-gray-8>
      <!-- User Profile Header -->
      <div class="user-profile q-pa-md">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-avatar size="42px" class="q-mr-sm">
              <img src="/assets/images/Pic.png">
            </q-avatar>
            <div>
              <div  style="font-size: 13px;">
                {{ store.user.fullName }}
              </div>
              <div  style="font-size: 12px;">
                {{ store.user.username }}
              </div>
            </div>
          </div>
          <q-btn flat round dense size="sm" icon="more_vert" color="white" />
        </div>
      </div>

      <q-separator dark class="q-my-md" />

      <!-- Main Menu -->
      <q-scroll-area class="fit" style="height: calc(100vh - 480px);">
        <q-list class="menu-list q-px-md">
          <template v-for="link in filteredLinks" :key="link.title">
            <!-- Menu item with children -->
            <div v-if="link.children && link.children.length > 0" class="menu-section">
              <div class="section-label q-px-md q-py-xs text-grey-5 text-uppercase text-weight-medium">
                {{ link.title }}
              </div>
              <q-item
                v-for="child in link.children"
                :key="child.title"
                clickable
                :active="isActive(child)"
                class="menu-item"
                @click="navigateTo(child)"
              >
                <q-item-section avatar>
                  <Icon :icon="child.icon" width="20" height="20" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ child.title }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <!-- Simple menu item -->
            <q-item
              v-else
              clickable
              :active="isActive(link)"
              class="menu-item"
              @click="navigateTo(link)"
            >
              <q-item-section avatar>
                <Icon :icon="link.icon" width="20" height="20" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ link.title }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>

      

      
    </div>
  </q-drawer>
</template>

<style scoped lang="scss">
// Light mode styles
.sidebar-drawer {
  background: white !important;
  border-right: 1px solid #e5e7eb;

  :deep(.q-drawer__content) {
    background: white;
  }
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-profile {
  flex-shrink: 0;

  .q-btn {
    color: #6b7280;
  }

  div[style*="font-size: 13px"] {
    color: #1f2937;
    font-weight: 500;
  }

  div[style*="font-size: 12px"] {
    color: #6b7280;
  }
}

.menu-list {
  .menu-section {
    margin-bottom: 16px;
  }

  .section-label {
    font-size: 10px;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    color: #9ca3af;
    opacity: 0.8;
  }

  .menu-item {
    border-radius: 8px;
    margin-bottom: 4px;
    padding: 10px 12px;
    color: #4b5563;
    transition: all 0.2s ease;

    :deep(.q-item__section--avatar) {
      min-width: 36px;
      color: #6b7280;
    }

    :deep(.q-item__label) {
      font-size: 14px;
      font-weight: 400;
    }

    &:hover {
      background: #f3f4f6;
      color: #1f2937;

      :deep(.q-item__section--avatar) {
        color: #1f2937;
      }
    }

    &.q-item--active {
      background: #eff6ff;
      color: #3b82f6;

      :deep(.q-item__section--avatar) {
        color: #3b82f6;
      }
    }
  }
}

// Dark mode styles
body.body--dark {
  .sidebar-drawer {
    background: #1e1e1e !important;
    border-right: 1px solid #2d2d2d;

    :deep(.q-drawer__content) {
      background: #1e1e1e;
    }
  }

  .user-profile {
    .q-btn {
      color: #d1d5db;
    }

    div[style*="font-size: 13px"] {
      color: white;
    }

    div[style*="font-size: 12px"] {
      color: #9ca3af;
    }
  }

  .menu-list {
    .section-label {
      color: #9ca3af;
    }

    .menu-item {
      color: rgba(255, 255, 255, 0.8);

      :deep(.q-item__section--avatar) {
        color: rgba(255, 255, 255, 0.7);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;

        :deep(.q-item__section--avatar) {
          color: white;
        }
      }

      &.q-item--active {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;

        :deep(.q-item__section--avatar) {
          color: #60a5fa;
        }
      }
    }
  }
}
</style>