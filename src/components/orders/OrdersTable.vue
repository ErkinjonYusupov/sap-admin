<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { QTableColumn, QTable } from 'quasar'
import { formatDate, useRule } from '~/composables/helpers'
import { useOrdersStore } from '~/stores/orders'
import { useRouter } from 'vue-router'

const store = useOrdersStore()
const router = useRouter()
const rows = computed(() => store.orders ? [...store.orders] : [])

function createOrder() {
  router.push('/create-order')
}

// Order type options
const typeOptions = [
  { label: 'Kirim', value: 'PURCHASE' },
  { label: 'Sotuv', value: 'SALE' },
  { label: 'Chiqim', value: 'EXPENSE' },
]

// Status options
const statusOptions = [
  { label: 'Kutilmoqda', value: 'PENDING' },
  { label: 'Bajarildi', value: 'COMPLETED' },
  { label: 'Bekor qilindi', value: 'CANCELLED' },
]

// Helper functions for display
function getTypeLabel(type: string) {
  return typeOptions.find(t => t.value === type)?.label || type
}

function getStatusLabel(status: string) {
  return statusOptions.find(s => s.value === status)?.label || status
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'orange'
    case 'COMPLETED': return 'green'
    case 'CANCELLED': return 'red'
    default: return 'grey'
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'PURCHASE': return 'blue'
    case 'SALE': return 'green'
    case 'EXPENSE': return 'red'
    default: return 'grey'
  }
}

// Table columns
const columns: QTableColumn[] = [
  {
    name: 'orderNumber',
    label: 'Buyurtma raqami',
    field: 'orderNumber',
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: 'Turi',
    field: 'type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'supplier',
    label: 'Yetkazuvchi',
    field: (row: any) => row.supplier?.name || '-',
    align: 'left',
  },
  {
    name: 'totalAmount',
    label: 'Umumiy summa',
    field: (row: any) => row.totalAmount?.toLocaleString() || '0',
    align: 'right',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Holati',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'creator',
    label: 'Yaratuvchi',
    field: (row: any) => row.creator?.fullName || '-',
    align: 'left',
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

function viewOrder(order: any) {
  router.push({
    path: '/order-details',
    query: { id: order.id }
  })
}

async function updateStatus(order: any, status: string) {
  try {
    const res = await store.updateOrderStatus(order.id, status)
    await store.getOrders()
    useNotify().success(res.message || 'Holat yangilandi')
  }
  catch (err: any) {
    useNotify().error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

async function deleteOrder(order: any) {
  const confirmed = await useDialog().confirm({
    title: 'O\'chirish',
    message: `Buyurtma "${order.orderNumber}" ni o'chirmoqchimisiz?`,
  })

  if (confirmed) {
    try {
      const res = await store.deleteOrder(order.id)
      await store.getOrders()
      useNotify().success(res.message || 'Buyurtma o\'chirildi')
    }
    catch (err: any) {
      useNotify().error(err?.response?.data?.message || 'Xatolik yuz berdi!')
    }
  }
}

// Watch pagination and filters
watch(() => store.pagination.currentPage, () => {
  store.getOrders()
})

watch(() => [store.typeFilter, store.statusFilter, store.supplierFilter], () => {
  store.pagination.currentPage = 1
  store.getOrders()
})
</script>

<template>
  <TableContainer title="Buyurtmalar" description="Barcha buyurtmalar ro'yxati">
    <template #actions>
      <q-btn unelevated color="primary" @click="createOrder" v-if="useRule('orders_create')">
        <Icon icon="mdi:plus" mr-2 />
        Yangi buyurtma
      </q-btn>
    </template>
    <template #filters>
      <div flex gap-4 items-center>
        <div w-200px>
          <q-select
            v-model="store.typeFilter"
            :options="typeOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Turi"
            outlined
            dense
            clearable
            class="q-mb-md"
          />
        </div>
        <div w-200px>
          <q-select
            v-model="store.statusFilter"
            :options="statusOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Holati"
            outlined
            dense
            clearable
            class="q-mb-md"
          />
        </div>
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
      <template #body-cell-type="props">
        <q-td :props="props">
          <q-badge :color="getTypeColor(props.row.type)">
            {{ getTypeLabel(props.row.type) }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            {{ getStatusLabel(props.row.status) }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-actions="props" v-if="useRule('orders_edit')">
        <q-td :props="props">
          <div flex gap-2 justify-center>
            <q-btn flat dense @click="viewOrder(props.row)">
              <q-tooltip>Ko'rish</q-tooltip>
              <Icon icon="mdi:eye" text-16px />
            </q-btn>
            <q-btn-dropdown flat dense v-if="props.row.status === 'PENDING'">
              <q-tooltip>Holatni o'zgartirish</q-tooltip>
              <Icon icon="mdi:update" text-16px />
              <q-list>
                <q-item clickable v-close-popup @click="updateStatus(props.row, 'COMPLETED')">
                  <q-item-section>
                    <q-item-label>Bajarildi</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="updateStatus(props.row, 'CANCELLED')">
                  <q-item-section>
                    <q-item-label>Bekor qilish</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn flat dense @click="deleteOrder(props.row)" v-if="props.row.status === 'PENDING'">
              <q-tooltip>O'chirish</q-tooltip>
              <Icon icon="mdi:delete" text-16px color="red" />
            </q-btn>
          </div>
        </q-td>
      </template>
    </QTable>
  </TableContainer>
</template>
