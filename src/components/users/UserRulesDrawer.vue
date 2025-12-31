<script lang='ts' setup>
import { Icon } from '@iconify/vue'
import { QTable } from 'quasar'
import { useUsersStore } from '~/stores/users'


const store = useUsersStore()
function close() {
  store.rulesDialog = false
}
const { t } = useI18n()
const headers: QTable['columns'] = [
  {
    name: 'title',
    label: 'Nomi',
    field: 'title',
    align: 'left',
    headerStyle: 'font-weight: bold',
  },

]

</script>

<template>
  <q-drawer
    v-model="store.rulesDialog" :width="800" behavior="mobile" side="right" overlay bordered persistent px-5
    py-3 dark:bg-gray-8
  >
    <div flex items-center justify-between>
      <div my-12px text-18px font-600>
        {{ store.selectedUser && store.selectedUser.fullName }} huqulari
      </div>
      <Icon icon="zondicons:close-outline" text-24px text-red @click="close" />
    </div>

    <div flex items-start gap-3>
      <QTable
        v-model:selected="store.selectedAvailableRules" selection="multiple" no-data-label="Huquqlar mavjud emas"
        :rows="store.userRules.availableRules" :rows-per-page-options="['0']" :columns="headers"
        table-header-class="bg-gray-100 font-bold dark:bg-gray-400 dark:text-gray-8" class="sticky-headered-table"
        separator="none" dense flat virtual-scroll hide-pagination w-full :virtual-scroll-sticky-size-start="48" 
      />
      <div >
        <q-btn flat :disabled="!store.selectedCurrentRules.length" @click="store.updateUserRulse('remove')">
          <Icon icon="gg:arrow-left-o" text-24px text-red />
        </q-btn>
        <q-btn flat :disabled="!store.selectedAvailableRules.length" @click="store.updateUserRulse('add')">
          <Icon icon="gg:arrow-right-o" text-24px text-green />
        </q-btn>
      </div>
      <QTable
        v-model:selected="store.selectedCurrentRules" selection="multiple" no-data-label="Huquqlar mavjud emas"
         :rows="store.userRules.currentRules" :rows-per-page-options="['0']" :columns="headers"
        table-header-class="bg-gray-100 font-bold dark:bg-gray-400 dark:text-gray-8" class="sticky-headered-table"
        separator="none" dense flat virtual-scroll hide-pagination w-full :virtual-scroll-sticky-size-start="48" 
        
      />
    </div>
  </q-drawer>
</template>