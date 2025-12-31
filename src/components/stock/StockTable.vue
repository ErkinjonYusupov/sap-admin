<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { QTableColumn, QTable } from 'quasar'
import { useStockStore } from '~/stores/stock'
import { useCategoriesStore } from '~/stores/categories'
import { useRouter } from 'vue-router'

const store = useStockStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()
const rows = computed(() => store.stockItems ? [...store.stockItems] : [])

const showAdjustDialog = ref(false)
const selectedProduct = ref<any>(null)

// Load categories for filter
onMounted(async () => {
  await categoriesStore.getCategoriesTree()
})

// Flatten categories for select
const categoryOptions = computed(() => {
  const flattened: any[] = []
  function flattenTree(items: any[], level = 0) {
    items.forEach((item: any) => {
      flattened.push({
        label: '  '.repeat(level) + item.name,
        value: item.id,
      })
      if (item.children && item.children.length > 0) {
        flattenTree(item.children, level + 1)
      }
    })
  }
  flattenTree(categoriesStore.categoriesTree || [])
  return flattened
})

// Table columns
const columns: QTableColumn[] = [
  {
    name: 'barcode',
    label: 'Barcode',
    field: (row: any) => row.product?.barcode || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'product',
    label: 'Mahsulot',
    field: (row: any) => row.product?.title || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'category',
    label: 'Kategoriya',
    field: (row: any) => row.product?.category?.name || '-',
    align: 'left',
  },
  {
    name: 'quantity',
    label: 'Miqdor',
    field: 'quantity',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Amallar',
    field: 'actions',
    align: 'center',
  },
]

function openAdjustDialog(item: any) {
  selectedProduct.value = item.product
  showAdjustDialog.value = true
}

function viewMovements() {
  router.push('/stock-movements')
}

async function onAdjustmentSaved() {
  showAdjustDialog.value = false
  selectedProduct.value = null
  await store.getStock()
}

// Watch pagination and filters
watch(() => store.pagination.currentPage, () => {
  store.getStock()
})

watch(() => [store.search, store.categoryFilter, store.lowStockFilter], () => {
  store.pagination.currentPage = 1
  store.getStock()
})
</script>

<template>
  <TableContainer title="Ombor" description="Mahsulotlar zaxirasi">
    <template #actions>
      <q-btn unelevated color="primary" @click="viewMovements">
        <Icon icon="mdi:history" mr-2 />
        Harakatlar tarixi
      </q-btn>
    </template>
    <template #filters>
      <div flex gap-4 items-center>
        <div w-250px>
          <q-input
            v-model="store.search"
            placeholder="Qidirish..."
            outlined
            dense
            clearable
            class="q-mb-md"
          >
            <template #prepend>
              <Icon icon="mdi:magnify" />
            </template>
          </q-input>
        </div>
        <div w-250px>
          <q-select
            v-model="store.categoryFilter"
            :options="categoryOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Kategoriya"
            outlined
            dense
            clearable
            class="q-mb-md"
          />
        </div>
        <div>
          <q-checkbox
            v-model="store.lowStockFilter"
            label="Kam qolgan mahsulotlar (≤10)"
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
      <template #body-cell-quantity="props">
        <q-td :props="props">
          <q-badge :color="props.row.quantity <= 10 ? 'red' : 'green'">
            {{ props.row.quantity }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div flex gap-2 justify-center>
            <q-btn flat dense @click="openAdjustDialog(props.row)">
              <q-tooltip>Tuzatish</q-tooltip>
              <Icon icon="mdi:tune" text-16px />
            </q-btn>
          </div>
        </q-td>
      </template>
    </QTable>
  </TableContainer>

  <AdjustDialog
    v-if="selectedProduct"
    v-model="showAdjustDialog"
    :product="selectedProduct"
    @saved="onAdjustmentSaved"
  />
</template>
