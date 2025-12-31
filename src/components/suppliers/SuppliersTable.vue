<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { QTableColumn, QTable } from 'quasar'
import { formatDate, useRule } from '~/composables/helpers'
import { useSuppliersStore } from '~/stores/suppliers'
import { useRouter } from 'vue-router'
import EditDialog from './EditDialog.vue'

const store = useSuppliersStore()
const router = useRouter()
const rows = computed(() => store.suppliers ? [...store.suppliers] : [])

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
    name: 'name',
    label: 'Nomi',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'phone',
    label: 'Telefon',
    field: 'phone',
    align: 'left',
    sortable: true,
  },
  {
    name: 'notes',
    label: 'Izoh',
    field: 'notes',
    align: 'left',
  },
  {
    name: 'productCount',
    label: 'Mahsulotlar',
    field: (row: any) => row._count?.productSupplier || 0,
    align: 'center',
    sortable: true,
  },
  {
    name: 'active',
    label: 'Faollik',
    field: 'active',
    align: 'center',
  },
  {
    name: 'createdAt',
    label: 'Yaratilgan',
    field: (row: any) => formatDate(row.createdAt),
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Amallar',
    field: 'actions',
    align: 'center',
  },
]

function editSupplier(supplier: any) {
  store.obj = { ...supplier }
  store.editDialog = true
}

function manageProducts(supplier: any) {
  router.push({
    path: '/supplier-products',
    query: { id: supplier.id }
  })
}

async function deleteSupplier(supplier: any) {
  const confirmed = await useDialog().confirm({
    title: 'O\'chirish',
    message: `Yetkazuvchi "${supplier.name}" ni o'chirmoqchimisiz?`,
  })

  if (confirmed) {
    try {
      const res = await store.deleteSupplier(supplier.id)
      await store.getSuppliers()
      useNotify().success(res.message || 'Yetkazuvchi o\'chirildi')
    }
    catch (err: any) {
      useNotify().error(err?.response?.data?.message || 'Xatolik yuz berdi!')
    }
  }
}

// Watch pagination
watch(() => store.pagination.currentPage, () => {
  store.getSuppliers()
})
</script>

<template>
  <EditDialog />
  <TableContainer title="Yetkazuvchilar" description="Barcha yetkazuvchilar ro'yxati">
    <template #actions v-if="useRule('suppliers_create')">
      <q-btn
        unelevated
        color="primary"
        label="Yangi yetkazuvchi"
        icon="add"
        @click="() => { store.resetObj(); store.editDialog = true }"
      />
    </template>
    <template #filters>
      <div w-300px>
        <q-input
          v-model="store.search"
          outlined
          dense
          debounce="1000"
          @update:model-value="store.getSuppliers()"
          placeholder="Qidirish (nomi yoki telefon)"
          class="q-mb-md"
        />
      </div>
    </template>
    <template #pagination>
      <q-pagination
        v-model="store.pagination.currentPage"
        :max="store.pagination.totalPages"
        direction-links
        boundary-links
      />
    </template>

    <QTable
      v-if="rows.length"
      no-data-label="Ma'lumotlar mavjud emas"
      :rows="rows"
      :columns="columns"
      table-header-class="bg-gray-100 font-bold dark:bg-gray-400 dark:text-gray-8"
      dense
      class="sticky-headered-table"
      separator="cell"
      flat
      hide-pagination
      row-key="id"
    >
      <template #body-cell-actions="props" v-if="useRule('suppliers_edit')">
        <q-td :props="props">
          <div flex gap-2 justify-center>
            <q-btn flat dense @click="editSupplier(props.row)">
              <q-tooltip>Tahrirlash</q-tooltip>
              <Icon icon="mynaui:edit" text-16px />
            </q-btn>
            <q-btn flat dense @click="manageProducts(props.row)">
              <q-tooltip>Mahsulotlar</q-tooltip>
              <Icon icon="mdi:package-variant" text-16px color="blue" />
            </q-btn>
            <q-btn flat dense @click="deleteSupplier(props.row)">
              <q-tooltip>O'chirish</q-tooltip>
              <Icon icon="mdi:delete" text-16px color="red" />
            </q-btn>
          </div>
        </q-td>
      </template>
      <template #body-cell-active="props">
        <q-td :props="props" v-if="useRule('suppliers_edit')">
          <q-btn flat dense>
            <q-toggle
              dense
              v-model="props.row.active"
              color="green"
              @update:model-value="store.toggleActive(props.row)"
            />
            <q-tooltip>Faollik</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </QTable>
  </TableContainer>
</template>
