<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useSuppliersStore } from '~/stores/suppliers'
import { useProductsStore } from '~/stores/products'

const store = useSuppliersStore()
const productsStore = useProductsStore()
const notify = useNotify()

const searchProduct = ref('')
const selectedProducts = ref<Map<number, number>>(new Map()) // productId -> price
const selectedCurrentProducts = ref<number[]>([])

// Load all products when dialog opens
watch(() => store.productsDialog, async (newVal) => {
  if (newVal) {
    await productsStore.getProducts()
    selectedProducts.value.clear()
    selectedCurrentProducts.value = []
  }
})

// Available products (not yet linked to this supplier)
const availableProducts = computed(() => {
  if (!store.selectedSupplier?.productSupplier) return productsStore.products

  const linkedProductIds = store.selectedSupplier.productSupplier.map((ps: any) => ps.productId)
  let products = productsStore.products.filter((p: any) => !linkedProductIds.includes(p.id))

  // Filter by search
  if (searchProduct.value) {
    const search = searchProduct.value.toLowerCase()
    products = products.filter((p: any) =>
      p.title.toLowerCase().includes(search) ||
      p.barcode.toLowerCase().includes(search)
    )
  }

  return products
})

// Current products (already linked to this supplier)
const currentProducts = computed(() => {
  if (!store.selectedSupplier?.productSupplier) return []

  return store.selectedSupplier.productSupplier.map((ps: any) => ({
    id: ps.product.id,
    title: ps.product.title,
    barcode: ps.product.barcode,
    price: ps.price,
    isDefault: ps.isDefault,
  }))
})

function toggleProductSelection(productId: number, defaultPrice: number) {
  if (selectedProducts.value.has(productId)) {
    selectedProducts.value.delete(productId)
  } else {
    selectedProducts.value.set(productId, defaultPrice)
  }
}

function updatePrice(productId: number, price: number) {
  selectedProducts.value.set(productId, price)
}

async function addProducts() {
  if (selectedProducts.value.size === 0) {
    notify.error('Iltimos, mahsulot tanlang')
    return
  }

  // Convert Map to array of objects
  const products = Array.from(selectedProducts.value.entries()).map(([id, price]) => ({
    id,
    price,
  }))

  try {
    const res = await store.manageProducts(
      store.selectedSupplier.id,
      'add',
      products
    )

    // Reload supplier data
    const data = await store.getSupplier(store.selectedSupplier.id)
    store.selectedSupplier = data.data
    await store.getSuppliers()

    selectedProducts.value.clear()

    notify.success(res.message || 'Mahsulotlar qo\'shildi')
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

async function removeProducts() {
  if (selectedCurrentProducts.value.length === 0) {
    notify.error('Iltimos, mahsulot tanlang')
    return
  }

  try {
    const res = await store.manageProducts(
      store.selectedSupplier.id,
      'remove',
      selectedCurrentProducts.value
    )

    // Reload supplier data
    const data = await store.getSupplier(store.selectedSupplier.id)
    store.selectedSupplier = data.data
    await store.getSuppliers()

    selectedCurrentProducts.value = []

    notify.success(res.message || 'Mahsulotlar o\'chirildi')
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

function closeDialog() {
  store.productsDialog = false
  selectedProducts.value.clear()
  selectedCurrentProducts.value = []
  searchProduct.value = ''
}
</script>

<template>
  <q-dialog v-model="store.productsDialog" @hide="closeDialog">
    <q-card dark:bg-gray-8 p-16px w-1000px max-w-95vw>
      <q-card-section>
        <div class="text-h6">
          {{ store.selectedSupplier?.name }} - Mahsulotlar boshqaruvi
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Available Products -->
          <div class="col-6">
            <div class="text-subtitle1 q-mb-sm">Mavjud mahsulotlar</div>

            <q-input
              v-model="searchProduct"
              outlined
              dense
              placeholder="Qidirish (nomi yoki barcode)"
              class="q-mb-md"
            >
              <template #prepend>
                <Icon icon="mdi:magnify" />
              </template>
            </q-input>

            <q-card flat bordered>
              <q-card-section class="q-pa-sm" style="max-height: 450px; overflow-y: auto;">
                <div v-if="availableProducts.length === 0" class="text-center text-grey-6 q-pa-md">
                  {{ searchProduct ? 'Mahsulot topilmadi' : 'Barcha mahsulotlar biriktirilgan' }}
                </div>
                <div v-else>
                  <div
                    v-for="product in availableProducts"
                    :key="product.id"
                    class="q-mb-sm"
                  >
                    <q-checkbox
                      :model-value="selectedProducts.has(product.id)"
                      @update:model-value="toggleProductSelection(product.id, product.sellPrice || 0)"
                      :label="`${product.title} (${product.barcode})`"
                      dense
                    />
                    <q-input
                      v-if="selectedProducts.has(product.id)"
                      :model-value="selectedProducts.get(product.id)"
                      @update:model-value="(val) => updatePrice(product.id, Number(val))"
                      label="Narx"
                      outlined
                      dense
                      type="number"
                      min="0"
                      class="q-ml-lg q-mt-xs"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <div class="q-mt-md">
              <q-btn
                unelevated
                color="primary"
                label="Qo'shish"
                icon="add"
                :disable="selectedProducts.size === 0"
                @click="addProducts"
                class="full-width"
              />
            </div>
          </div>

          <!-- Current Products -->
          <div class="col-6">
            <div class="text-subtitle1 q-mb-sm">Biriktirilgan mahsulotlar</div>
            <q-card flat bordered>
              <q-card-section class="q-pa-sm" style="max-height: 535px; overflow-y: auto;">
                <q-option-group
                  v-model="selectedCurrentProducts"
                  :options="currentProducts.map((p: any) => ({
                    label: `${p.title} (${p.barcode}) - ${p.price?.toLocaleString() || 0} so'm${p.isDefault ? ' ⭐' : ''}`,
                    value: p.id,
                  }))"
                  type="checkbox"
                  dense
                />
                <div v-if="currentProducts.length === 0" class="text-center text-grey-6 q-pa-md">
                  Mahsulotlar biriktirilmagan
                </div>
              </q-card-section>
            </q-card>

            <div class="q-mt-md">
              <q-btn
                unelevated
                color="negative"
                label="O'chirish"
                icon="remove"
                :disable="selectedCurrentProducts.length === 0"
                @click="removeProducts"
                class="full-width"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Yopish" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
