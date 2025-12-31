<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useSuppliersStore } from '~/stores/suppliers'
import { useProductsStore } from '~/stores/products'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const store = useSuppliersStore()
const productsStore = useProductsStore()
const notify = useNotify()

const supplierId = computed(() => Number(route.query.id))
const supplier = ref<any>(null)

const searchProduct = ref('')
const selectedProducts = ref<Map<number, number>>(new Map()) // productId -> price
const selectedCurrentProducts = ref<number[]>([])
const editDialog = ref(false)
const editingProduct = ref<any>(null)
const editPrice = ref<number>(0)

// Load supplier and products
onMounted(async () => {
  if (!supplierId.value) {
    notify.error('Yetkazuvchi ID topilmadi')
    router.push('/suppliers')
    return
  }

  useOverlay(true)
  try {
    const data = await store.getSupplier(supplierId.value)
    supplier.value = data.data
    productsStore.search = ''
    productsStore.categoryFilter = null
    productsStore.pagination.currentPage = 1
    await productsStore.getProducts()
  }
  catch (error) {
    notify.error('Yetkazuvchini yuklashda xatolik')
    router.push('/suppliers')
  }
  finally {
    useOverlay(false)
  }
})

// Watch for pagination changes
watch(() => productsStore.pagination.currentPage, async () => {
  await productsStore.getProducts()
})

// Watch for search changes with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchProduct, async (newVal) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(async () => {
    productsStore.search = newVal
    productsStore.pagination.currentPage = 1
    await productsStore.getProducts()
  }, 500)
})

// Available products (not yet linked to this supplier)
const availableProducts = computed(() => {
  if (!supplier.value?.productSupplier) return productsStore.products

  const linkedProductIds = supplier.value.productSupplier.map((ps: any) => ps.productId)
  return productsStore.products.filter((p: any) => !linkedProductIds.includes(p.id))
})

// Current products (already linked to this supplier)
const currentProducts = computed(() => {
  if (!supplier.value?.productSupplier) return []

  return supplier.value.productSupplier.map((ps: any) => ({
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
      supplierId.value,
      'add',
      products
    )

    // Reload supplier data
    const data = await store.getSupplier(supplierId.value)
    supplier.value = data.data

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
      supplierId.value,
      'remove',
      selectedCurrentProducts.value
    )

    // Reload supplier data
    const data = await store.getSupplier(supplierId.value)
    supplier.value = data.data

    selectedCurrentProducts.value = []

    notify.success(res.message || 'Mahsulotlar o\'chirildi')
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

function openEditDialog(product: any) {
  editingProduct.value = product
  editPrice.value = product.price || 0
  editDialog.value = true
}

async function saveEditPrice() {
  if (!editingProduct.value) return

  try {
    const res = await store.updateProductPrice(
      supplierId.value,
      editingProduct.value.id,
      editPrice.value
    )

    // Reload supplier data
    const data = await store.getSupplier(supplierId.value)
    supplier.value = data.data

    editDialog.value = false
    editingProduct.value = null

    notify.success(res.message || 'Narx yangilandi')
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

function closeEditDialog() {
  editDialog.value = false
  editingProduct.value = null
  editPrice.value = 0
}

function goBack() {
  router.push('/suppliers')
}
</script>

<template>
  <div v-if="supplier">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div flex items-center justify-between>
          <div>
            <div class="text-h5">{{ supplier.name }} - Mahsulotlar boshqaruvi</div>
            <div class="text-caption text-grey-7">
              Telefon: {{ supplier.phone }}
            </div>
          </div>
          <q-btn flat icon="mdi-arrow-left" label="Orqaga" @click="goBack" />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Available Products -->
          <div class="col-6">
            <div class="text-h6 q-mb-md">Mavjud mahsulotlar</div>

            <q-input
              v-model="searchProduct"
              outlined
              dense
              placeholder="Qidirish (nomi yoki barcode)"
              class="q-mb-md"
            >
              <template #prepend>
                <Icon icon="line-md:edit-twotone" />
              </template>
            </q-input>

            <q-card flat bordered>
              <q-card-section class="q-pa-sm" style="max-height: 500px; overflow-y: auto;">
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

            <div class="q-mt-md flex justify-center">
              <q-pagination
                v-model="productsStore.pagination.currentPage"
                :max="productsStore.pagination.totalPages"
                direction-links
                boundary-links
                size="sm"
              />
            </div>

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
            <div class="text-h6 q-mb-md">Biriktirilgan mahsulotlar</div>
            <q-card flat bordered>
              <q-card-section class="q-pa-sm" style="max-height: 585px; overflow-y: auto;">
                <div v-if="currentProducts.length === 0" class="text-center text-grey-6 q-pa-md">
                  Mahsulotlar biriktirilmagan
                </div>
                <q-list v-else separator>
                  <q-item
                    v-for="product in currentProducts"
                    :key="product.id"
                    dense
                  >
                    <q-item-section>
                      <q-item-label>
                        {{ product.title }} {{ product.isDefault ? '⭐' : '' }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ product.barcode }} | {{ product.price?.toLocaleString() || 0 }} so'm
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div flex gap-2>
                        <q-btn
                          flat
                          dense
                          round
                        
                          
                          @click="openEditDialog(product)"
                        >
                <Icon icon="line-md:edit-twotone" text-24px/>

                          <q-tooltip>Narxni tahrirlash</q-tooltip>
                        </q-btn>
                        <q-checkbox
                          v-model="selectedCurrentProducts"
                          :val="product.id"
                          dense
                        >
                          <q-tooltip>O'chirish uchun belgilash</q-tooltip>
                        </q-checkbox>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <div class="q-mt-md">
              <q-btn
                unelevated
                color="negative"
                label="Belgilanganlarni o'chirish"
                icon="remove"
                :disable="selectedCurrentProducts.length === 0"
                @click="removeProducts"
                class="full-width"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Edit Price Dialog -->
    <q-dialog v-model="editDialog" @hide="closeEditDialog">
      <q-card dark:bg-gray-8 p-16px w-400px>
        <q-card-section>
          <div class="text-h6">Narxni tahrirlash</div>
          <div class="text-caption text-grey-7" v-if="editingProduct">
            {{ editingProduct.title }} ({{ editingProduct.barcode }})
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model.number="editPrice"
            label="Narx"
            outlined
            type="number"
            min="0"
            autofocus
          >
            <template #append>
              <Icon icon="mdi:currency-usd" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Bekor qilish" @click="closeEditDialog" />
          <q-btn unelevated color="primary" label="Saqlash" @click="saveEditPrice" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'suppliers_edit'
</route>
