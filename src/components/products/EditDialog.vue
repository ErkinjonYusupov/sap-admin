<script setup lang="ts">
import useFormRules from '~/composables/useFormRules'
import { useProductsStore } from '~/stores/products'
import { useCategoriesStore } from '~/stores/categories'
import { Icon } from '@iconify/vue'

const store = useProductsStore()
const categoriesStore = useCategoriesStore()
const form = ref<HTMLFormElement | null>(null)
const notify = useNotify()
const { required } = useFormRules()
const categoryMenuOpen = ref(false)

// O'lchov birliklari
const unitOptions = [
  { label: 'Dona', value: 'dona' },
  { label: 'Kilogramm (kg)', value: 'kg' },
  { label: 'Gramm (gr)', value: 'gr' },
  { label: 'Litr (l)', value: 'l' },
  { label: 'Millilitr (ml)', value: 'ml' },
  { label: 'Metr (m)', value: 'm' },
  { label: 'Santimetr (sm)', value: 'sm' },
  { label: 'Paket', value: 'paket' },
  { label: 'Quti', value: 'quti' },
  { label: 'Shisha', value: 'shisha' },
]

// Load categories when dialog opens
watch(() => store.editDialog, async (newVal) => {
  if (newVal && categoriesStore.categoriesTree.length === 0) {
    await categoriesStore.getCategoriesTree()
  }
})

// Prepare tree nodes for QTree
const treeNodes = computed(() => {
  function convertToTreeNode(items: any[]): any[] {
    return items.map(item => ({
      id: item.id,
      label: item.name,
      children: item.children ? convertToTreeNode(item.children) : undefined,
      header: 'generic',
    }))
  }
  return convertToTreeNode(categoriesStore.categoriesTree)
})

// Selected category name
const selectedCategoryName = computed(() => {
  if (!store.obj.categoryId) return ''

  function findCategory(items: any[], id: number): any {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findCategory(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  const category = findCategory(categoriesStore.categoriesTree, store.obj.categoryId)
  return category?.name || ''
})

function selectCategory(nodeId: number) {
  store.obj.categoryId = nodeId
  categoryMenuOpen.value = false
}

async function saveBtn() {
  form.value?.validate().then(async (r: any) => {
    if (r) {
      try {
        const res = await store.createProduct()
        store.editDialog = false
        await store.getProducts()
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
    <q-card dark:bg-gray-8 p-16px w-600px>
      <q-card-section>
        <div class="text-h6">
          {{ store.obj.id ? 'Mahsulot tahrirlash' : 'Yangi mahsulot' }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form ref="form">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                :rules="[required()]"
                v-model="store.obj.title"
                label="Mahsulot nomi"
                outlined
              />
            </div>

            <div class="col-12">
              <q-input
                :rules="[required()]"
                :model-value="selectedCategoryName"
                label="Kategoriya"
                outlined
                readonly
                @click="categoryMenuOpen = true"
                class="cursor-pointer"
              >
                <template #prepend>
                  <Icon icon="mdi:folder-outline" />
                </template>
                <template #append>
                  <Icon icon="mdi:chevron-down" />
                </template>
              </q-input>
              <q-menu v-model="categoryMenuOpen" max-height="400px" max-width="500px">
                <q-card>
                  <q-card-section class="q-pa-sm">
                    <div class="text-subtitle2 q-mb-sm">Kategoriya tanlang</div>
                    <q-tree
                      :nodes="treeNodes"
                      node-key="id"
                      default-expand-all
                      dense
                      @update:selected="(nodeId) => selectCategory(nodeId)"
                    >
                      <template #default-header="prop">
                        <div
                          class="row items-center q-py-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 q-px-sm rounded"
                          @click="selectCategory(prop.node.id)"
                        >
                          <Icon icon="mdi:folder-outline" />
                          <div>{{ prop.node.label }}</div>
                        </div>
                      </template>
                    </q-tree>
                  </q-card-section>
                </q-card>
              </q-menu>
            </div>

            <div class="col-6">
              <q-input
                :rules="[required()]"
                v-model="store.obj.barcode"
                label="Barcode"
                outlined
              />
            </div>

            <div class="col-6">
              <q-select
                :rules="[required()]"
                v-model="store.obj.unit"
                :options="unitOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="O'lchov birligi"
                outlined
              >
                <template #prepend>
                  <Icon icon="mdi:ruler" />
                </template>
              </q-select>
            </div>

            <div class="col-6">
              <q-input
                :rules="[required()]"
                v-model.number="store.obj.inputPrice"
                label="Kirim narxi"
                outlined
                type="number"
                min="0"
              >
                <template #append>
                  <q-icon name="mdi-currency-usd" />
                </template>
              </q-input>
            </div>

            <div class="col-6">
              <q-input
                :rules="[required()]"
                v-model.number="store.obj.sellPrice"
                label="Sotuv narxi"
                outlined
                type="number"
                min="0"
              >
                <template #append>
                  <q-icon name="mdi-currency-usd" />
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Bekor qilish" @click="closeDialog" />
        <q-btn unelevated color="primary" label="Saqlash" @click="saveBtn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
