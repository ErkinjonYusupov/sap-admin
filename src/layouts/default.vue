<script lang='ts' setup>
import Appbar from '~/components/main/Appbar.vue'
import Sidebar from '~/components/main/Sidebar.vue'
</script>

<template>
  <q-layout view="lhh LpR lff">
    <Appbar />
    <Sidebar />

    <q-page-container bg-gray-300>
      <q-page class="mb-0 bg-[#eaecf5] dark:bg-gray-900">
 
        <router-view #="{ Component, route }">
          <transition name="fade" mode="out-in">
            <div :key="route.name || 'fallback-route-name'">
              <component :is="Component" />
            </div>
          </transition>
         
        </router-view>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
