<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useProductsStore } from '~/stores/products'

const store = useProductsStore()
const uploadDialog = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadResult = ref<any>(null)
const updateExisting = ref(false)
const notify = useNotify()

function selectFile() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

async function uploadFile() {
  if (!selectedFile.value) {
    notify.error('Iltimos, fayl tanlang')
    return
  }

  try {
    const result = await store.uploadExcel(selectedFile.value, updateExisting.value)
    uploadResult.value = result.data
    notify.success(result.message || 'Fayl muvaffaqiyatli yuklandi')
    await store.getProducts()
  }
  catch (err: any) {
    notify.error(err?.response?.data?.message || 'Xatolik yuz berdi!')
  }
}

function closeDialog() {
  uploadDialog.value = false
  selectedFile.value = null
  uploadResult.value = null
  updateExisting.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

defineExpose({ uploadDialog })
</script>

<template>
  <q-dialog v-model="uploadDialog" @hide="closeDialog">
    <q-card dark:bg-gray-8 p-16px w-600px>
      <q-card-section>
        <div class="text-h6">Excel fayl yuklash</div>
        <div class="text-caption text-grey-6">
          Mahsulotlarni ommaviy yuklash uchun Excel faylini tanlang
        </div>
      </q-card-section>

      <q-card-section v-if="!uploadResult">
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Excel format:</div>
          <div class="text-caption text-grey-7 q-mb-md">
            Excel fayli quyidagi ustunlarga ega bo'lishi kerak:
          </div>
          <q-markup-table dense flat bordered class="q-mb-md">
            <thead>
              <tr>
                <th>title</th>
                <th>categoryId</th>
                <th>barcode</th>
                <th>unit</th>
                <th>inputPrice</th>
                <th>sellPrice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-caption">iPhone 15 Pro</td>
                <td class="text-caption">5</td>
                <td class="text-caption">1234567890123</td>
                <td class="text-caption">dona</td>
                <td class="text-caption">10000000</td>
                <td class="text-caption">12000000</td>
              </tr>
            </tbody>
          </q-markup-table>

          <div class="text-caption text-grey-7">
            <strong>Majburiy:</strong> title, categoryId, barcode<br>
            <strong>Ixtiyoriy:</strong> unit (default: "dona"), inputPrice (default: 0), sellPrice (default: 0)
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls"
          hidden
          @change="onFileChange"
        >

        <div class="q-mb-md">
          <q-btn
            unelevated
            color="primary"
            label="Fayl tanlash"
            icon="mdi-file-excel"
            @click="selectFile"
            class="full-width"
          />
          <div v-if="selectedFile" class="q-mt-sm text-caption text-grey-7">
            <Icon icon="mdi:file-excel" class="q-mr-xs" />
            {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(2) }} KB)
          </div>
        </div>

        <div class="q-mb-md">
          <q-checkbox
            v-model="updateExisting"
            label="Mavjud mahsulotlarni yangilash"
            color="primary"
          />
          <div class="text-caption text-grey-7 q-ml-lg">
            Agar bu belgi yoqilgan bo'lsa, barcode bir xil bo'lgan mahsulotlar yangilanadi.
            Aks holda, faqat yangi mahsulotlar qo'shiladi.
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else>
        <div class="q-mb-md">
          <div class="text-h6 text-positive q-mb-sm">
            <Icon icon="mdi:check-circle" class="q-mr-sm" />
            Yuklash yakunlandi
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-positive">{{ uploadResult.success }}</div>
                  <div class="text-caption text-grey-7">Muvaffaqiyatli</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-negative">{{ uploadResult.failed }}</div>
                  <div class="text-caption text-grey-7">Xatolik</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div v-if="uploadResult.errors && uploadResult.errors.length > 0" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Xatoliklar:</div>
            <q-list bordered separator dense>
              <q-item v-for="(error, index) in uploadResult.errors" :key="index">
                <q-item-section>
                  <q-item-label class="text-caption">
                    <strong>Qator {{ error.row }}:</strong> {{ error.error }}
                  </q-item-label>
                  <q-item-label caption v-if="error.data">
                    {{ JSON.stringify(error.data) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Yopish" @click="closeDialog" />
        <q-btn
          v-if="!uploadResult"
          unelevated
          color="primary"
          label="Yuklash"
          :disable="!selectedFile"
          @click="uploadFile"
        />
        <q-btn
          v-else
          unelevated
          color="primary"
          label="Yana yuklash"
          @click="uploadResult = null; selectedFile = null"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
