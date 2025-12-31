<script setup lang="ts">
import MovementsTable from '~/components/stock/MovementsTable.vue'
import { useStockStore } from '~/stores/stock'

const store = useStockStore()

async function loadMovements() {
  useOverlay(true)
  try {
    await store.getMovements()
  }
  catch (error) {
    console.error('Error loading movements:', error)
  }
  finally {
    useOverlay(false)
  }
}

onMounted(() => {
  loadMovements()
})
</script>

<template>
  <div>
    <MovementsTable />
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'stock_show'
</route>
