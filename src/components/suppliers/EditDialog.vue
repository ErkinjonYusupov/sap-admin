<script setup lang="ts">
import useFormRules from '~/composables/useFormRules'
import { useSuppliersStore } from '~/stores/suppliers'

const store = useSuppliersStore()
const form = ref<HTMLFormElement | null>(null)
const notify = useNotify()
const { required } = useFormRules()

async function saveBtn() {
  form.value?.validate().then(async (r: any) => {
    if (r) {
      try {
        const res = await store.createSupplier()
        store.editDialog = false
        await store.getSuppliers()
        store.resetObj()
        form.value?.reset()
        notify.success(res.message || 'Ma\'lumot saqlandi')
      }
      catch (err: any) {
        notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
      }
    }
  })
}

function closeDialog() {
  store.editDialog = false
  store.resetObj()
  form.value?.reset()
}
</script>

<template>
  <q-dialog v-model="store.editDialog">
    <q-card dark:bg-gray-8 p-16px w-500px>
      <q-card-section>
        <div class="text-h6">
          {{ store.obj.id ? 'Yetkazuvchi tahrirlash' : 'Yangi yetkazuvchi' }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form ref="form">
          <q-input
            :rules="[required()]"
            v-model="store.obj.name"
            label="Yetkazuvchi nomi"
            outlined
            class="q-mb-md"
          />

          <q-input
            :rules="[required()]"
            v-model="store.obj.phone"
            label="Telefon raqami"
            outlined
            mask="+### ## ### ## ##"
            placeholder="+998 90 123 45 67"
            class="q-mb-md"
          />

          <q-input
            v-model="store.obj.notes"
            label="Izoh"
            outlined
            type="textarea"
            rows="3"
          />
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Bekor qilish" @click="closeDialog" />
        <q-btn unelevated color="primary" label="Saqlash" @click="saveBtn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
