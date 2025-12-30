<script setup lang="ts">
defineOptions({
  name: 'QuasarDemo',
})

const text = ref('')

// Quasar composables are auto-imported
const $q = useQuasar()

function showNotification() {
  $q.notify({
    message: 'Quasar ishlayapti!',
    color: 'positive',
    position: 'top',
  })
}

function showDialog() {
  $q.dialog({
    title: 'Quasar Dialog',
    message: 'Bu Quasar Dialog komponenti!',
  })
}

useHead({
  title: 'Quasar Demo',
})
</script>

<template>
  <div class="q-pa-md">
    <div class="q-mb-md text-h3">
      Quasar UI Demo
    </div>

    <div class="q-gutter-md" style="max-width: 600px">
      <!-- Buttons -->
      <div>
        <q-btn
          color="primary"
          label="Primary Button"
          @click="showNotification"
        />
        <q-btn
          color="secondary"
          label="Show Dialog"
          class="q-ml-sm"
          @click="showDialog"
        />
      </div>

      <!-- Input -->
      <q-input
        v-model="text"
        filled
        label="Quasar Input"
        hint="Bu Quasar input komponenti"
      />

      <!-- Card -->
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Quasar Card
          </div>
          <div class="text-subtitle2">
            by Quasar Framework
          </div>
        </q-card-section>

        <q-card-section>
          Quasar UI loyihangizga muvaffaqiyatli qo'shildi! Barcha Quasar komponentlari avtomatik ravishda import qilinadi.
        </q-card-section>

        <q-card-actions>
          <q-btn flat color="primary">
            Action 1
          </q-btn>
          <q-btn flat color="primary">
            Action 2
          </q-btn>
        </q-card-actions>
      </q-card>

      <!-- List -->
      <q-list bordered separator>
        <q-item v-ripple clickable>
          <q-item-section avatar>
            <q-icon color="primary" name="bluetooth" />
          </q-item-section>
          <q-item-section>List Item 1</q-item-section>
        </q-item>
        <q-item v-ripple clickable>
          <q-item-section avatar>
            <q-icon color="secondary" name="wifi" />
          </q-item-section>
          <q-item-section>List Item 2</q-item-section>
        </q-item>
      </q-list>

      <div class="q-mt-md">
        <router-link to="/">
          <q-btn outline color="primary" label="Bosh sahifaga qaytish" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
