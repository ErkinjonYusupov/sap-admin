<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { QTableColumn, QTable } from 'quasar'
import { formatDate, useRule } from '~/composables/helpers'
import { useCategoriesStore } from '~/stores/categories'

const store = useCategoriesStore()

// Track expanded rows
const expandedRows = ref<Set<number>>(new Set())

// Toggle expand/collapse
function toggleExpand(categoryId: number) {
  if (expandedRows.value.has(categoryId)) {
    expandedRows.value.delete(categoryId)
  } else {
    expandedRows.value.add(categoryId)
  }
}

// Flatten tree structure for table display
const rows = computed(() => {
  const flattened: any[] = []

  function flattenTree(items: any[], level = 0, parentExpanded = true) {
    items.forEach(item => {
      const { children, ...itemWithoutChildren } = item
      const hasChildren = children && children.length > 0

      if (parentExpanded) {
        flattened.push({
          ...itemWithoutChildren,
          __level: level,
          children: children || [],
          hasChildren,
        })
      }

      if (hasChildren && expandedRows.value.has(item.id)) {
        flattenTree(children, level + 1, parentExpanded)
      }
    })
  }

  if (store.categoriesTree && store.categoriesTree.length > 0) {
    flattenTree(store.categoriesTree)
  }

  return flattened
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
    name: 'name',
    label: 'Nomi',
    field: 'name',
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
    name: 'actions',
    label: 'Amallar',
    field: 'actions',
    align: 'center',
  },
]

function editCategory(category: any) {
  store.obj = { ...category }
  store.editDialog = true
}

function addSubCategory(category: any) {
  store.resetObj()
  store.obj.parentId = category.id
  store.editDialog = true
}

async function deleteCategory(category: any) {
  if (category.children && category.children.length > 0) {
    useNotify().error('Ichki kategoriyalari bo\'lgan kategoriyani o\'chirib bo\'lmaydi!')
    return
  }

  const confirmed = await useDialog().confirm({
    title: 'O\'chirish',
    message: `Kategoriya "${category.name}" ni o'chirmoqchimisiz?`,
  })

  if (confirmed) {
    try {
      const res = await store.deleteCategory(category.id)
      await store.getCategoriesTree()
      useNotify().success(res.message || 'Kategoriya o\'chirildi')
    }
    catch (err: any) {
      useNotify().error(err?.response?.data?.message || 'Xatolik yuz berdi!')
    }
  }
}
</script>

<template>
  <EditDialog />
  <TableContainer title="Kategoriyalar" description="Barcha kategoriyalar ro'yxati">
    <template #actions v-if="useRule('categories_create')">
      <q-btn
        unelevated
        color="primary"
        label="Yangi kategoriya"
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
          @update:model-value="store.getCategoriesTree()"
          placeholder="Qidirish"
          class="q-mb-md"
        />
      </div>
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
      :rows-per-page-options="[0]"
    >
      <template #body-cell-name="props">
        <q-td :props="props">
          <div :style="{ paddingLeft: `${(props.row.__level || 0) * 20}px` }" flex items-center gap-2>
            <q-btn
              v-if="props.row.hasChildren"
              flat
              dense
              size="sm"
              @click="toggleExpand(props.row.id)"
              class="min-w-0 p-0"
            >
              <Icon
                :icon="expandedRows.has(props.row.id) ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                text-16px
              />
            </q-btn>
            <div v-else w-24px></div>
            <Icon v-if="props.row.hasChildren" icon="mdi:folder" />
            <Icon v-else icon="mdi:folder-outline" />
            {{ props.row.name }}
          </div>
        </q-td>
      </template>

      <template #body-cell-actions="props" v-if="useRule('categories_edit')">
        <q-td :props="props">
          <div flex gap-2 justify-center>
            <q-btn flat dense @click="editCategory(props.row)">
              <q-tooltip>Tahrirlash</q-tooltip>
              <Icon icon="mynaui:edit" text-16px />
            </q-btn>
            <q-btn flat dense @click="addSubCategory(props.row)">
              <q-tooltip>Ichki kategoriya qo'shish</q-tooltip>
              <Icon icon="mdi:folder-plus" text-16px color="green" />
            </q-btn>
            <q-btn flat dense @click="deleteCategory(props.row)">
              <q-tooltip>O'chirish</q-tooltip>
              <Icon icon="mdi:delete" text-16px color="red" />
            </q-btn>
          </div>
        </q-td>
      </template>
    </QTable>
  </TableContainer>
</template>
