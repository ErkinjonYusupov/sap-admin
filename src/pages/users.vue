<script setup lang="ts">
import UsersTable from '~/components/users/UsersTable.vue'

const store = useUsersStore()
async function loadUsers() {
  useOverlay(true)
  try {
    await store.getUsers()
  }
  catch (error) {
    console.error('Error loading users:', error)
  }
  finally {
    useOverlay(false)
  }
}
onMounted(() => {
  loadUsers()
})
</script>

<template> 
    <div>
        <UsersTable />
    </div>
</template>

<route lang="yaml">
meta:
  rule: 'users_show'
</route>