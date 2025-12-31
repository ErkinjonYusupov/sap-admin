<script setup lang="ts">
import ProductsTable from '~/components/products/ProductsTable.vue'
import { useProductsStore } from '~/stores/products'

const store = useProductsStore()

async function loadProducts() {
  useOverlay(true)
  try {
    await store.getProducts()
  }
  catch (error) {
    console.error('Error loading products:', error)
  }
  finally {
    useOverlay(false)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div>
    <ProductsTable />
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'products_show'
</route>
