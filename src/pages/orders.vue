<script setup lang="ts">
import OrdersTable from '~/components/orders/OrdersTable.vue'
import { useOrdersStore } from '~/stores/orders'

const store = useOrdersStore()

async function loadOrders() {
  useOverlay(true)
  try {
    await store.getOrders()
  }
  catch (error) {
    console.error('Error loading orders:', error)
  }
  finally {
    useOverlay(false)
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <div>
    <OrdersTable />
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'orders_show'
</route>
