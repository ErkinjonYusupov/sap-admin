<script setup lang="ts">
import CategoriesTable from '~/components/categories/CategoriesTable.vue'
import { useCategoriesStore } from '~/stores/categories'

const store = useCategoriesStore()

async function loadCategories() {
  useOverlay(true)
  try {
    await store.getCategoriesTree()
  }
  catch (error) {
    console.error('Error loading categories:', error)
  }
  finally {
    useOverlay(false)
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div>
    <CategoriesTable />
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'categories_show'
</route>
