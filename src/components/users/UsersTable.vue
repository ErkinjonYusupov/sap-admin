<script setup lang="ts">

import { Icon } from '@iconify/vue'
import { QTableColumn, QTable } from 'quasar'
import { formatDate, useRule } from '~/composables/helpers'
import { useUsersStore } from '~/stores/users'



const store = useUsersStore()
const rows = computed(() => store.users ? [...store.users] : []) // Defensive copy



// Table columns
const columns: QTableColumn[] = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'username',
    label: 'Username',
    field: 'username',
    align: 'left',
    sortable: true,
  },
  {
    name: 'fullName',
    label: 'To\'liq ism',
    field: 'fullName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'Yaratilgan',
    field: (row: any) => formatDate(row.createdAt),
    align: 'left',
    sortable: true,
  },
  {
    name: 'updatedAt',
    label: 'Yangilangan',
    field: (row: any) => formatDate(row.updatedAt),
    align: 'left',
    sortable: true,
  },
  {
    name: 'active',
    label: 'Faollik',
    field: 'active',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Amallar',
    field: 'actions',
    align: 'center',
  },
]



const filter = ref('')


function editUser(user: any) {
  store.obj = user
  store.editDialog = true
}
function showRules(user: any) {
  store.selectedUser = user
  store.getUserRules()
  store.rulesDialog = true
}
</script>

<template>
  <EditDilaog />
  <UserRulesDrawer />
  <TableContainer title="Foydalanuvchilar" description="Barcha foydalanuvchilar ro'yxati">
    <template #actions v-if="useRule('users_create')">
      <q-btn unelevated color="primary" label="Yangi foydalanuvchi" icon="add"
        @click="() => { store.obj.id = null; store.editDialog = true }" />
    </template>
    <template #filters>
      <div w-300px>
        <q-input v-model="store.search" outlined dense debounce="1000" @update:model-value="store.getUsers()" placeholder="Qidirish" class="q-mb-md" />
      </div>
    </template>
    <template #pagination>
      <q-pagination v-model="store.pagination.currentPage" :max="store.pagination.totalPages" />
    </template>

    <QTable v-if="rows.length" no-data-label="Ma'lumotlar mavjud emas" :rows="rows" :columns="columns"
      table-header-class="bg-gray-100 font-bold dark:bg-gray-400 dark:text-gray-8" dense class="sticky-headered-table"
      separator="cell" flat hide-pagination >
      <template #body-cell-actions="props" v-if="useRule('users_edit')">
        <q-td :props="props" >
          <div flex gap-2 justify-center >
            <q-btn flat dense @click="editUser(props.row)">
              <q-tooltip> Tahrirlash </q-tooltip>
              <Icon icon="mynaui:edit" text-16px />
            </q-btn>
            <q-btn flat dense @click="showRules(props.row)">
              <q-tooltip> Huquqlar </q-tooltip>
              <Icon icon="oui:app-users-roles" color="red" text-16px />
            </q-btn>
          </div>
        </q-td>
      </template>
      <template #body-cell-active="props">
        <q-td :props="props" v-if="useRule('users_edit')">
          <q-btn flat dense>
            <q-toggle dense v-model="props.row.active" color="green"
              @update:model-value="store.toggleActive(props.row)" />
            <q-tooltip>Faollik</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </QTable>
  </TableContainer>

</template>
