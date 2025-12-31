<script setup lang="ts">
import useFormRules from '~/composables/useFormRules'
import { useCategoriesStore } from '~/stores/categories'

const store = useCategoriesStore()
const form = ref<HTMLFormElement | null>(null)
const notify = useNotify()
const { required } = useFormRules()

// Flatten tree for parent selection
const flattenedCategories = computed(() => {
  const result: any[] = []

  function flatten(items: any[], level = 0) {
    items.forEach(item => {
      // Don't include the current category being edited
      if (item.id !== store.obj.id) {
        result.push({
          ...item,
          label: '  '.repeat(level) + item.name,
          value: item.id,
        })
        if (item.children && item.children.length > 0) {
          flatten(item.children, level + 1)
        }
      }
    })
  }

  flatten(store.categoriesTree)
  return result
})

async function saveBtn() {
  form.value?.validate().then(async (r: any) => {
    if (r) {
      try {
        const res = await store.createCategory()
        store.editDialog = false
        await store.getCategoriesTree()
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
          {{ store.obj.id ? 'Kategoriya tahrirlash' : 'Yangi kategoriya' }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form ref="form">
          <q-input
            :rules="[required()]"
            v-model="store.obj.name"
            label="Kategoriya nomi"
            outlined
            class="q-mb-md"
          />

          <q-select
            v-model="store.obj.parentId"
            :options="flattenedCategories"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Ota kategoriya"
            outlined
            clearable
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="mdi-folder-outline" />
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Kategoriyalar topilmadi
                </q-item-section>
              </q-item>
            </template>
            <template #hint>
              Bo'sh qoldirish orqali asosiy kategoriya yaratish mumkin
            </template>
          </q-select>
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Bekor qilish" @click="closeDialog" />
        <q-btn unelevated color="primary" label="Saqlash" @click="saveBtn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
