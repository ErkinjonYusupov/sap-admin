<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '~/stores/orders'
import { useSuppliersStore } from '~/stores/suppliers'
import { useProductsStore } from '~/stores/products'

const router = useRouter()
const ordersStore = useOrdersStore()
const suppliersStore = useSuppliersStore()
const productsStore = useProductsStore()
const notify = useNotify()

// Form data
const formData = ref({
  type: 'PURCHASE' as 'PURCHASE' | 'SALE' | 'EXPENSE',
  supplierId: null as number | null,
  notes: '',
  items: [] as { productId: number; product?: any; quantity: number; price: number }[],
})

// Options
const typeOptions = [
  { label: 'Kirim', value: 'PURCHASE' },
  { label: 'Chiqim', value: 'EXPENSE' },
]

const suppliers = ref<any[]>([])
const supplierProducts = ref<any[]>([])
const allProducts = ref<any[]>([])

// Product search
const productSearch = ref('')
const showProductDialog = ref(false)
const searchTimeout = ref<any>(null)

// Computed
const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price)
  }, 0)
})

const supplierOptions = computed(() => {
  return suppliers.value.map(s => ({
    label: s.name,
    value: s.id,
  }))
})

// Filtered products based on search - use supplier products or all products
const filteredProducts = computed(() => {
  // Use supplier products if supplier is selected, otherwise use all products
  const products = formData.value.supplierId ? supplierProducts.value : allProducts.value

  if (!productSearch.value) return products

  const search = productSearch.value.toLowerCase()
  return products.filter((p: any) =>
    p.title.toLowerCase().includes(search) ||
    p.barcode?.toLowerCase().includes(search)
  )
})

// Load data
onMounted(async () => {
  await loadSuppliers()
})

async function loadSuppliers() {
  try {
    const res = await suppliersStore.getSuppliers()
    suppliers.value = res.data || []
  }
  catch (error) {
    console.error('Error loading suppliers:', error)
  }
}

async function loadSupplierProducts() {
  if (!formData.value.supplierId) {
    supplierProducts.value = []
    return
  }

  try {
    useOverlay(true)
    const res = await suppliersStore.getSupplier(formData.value.supplierId)
    const supplier = res.data

    // Map supplier products with their prices
    if (supplier.productSupplier && supplier.productSupplier.length > 0) {
      supplierProducts.value = supplier.productSupplier.map((ps: any) => ({
        id: ps.product.id,
        title: ps.product.title,
        barcode: ps.product.barcode,
        price: ps.price, // Price from supplier-product relationship
      }))
    } else {
      supplierProducts.value = []
    }
  }
  catch (error) {
    console.error('Error loading supplier products:', error)
    notify.error('Mahsulotlarni yuklashda xatolik')
    supplierProducts.value = []
  }
  finally {
    useOverlay(false)
  }
}

async function loadAllProducts() {
  try {
    useOverlay(true)
    productsStore.search = ''
    productsStore.pagination.currentPage = 1
    const res = await productsStore.getProducts()

    // Map all products with their default prices
    allProducts.value = (res.data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      barcode: p.barcode,
      price: p.price || 0,
    }))
  }
  catch (error) {
    console.error('Error loading all products:', error)
    notify.error('Mahsulotlarni yuklashda xatolik')
    allProducts.value = []
  }
  finally {
    useOverlay(false)
  }
}

// Watch supplier change to load products
watch(() => formData.value.supplierId, async (newSupplierId) => {
  if (newSupplierId) {
    await loadSupplierProducts()
  } else {
    supplierProducts.value = []
  }
})

async function openProductDialog() {
  // For PURCHASE, supplier is required
  if (formData.value.type === 'PURCHASE' && !formData.value.supplierId) {
    notify.error('Avval yetkazuvchini tanlang')
    return
  }

  // If supplier selected, check if they have products
  if (formData.value.supplierId && supplierProducts.value.length === 0) {
    notify.error('Bu yetkazuvchiga mahsulot biriktirilmagan')
    return
  }

  // For EXPENSE without supplier, load all products
  if (formData.value.type === 'EXPENSE' && !formData.value.supplierId) {
    await loadAllProducts()
  }

  showProductDialog.value = true
  productSearch.value = ''
}

function addProduct(product: any) {
  // Check if already added
  const exists = formData.value.items.find(item => item.productId === product.id)
  if (exists) {
    notify.warning('Mahsulot allaqachon qo\'shilgan')
    return
  }

  formData.value.items.push({
    productId: product.id,
    product: product,
    quantity: 1,
    price: product.price, // Use price from supplier-product relationship
  })

  showProductDialog.value = false
}

function removeItem(index: number) {
  formData.value.items.splice(index, 1)
}

