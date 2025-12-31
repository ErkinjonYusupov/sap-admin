<script setup lang="ts">
import SuppliersTable from '~/components/suppliers/SuppliersTable.vue'
import { useSuppliersStore } from '~/stores/suppliers'

const store = useSuppliersStore()

async function loadSuppliers() {
  useOverlay(true)
  try {
    await store.getSuppliers()
  }
  catch (error) {
    console.error('Error loading suppliers:', error)
  }
  finally {
    useOverlay(false)
  }
}

onMounted(() => {
  loadSuppliers()
})
</script>

<template>
  <div>
    <SuppliersTable />
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'suppliers_show'
</route>
