<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useOrdersStore } from '~/stores/orders'
import { useSuppliersStore } from '~/stores/suppliers'

const props = defineProps<{
  modelValue: boolean
  orderId: number
  supplierId?: number
  orderItems?: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const ordersStore = useOrdersStore()
const suppliersStore = useSuppliersStore()
const notify = useNotify()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const supplierProducts = ref<any[]>([])
const productSearch = ref('')
const selectedProduct = ref<any>(null)
const formData = ref({
  quantity: 1,
  price: 0,
})

// Load supplier products when dialog opens
watch(() => props.modelValue, async (val) => {
  if (val && props.supplierId) {
    await loadSupplierProducts()
  } else {
    resetForm()
  }
})

async function loadSupplierProducts() {
  if (!props.supplierId) return

  try {
    useOverlay(true)
    const res = await suppliersStore.getSupplier(props.supplierId)
    const supplier = res.data

    if (supplier.productSupplier && supplier.productSupplier.length > 0) {
      supplierProducts.value = supplier.productSupplier.map((ps: any) => ({
        id: ps.product.id,
        title: ps.product.title,
        barcode: ps.product.barcode,
        price: ps.price,
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

const filteredProducts = computed(() => {
  // First filter out products already in the order
  const orderProductIds = (props.orderItems || []).map((item: any) => item.product?.id)
  let available = supplierProducts.value.filter((p: any) => !orderProductIds.includes(p.id))

  // Then apply search filter
  if (!productSearch.value) return available

  const search = productSearch.value.toLowerCase()
  return available.filter((p: any) =>
    p.title.toLowerCase().includes(search) ||
    p.barcode?.toLowerCase().includes(search)
  )
})

function selectProduct(product: any) {
  selectedProduct.value = product
  formData.value.price = product.price
}

function resetForm() {
  selectedProduct.value = null
  productSearch.value = ''
  formData.value = {
    quantity: 1,
    price: 0,
  }
}

async function submit() {
  if (!selectedProduct.value) {
    notify.error('Mahsulot tanlang')
    return
  }

  if (formData.value.quantity <= 0) {
    notify.error('Miqdor 0 dan katta bo\'lishi kerak')
    return
  }

  if (formData.value.price <= 0) {
    notify.error('Narx 0 dan katta bo\'lishi kerak')
    return
  }

  try {
    const res = await ordersStore.updateOrderItem(props.orderId, {
      productId: selectedProduct.value.id,
      quantity: formData.value.quantity,
      price: formData.value.price,
    })

    notify.success(res.message || 'Mahsulot qo\'shildi')
    emit('saved')
    dialog.value = false
    resetForm()
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}
</script>

<template>
  <q-dialog v-model="dialog">
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Mahsulot qo'shish</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-if="!selectedProduct">
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

          <q-list bordered separator style="max-height: 400px; overflow-y: auto;">
            <q-item
              v-for="product in filteredProducts"
              :key="product.id"
              clickable
              @click="selectProduct(product)"
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
        </div>

        <div v-else>
          <div class="q-mb-md">
            <strong>Mahsulot:</strong> {{ selectedProduct.title }}
            <q-btn
              flat
              dense
              size="sm"
              @click="resetForm"
              class="q-ml-sm"
            >
              <Icon icon="mdi:close" />
              O'zgartirish
            </q-btn>
          </div>
          <div class="q-mb-md">
            <strong>Barcode:</strong> {{ selectedProduct.barcode || '-' }}
          </div>

          <q-input
            v-model.number="formData.quantity"
            type="number"
            label="Miqdor *"
            outlined
            dense
            min="1"
            class="q-mb-md"
          />

          <q-input
            v-model.number="formData.price"
            type="number"
            label="Narx *"
            outlined
            dense
            min="0"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Bekor qilish" v-close-popup />
        <q-btn
          unelevated
          color="primary"
          label="Saqlash"
          :disable="!selectedProduct"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