async function submit() {
  // Validation
  if (!formData.value.type) {
    notify.error('Buyurtma turini tanlang')
    return
  }

  // Supplier required only for PURCHASE
  if (formData.value.type === 'PURCHASE' && !formData.value.supplierId) {
    notify.error('Yetkazuvchini tanlang')
    return
  }

  // Notes required for EXPENSE without supplier
  if (formData.value.type === 'EXPENSE' && !formData.value.supplierId && !formData.value.notes.trim()) {
    notify.error('Yetkazuvchi tanlanmagan bo\'lsa, izoh majburiy')
    return
  }

  if (formData.value.items.length === 0) {
    notify.error('Kamida bitta mahsulot qo\'shing')
    return
  }

  // Check quantities and prices
  for (const item of formData.value.items) {
    if (item.quantity <= 0) {
      notify.error('Mahsulot miqdori 0 dan katta bo\'lishi kerak')
      return
    }
    if (item.price <= 0) {
      notify.error('Mahsulot narxi 0 dan katta bo\'lishi kerak')
      return
    }
  }

  try {
    const payload = {
      type: formData.value.type,
      supplierId: formData.value.supplierId || undefined,
      items: formData.value.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      notes: formData.value.notes || undefined,
    }

    const res = await ordersStore.createOrder(payload)
    notify.success(res.message || 'Buyurtma yaratildi')
    router.push('/orders')
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

function goBack() {
  router.push('/orders')
}
</script>

<template>
  <div>
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div flex items-center justify-between>
          <div>
            <div class="text-h5">Yangi buyurtma</div>
            <div class="text-caption text-grey-7">
              Buyurtma yaratish
            </div>
          </div>
          <div flex gap-2>
            <q-btn flat icon="mdi-arrow-left" label="Orqaga" @click="goBack" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-select
              v-model="formData.type"
              :options="typeOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Turi *"
              outlined
              dense
            />
          </div>
          <div class="col-6">
            <q-select
              v-model="formData.supplierId"
              :options="supplierOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :label="formData.type === 'PURCHASE' ? 'Yetkazuvchi *' : 'Yetkazuvchi'"
              outlined
              dense
              clearable
            />
          </div>
        </div>

        <div class="q-mt-md">
          <q-input
            v-model="formData.notes"
            type="textarea"
            :label="formData.type === 'EXPENSE' && !formData.supplierId ? 'Izoh *' : 'Izoh'"
            :hint="formData.type === 'EXPENSE' && !formData.supplierId ? 'Yetkazuvchi tanlanmagan bo\'lsa, izoh majburiy' : ''"
            outlined
            dense
            rows="3"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div flex items-center justify-between class="q-mb-md">
          <div class="text-h6">Mahsulotlar</div>
          <q-btn unelevated color="primary" @click="openProductDialog">
            <Icon icon="mdi:plus" mr-2 />
            Mahsulot qo'shish
          </q-btn>
        </div>

        <q-table
          v-if="formData.items.length"
          :rows="formData.items"
          :columns="[
            { name: 'barcode', label: 'Barcode', field: (row: any) => row.product?.barcode || '-', align: 'left' },
            { name: 'product', label: 'Mahsulot', field: (row: any) => row.product?.title || '-', align: 'left' },
            { name: 'quantity', label: 'Miqdor', field: 'quantity', align: 'center' },
            { name: 'price', label: 'Narx', field: 'price', align: 'right' },
            { name: 'total', label: 'Jami', field: (row: any) => (row.quantity * row.price).toLocaleString(), align: 'right' },
            { name: 'actions', label: 'Amallar', field: 'actions', align: 'center' },
          ]"
          row-key="productId"
          flat
          dense
          hide-pagination
        >
          <template #body-cell-quantity="props">
            <q-td :props="props">
              <q-input
                v-model.number="props.row.quantity"
                type="number"
                min="1"
                dense
                outlined
                style="width: 80px"
              />
            </q-td>
          </template>

          <template #body-cell-price="props">
            <q-td :props="props">
              <span v-if="formData.supplierId">
                {{ props.row.price.toLocaleString() }} so'm
              </span>
              <q-input
                v-else
                v-model.number="props.row.price"
                type="number"
                min="0"
                dense
                outlined
                style="width: 120px"
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense @click="removeItem(props.rowIndex)">
                <Icon icon="mdi:delete" text-16px color="red" />
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <div v-else class="text-center text-grey-7 q-py-md">
          Mahsulot qo'shilmagan
        </div>

        <div v-if="formData.items.length" class="q-mt-md text-right">
          <div class="text-h6">
            Umumiy summa: <span class="text-primary">{{ totalAmount.toLocaleString() }} so'm</span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Bekor qilish" @click="goBack" />
        <q-btn unelevated color="primary" label="Saqlash" @click="submit" />
      </q-card-actions>
    </q-card>

    <!-- Product Selection Dialog -->
    <q-dialog v-model="showProductDialog">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Mahsulot tanlash</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="productSearch"
            placeholder="Qidirish..."
            outlined
            dense
            class="q-mb-md"
          >
            <template #prepend>
              <Icon icon="mdi:magnify" />
            </template>
          </q-input>

          <q-list bordered separator>
            <q-item
              v-for="product in filteredProducts"
              :key="product.id"
              clickable
              @click="addProduct(product)"
            >
              <q-item-section>
                <q-item-label>{{ product.title }}</q-item-label>
                <q-item-label caption>{{ product.barcode }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ product.price?.toLocaleString() || 0 }} so'm</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="!filteredProducts.length" class="text-center text-grey-7 q-py-md">
            Mahsulot topilmadi
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<route lang="yaml">
meta:
  rule: 'orders_create'
</route>
