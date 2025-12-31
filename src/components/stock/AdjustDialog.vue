<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useStockStore } from '~/stores/stock'

const props = defineProps<{
  modelValue: boolean
  product: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const store = useStockStore()
const notify = useNotify()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formData = ref({
  quantity: 0,
  type: 'IN' as 'IN' | 'OUT',
  notes: '',
})

const typeOptions = [
  { label: 'Kirim', value: 'IN' },
  { label: 'Chiqim', value: 'OUT' },
]

function resetForm() {
  formData.value = {
    quantity: 0,
    type: 'IN',
    notes: '',
  }
}

async function submit() {
  if (!formData.value.quantity || formData.value.quantity <= 0) {
    notify.error('Miqdorni kiriting')
    return
  }

  try {
    const payload = {
      productId: props.product.id,
      quantity: formData.value.quantity,
      type: formData.value.type,
      notes: formData.value.notes || undefined,
    }

    const res = await store.adjustStock(payload)
    notify.success(res.message || 'Zaxira yangilandi')
    emit('saved')
    resetForm()
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    resetForm()
  }
})
</script>

<template>
  <q-dialog v-model="dialog">
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Zaxirani tuzatish</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <strong>Mahsulot:</strong> {{ product?.title }}
        </div>
        <div class="q-mb-md">
          <strong>Barcode:</strong> {{ product?.barcode || '-' }}
        </div>

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
          class="q-mb-md"
        />

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
          v-model="formData.notes"
          type="textarea"
          label="Izoh"
          outlined
          dense
          rows="3"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Bekor qilish" v-close-popup />
        <q-btn unelevated color="primary" label="Saqlash" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
