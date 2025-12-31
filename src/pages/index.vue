<script setup lang="ts">
const store = useAuthStore()
</script>

<template>
  <div>
    Dashboard {{ store.user }}
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'dashborad_show'
</route>


