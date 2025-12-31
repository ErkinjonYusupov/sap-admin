

<script setup lang="ts">
import useFormRules from '~/composables/useFormRules'

const store = useUsersStore()

const form = ref<HTMLFormElement | null>(null)
const notify = useNotify()
const {required}=useFormRules()
async function saveBtn() {
  form.value?.validate().then(async (r: any) => {
    if (r) {
      try {
        const res = await store.createUser()
        store.editDialog = false
        store.obj.id = null
        form.value?.reset()
        notify.success(res.message || 'Ma\'lumot saqlandi')
      }
      catch (err: any) {
        notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
      }
    }
  })
}
</script>

<template>
  <q-dialog v-model="store.editDialog">
    <q-card dark:bg-gray-8 p-16px w-400px>
      <q-card-section>
        <div class="text-h6">Foydalanuvchi tahrirlash</div>
      </q-card-section>
      <q-card-section>
        <q-form ref="form">
          <q-input :rules="[required()]" v-model="store.obj.username" label="Foydalanuvchi nomi" />
          <q-input :rules="[required()]" v-model="store.obj.fullName" label="Foydalanuvchi ismi" />
          <q-input :rules="[required()]" v-model="store.obj.password" label="Foydalanuvchi paroli" />
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="bekor qilish" @click="store.editDialog = false" />
        <q-btn flat label="Saqlash" @click="saveBtn" />
      </q-card-actions>
    </q-card>       
  </q-dialog>
</template>
  