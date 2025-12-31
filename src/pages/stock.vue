<script setup lang="ts">
import StockTable from '~/components/stock/StockTable.vue'
import { useStockStore } from '~/stores/stock'

const store = useStockStore()

async function loadStock() {
  useOverlay(true)
  try {
    await store.getStock()
  }
  catch (error) {
    console.error('Error loading stock:', error)
  }
  finally {
    useOverlay(false)
  }
}

onMounted(() => {
  loadStock()
})
</script>

<template>
  <div>
    <StockTable />
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'stock_show'
</route>
