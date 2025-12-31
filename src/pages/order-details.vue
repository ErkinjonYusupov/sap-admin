<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '~/stores/orders'
import { formatDate } from '~/composables/helpers'
import AddItemDialog from '~/components/orders/AddItemDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useOrdersStore()
const notify = useNotify()

const orderId = computed(() => Number(route.query.id))
const order = ref<any>(null)
const editDialog = ref(false)
const editingItem = ref<any>(null)
const addItemDialog = ref(false)

// Check if order can be edited
const canEdit = computed(() => {
  return order.value?.status === 'PENDING' && order.value?.type === 'PURCHASE'
})

// Load order
onMounted(async () => {
  if (!orderId.value) {
    notify.error('Buyurtma ID topilmadi')
    router.push('/orders')
    return
  }

  useOverlay(true)
  try {
    const data = await store.getOrder(orderId.value)
    order.value = data.data
  }
  catch (error) {
    notify.error('Buyurtmani yuklashda xatolik')
    router.push('/orders')
  }
  finally {
    useOverlay(false)
  }
})

function getTypeLabel(type: string) {
  const types: any = {
    PURCHASE: 'Kirim',
    SALE: 'Sotuv',
    EXPENSE: 'Chiqim',
  }
  return types[type] || type
}

function getStatusLabel(status: string) {
  const statuses: any = {
    PENDING: 'Kutilmoqda',
    COMPLETED: 'Bajarildi',
    CANCELLED: 'Bekor qilindi',
  }
  return statuses[status] || status
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'orange'
    case 'COMPLETED': return 'green'
    case 'CANCELLED': return 'red'
    default: return 'grey'
  }
}

function printOrder() {
  window.print()
}

function goBack() {
  router.push('/orders')
}

function openEditDialog(item: any) {
  editingItem.value = {
    productId: item.product?.id,
    productTitle: item.product?.title,
    productBarcode: item.product?.barcode,
    quantity: item.quantity,
    price: item.price,
  }
  editDialog.value = true
}

