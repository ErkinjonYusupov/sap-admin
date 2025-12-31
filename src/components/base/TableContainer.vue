<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: 'Title',
  },
  description: {
    type: String || null || undefined
  },
})
</script>

<template>
  <div class="users-table-container" >
    <q-card flat bordered class="users-card" dark:bg-gray-8>
      <!-- Header -->
      <q-card-section class="q-pb-none">
        <div class="flex items-center justify-between q-mb-md">
          <div>
            <div class="text-h5 text-weight-bold">
              {{ props.title }}
            </div>
            <div class="text-grey-7 text-caption">
              {{ props.description }}
            </div>
          </div>
          <slot name="actions"/>
        </div>

        <!-- Search & Filter -->
        <slot name="filters"/>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <slot/>
      </q-card-section>
      <div class="flex justify-end px-4 py-2">
        <slot name="pagination"/>
      </div>
    </q-card>
  </div>
</template>

<style scoped lang="scss">
.users-table-container {
  padding: 24px;
}

.users-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}




</style>
