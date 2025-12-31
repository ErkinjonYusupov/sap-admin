<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { QTableColumn, QTable } from 'quasar'
import { formatDate } from '~/composables/helpers'
import { useStockStore } from '~/stores/stock'
import { useRouter } from 'vue-router'

const store = useStockStore()
const router = useRouter()
const rows = computed(() => store.movements ? [...store.movements] : [])

// Movement type options
const typeOptions = [
  { label: 'Kirim', value: 'IN' },
  { label: 'Chiqim', value: 'OUT' },
]

// Helper functions for display
function getTypeLabel(type: string) {
  return typeOptions.find(t => t.value === type)?.label || type
}

function getTypeColor(type: string) {
  return type === 'IN' ? 'green' : 'red'
}

// Table columns
const columns: QTableColumn[] = [
  {
    name: 'barcode',
    label: 'Barcode',
    field: (row: any) => row.product?.barcode || '-',
    align: 'left',
  },
  {
    name: 'product',
    label: 'Mahsulot',
    field: (row: any) => row.product?.title || '-',
    align: 'left',
  },
  {
    name: 'type',
    label: 'Turi',
    field: 'type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'quantity',
    label: 'Miqdor',
    field: 'quantity',
    align: 'center',
    sortable: true,
  },
  {
    name: 'beforeQuantity',
    label: 'Avvalgi',
    field: 'beforeQuantity',
    align: 'center',
  },
  {
    name: 'afterQuantity',
    label: 'Keyingi',
    field: 'afterQuantity',
    align: 'center',
  },
  {
    name: 'order',
    label: 'Buyurtma',
    field: (row: any) => row.order?.orderNumber || '-',
    align: 'left',
  },
  {
    name: 'notes',
    label: 'Izoh',
    field: (row: any) => row.notes || '-',
    align: 'left',
  },
  {
    name: 'createdAt',
    label: 'Sana',
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

function goBack() {
  router.push('/stock')
}

function viewOrder(order: any) {
  if (order?.id) {
    router.push({
      path: '/order-details',
      query: { id: order.id }
    })
  }
}

// Watch pagination
watch(() => store.movementsPagination.currentPage, () => {
  store.getMovements()
})
</script>

<template>
  <TableContainer title="Harakatlar tarixi" description="Mahsulotlar zaxirasi harakatlari">
    <template #actions>
      <q-btn flat @click="goBack">
        <Icon icon="mdi:arrow-left" mr-2 />
        Orqaga
      </q-btn>
    </template>
    <template #pagination>
      <q-pagination
        v-model="store.movementsPagination.currentPage"
        :max="store.movementsPagination.totalPages"
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

      <template #body-cell-quantity="props">
        <q-td :props="props">
          <span :class="props.row.type === 'IN' ? 'text-green' : 'text-red'">
            {{ props.row.type === 'IN' ? '+' : '-' }}{{ props.row.quantity }}
          </span>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div flex gap-2 justify-center>
            <q-btn
              v-if="props.row.order"
              flat
              dense
              @click="viewOrder(props.row.order)"
            >
              <q-tooltip>Buyurtmani ko'rish</q-tooltip>
              <Icon icon="mdi:file-document" text-16px />
            </q-btn>
            <span v-else class="text-grey-5">-</span>
          </div>
        </q-td>
      </template>
    </QTable>
  </TableContainer>
</template>