async function saveEdit() {
  if (!editingItem.value) return

  if (editingItem.value.quantity <= 0) {
    notify.error('Miqdor 0 dan katta bo\'lishi kerak')
    return
  }

  if (editingItem.value.price <= 0) {
    notify.error('Narx 0 dan katta bo\'lishi kerak')
    return
  }

  try {
    const res = await store.updateOrderItem(orderId.value, {
      productId: editingItem.value.productId,
      quantity: editingItem.value.quantity,
      price: editingItem.value.price,
    })

    notify.success(res.message || 'Mahsulot yangilandi')

    // Reload order
    const data = await store.getOrder(orderId.value)
    order.value = data.data

    editDialog.value = false
    editingItem.value = null
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

function openAddItemDialog() {
  addItemDialog.value = true
}

async function completeOrder() {
  const confirmed = await useDialog().confirm({
    title: 'Bajarildi',
    message: 'Buyurtmani bajarildi deb belgilaysizmi?',
  })

  if (confirmed) {
    try {
      const res = await store.updateOrderStatus(orderId.value, 'COMPLETED')

      // Reload order
      const data = await store.getOrder(orderId.value)
      order.value = data.data

      notify.success(res.message || 'Buyurtma bajarildi')
    }
    catch (err: any) {
      notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
    }
  }
}
</script>

<template>
  <div v-if="order">
    <!-- Screen View -->
    <div class="print-hidden">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div flex items-center justify-between>
            <div>
              <div class="text-h5">{{ order.orderNumber }}</div>
              <div class="text-caption text-grey-7">
                {{ getTypeLabel(order.type) }} • {{ formatDate(order.createdAt) }}
              </div>
            </div>
            <div flex gap-2>
              <q-btn flat icon="mdi-arrow-left" label="Orqaga" @click="goBack" />
              <q-btn
                v-if="canEdit"
                unelevated
                color="positive"
                icon="mdi-check"
                label="Bajarildi"
                @click="completeOrder"
              />
              <q-btn unelevated color="primary" icon="mdi-printer" label="Pechat" @click="printOrder" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">Ma'lumotlar</div>
              <div class="q-mb-sm">
                <strong>Holati:</strong>
                <q-badge :color="getStatusColor(order.status)" class="q-ml-sm">
                  {{ getStatusLabel(order.status) }}
                </q-badge>
              </div>
              <div class="q-mb-sm" v-if="order.supplier">
                <strong>Yetkazuvchi:</strong> {{ order.supplier.name }}
              </div>
              <div class="q-mb-sm" v-if="order.creator">
                <strong>Yaratuvchi:</strong> {{ order.creator.fullName }}
              </div>
              <div v-if="order.notes">
                <strong>Izoh:</strong> {{ order.notes }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">Summa</div>
              <div class="text-h4 text-primary">
                {{ order.totalAmount?.toLocaleString() }} so'm
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat bordered>
        <q-card-section>
          <div flex items-center justify-between class="q-mb-md">
            <div class="text-h6">Mahsulotlar</div>
            <q-btn
              v-if="canEdit"
              unelevated
              color="primary"
              size="sm"
              @click="openAddItemDialog"
            >
              <Icon icon="mdi:plus" mr-2 />
              Mahsulot qo'shish
            </q-btn>
          </div>
          <q-table
            :rows="order.items || []"
            :columns="[
              { name: 'product', label: 'Mahsulot', field: (row: any) => row.product?.title || '-', align: 'left' },
              { name: 'barcode', label: 'Barcode', field: (row: any) => row.product?.barcode || '-', align: 'left' },
              { name: 'quantity', label: 'Miqdor', field: 'quantity', align: 'center' },
              { name: 'price', label: 'Narx', field: (row: any) => row.price?.toLocaleString() || '0', align: 'right' },
              { name: 'totalPrice', label: 'Jami', field: (row: any) => row.totalPrice?.toLocaleString() || '0', align: 'right' },
              ...(canEdit ? [{ name: 'actions', label: 'Amallar', field: 'actions', align: 'center' as const }] : []),
            ]"
            row-key="id"
            flat
            dense
          >
            <template #body-cell-actions="props" v-if="canEdit">
              <q-td :props="props">
                <q-btn flat dense @click="openEditDialog(props.row)">
                  <q-tooltip>Tahrirlash</q-tooltip>
                  <Icon icon="mdi:pencil" text-16px />
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Print View -->
    <div class="print-only">
      <div class="print-page">
        <div class="print-header">
          <h1>{{ getTypeLabel(order.type) }}</h1>
          <h2>{{ order.orderNumber }}</h2>
          <p>Sana: {{ formatDate(order.createdAt) }}</p>
        </div>

        <div class="print-info">
          <div class="info-row">
            <strong>Holati:</strong> {{ getStatusLabel(order.status) }}
          </div>
          <div class="info-row" v-if="order.supplier">
            <strong>Yetkazuvchi:</strong> {{ order.supplier.name }}
          </div>
          <div class="info-row" v-if="order.creator">
            <strong>Yaratuvchi:</strong> {{ order.creator.fullName }}
          </div>
          <div class="info-row" v-if="order.notes">
            <strong>Izoh:</strong> {{ order.notes }}
          </div>
        </div>

        <table class="print-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Mahsulot</th>
              <th>Barcode</th>
              <th>Miqdor</th>
              <th>Narx</th>
              <th>Jami</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in order.items" :key="item.id">
              <td>{{ Number(index) + 1 }}</td>
              <td>{{ item.product?.title || '-' }}</td>
              <td>{{ item.product?.barcode || '-' }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.price?.toLocaleString() }} so'm</td>
              <td>{{ item.totalPrice?.toLocaleString() }} so'm</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="text-right"><strong>Umumiy summa:</strong></td>
              <td><strong>{{ order.totalAmount?.toLocaleString() }} so'm</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Edit Item Dialog -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Mahsulotni tahrirlash</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="editingItem">
          <div class="q-mb-md">
            <strong>Mahsulot:</strong> {{ editingItem.productTitle }}
          </div>
          <div class="q-mb-md">
            <strong>Barcode:</strong> {{ editingItem.productBarcode || '-' }}
          </div>

          <q-input
            v-model.number="editingItem.quantity"
            type="number"
            label="Miqdor *"
            outlined
            dense
            min="1"
            class="q-mb-md"
          />

          <q-input
            v-model.number="editingItem.price"
            type="number"
            label="Narx *"
            outlined
            dense
            min="0"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Bekor qilish" v-close-popup />
          <q-btn unelevated color="primary" label="Saqlash" @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Item Dialog -->
    <AddItemDialog
      v-model="addItemDialog"
      :order-id="orderId"
      :supplier-id="order?.supplier?.id"
      :order-items="order?.items || []"
      @saved="async () => {
        const data = await store.getOrder(orderId)
        order.value = data.data
      }"
    />
  </div>
</template>

<style>
/* Global print styles - not scoped to hide layout elements */
@media print {
  /* Hide all layout elements */
  .q-drawer,
  .q-header,
  .q-footer,
  .appbar-main {
    display: none !important;
  }

  /* Remove page container padding/margin */
  .q-page-container {
    padding-left: 0 !important;
    padding-top: 0 !important;
  }

  /* Remove page background and padding */
  .q-page {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Reset body and html */
  body,
  html {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  /* Hide all screen content */
  .print-hidden {
    display: none !important;
  }

  /* Show only print content */
  .print-only {
    display: block !important;
  }
}
</style>

<style scoped>
@media print {
  .print-hidden {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }
}

@media screen {
  .print-only {
    display: none !important;
  }
}

.print-page {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  margin: 0 auto;
  background: white;
  color: black;
}

.print-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
}

.print-header h1 {
  margin: 0;
  font-size: 28px;
}

.print-header h2 {
  margin: 10px 0;
  font-size: 20px;
}

.print-info {
  margin-bottom: 30px;
}

.info-row {
  margin-bottom: 10px;
  font-size: 14px;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.print-table th,
.print-table td {
  border: 1px solid #333;
  padding: 8px;
  text-align: left;
}

.print-table th {
  background-color: #f0f0f0;
  font-weight: bold;
}

.print-table tfoot td {
  border-top: 2px solid #333;
}

.text-right {
  text-align: right;
}
</style>

<route lang="yaml">
meta:
  rule: 'orders_show'
</route>
