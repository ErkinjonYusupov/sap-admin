<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { QTableColumn, QTable } from 'quasar'
import { formatDate, useRule } from '~/composables/helpers'
import { useProductsStore } from '~/stores/products'
import { useCategoriesStore } from '~/stores/categories'
import EditDialog from './EditDialog.vue'
import UploadDialog from './UploadDialog.vue'

const store = useProductsStore()
const categoriesStore = useCategoriesStore()
const rows = computed(() => store.products ? [...store.products] : [])
const uploadDialogRef = ref<InstanceType<typeof UploadDialog> | null>(null)

// Load categories for filter
onMounted(async () => {
  await categoriesStore.getCategoriesTree()
})

// Flatten categories for filter select
const flattenedCategories = computed(() => {
  const result: any[] = []

  function flatten(items: any[], level = 0) {
    items.forEach(item => {
      result.push({
        ...item,
        label: '  '.repeat(level) + item.name,
        value: item.id,
      })
      if (item.children && item.children.length > 0) {
        flatten(item.children, level + 1)
      }
    })
  }

  flatten(categoriesStore.categoriesTree)
  return result
})

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
    name: 'title',
    label: 'Nomi',
    field: 'title',
    align: 'left',
    sortable: true,
  },
  {
    name: 'category',
    label: 'Kategoriya',
    field: (row: any) => row.category?.name || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'barcode',
    label: 'Barcode',
    field: 'barcode',
    align: 'left',
    sortable: true,
  },
  {
    name: 'unit',
    label: 'O\'lchov',
    field: 'unit',
    align: 'center',
  },
  {
    name: 'sellPrice',
    label: 'Sotuv narxi',
    field: (row: any) => row.sellPrice?.toLocaleString() || '0',
    align: 'right',
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

function editProduct(product: any) {
  store.obj = { ...product }
  store.editDialog = true
}

async function deleteProduct(product: any) {
  const confirmed = await useDialog().confirm({
    title: 'O\'chirish',
    message: `Mahsulot "${product.title}" ni o'chirmoqchimisiz?`,
  })

  if (confirmed) {
    try {
      const res = await store.deleteProduct(product.id)
      await store.getProducts()
      useNotify().success(res.message || 'Mahsulot o\'chirildi')
    }
    catch (err: any) {
      useNotify().error(err?.response?.data?.message || 'Xatolik yuz berdi!')
    }
  }
}

async function exportExcel() {
  try {
    const res = await store.exportExcel()
    useNotify().success(res.message || 'Excel fayl yuklandi')
  }
  catch (err: any) {
    useNotify().error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

// Watch pagination and filters
watch(() => store.pagination.currentPage, () => {
  store.getProducts()
})

watch(() => store.categoryFilter, () => {
  store.pagination.currentPage = 1
  store.getProducts()
})
</script>

<template>
  <EditDialog />
  <UploadDialog ref="uploadDialogRef" />
  <TableContainer title="Mahsulotlar" description="Barcha mahsulotlar ro'yxati">
    <template #actions v-if="useRule('products_create')">
      <div flex gap-2>
        <q-btn
          unelevated
          color="primary"
          label="Yangi mahsulot"
          icon="add"
          @click="() => { store.resetObj(); store.editDialog = true }"
        />
        <q-btn
          unelevated
          color="positive"
          label="Excel import"
          @click="uploadDialogRef!.uploadDialog = true"
        />
        <q-btn
          unelevated
          color="secondary"
          label="Excel export"
          @click="exportExcel"
        />
      </div>
    </template>
    <template #filters>
      <div flex gap-4 items-center>
        <div w-300px>
          <q-input
            v-model="store.search"
            outlined
            dense
            debounce="1000"
            @update:model-value="store.getProducts()"
            placeholder="Qidirish (nomi yoki barcode)"
            class="q-mb-md"
          />
        </div>
        <div w-250px>
          <q-select
            v-model="store.categoryFilter"
            :options="flattenedCategories"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Kategoriya bo'yicha filter"
            outlined
            dense
            clearable
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="mdi-filter" />
            </template>
          </q-select>
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
      <template #body-cell-actions="props" v-if="useRule('products_edit')">
        <q-td :props="props">
          <div flex gap-2 justify-center>
            <q-btn flat dense @click="editProduct(props.row)">
              <q-tooltip>Tahrirlash</q-tooltip>
              <Icon icon="mynaui:edit" text-16px />
            </q-btn>
            <q-btn flat dense @click="deleteProduct(props.row)">
              <q-tooltip>O'chirish</q-tooltip>
              <Icon icon="mdi:delete" text-16px color="red" />
            </q-btn>
          </div>
        </q-td>
      </template>
      <template #body-cell-active="props">
        <q-td :props="props" v-if="useRule('products_edit')">
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
