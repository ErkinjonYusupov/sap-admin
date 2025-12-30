<script setup lang="ts">
import useDialog from '~/composables/useDialog'

defineOptions({
  name: 'QuasarDemo',
})

const text = ref('')

// Quasar composables are auto-imported
const $q = useQuasar()
const dialog = useDialog()

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

async function testConfirmDialog() {
  const confirmed = await dialog.confirm({
    title: 'O\'chirish',
    message: 'Haqiqatan ham o\'chirmoqchimisiz?',
    confirmText: 'Ha, o\'chirish',
    cancelText: 'Yo\'q',
  })

  if (confirmed) {
    // Tasdiqlandi - amal bajariladi
    $q.notify({
      message: 'O\'chirish tasdiqlandi va bajarildi!',
      color: 'positive',
      icon: 'check',
    })
  }
  else {
    // Bekor qilindi - amal bajarilmaydi
    $q.notify({
      message: 'Amal bekor qilindi',
      color: 'info',
      icon: 'info',
    })
  }
}

async function testAlertDialog() {
  await dialog.alert({
    title: 'Ma\'lumot',
    message: 'Bu oddiy xabar dialogi.',
  })

  $q.notify({
    message: 'Dialog yopildi',
    color: 'info',
  })
}

function testOverlay() {
  // Overlay'ni ko'rsatish
  useOverlay(true)


  // 3 sekunddan keyin yashirish
  setTimeout(() => {
    useOverlay(false)
    $q.notify({
      message: `Overlay yashirildi! Holat: ${getOverlay()}`,
      color: 'positive',
    })
  }, 3000)
}

function checkOverlayState() {
  const state = getOverlay()
  $q.notify({
    message: `Overlay holati: ${state}`,
    color: 'info',
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
      <div class="q-gutter-sm">
        <q-btn
          color="primary"
          label="Primary Button"
          @click="showNotification"
        />
        <q-btn
          color="secondary"
          label="Show Dialog"
          @click="showDialog"
        />
        <q-btn
          color="accent"
          label="Test Overlay"
          @click="testOverlay"
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
            useOverlay Composable
          </div>
          <div class="text-subtitle2">
            Global Loading Overlay
          </div>
        </q-card-section>

        <q-card-section>
          <p>
            <code>useOverlay</code> composable loyihaning istalgan joyidan global loading overlay'ni boshqarish imkonini beradi.
          </p>
          <p class="q-mt-md">
            <strong>Foydalanish:</strong>
          </p>
          <pre class="q-pa-sm bg-grey-2 rounded-borders">
// Overlay'ni ko'rsatish
useOverlay(true)

// Overlay'ni yashirish
useOverlay(false)

// Holatni tekshirish
const state = getOverlay() // true yoki false qaytaradi</pre>
        </q-card-section>

        <q-card-actions>
          <q-btn flat color="primary" @click="useOverlay(true)">
            Show Overlay
          </q-btn>
          <q-btn flat color="negative" @click="useOverlay(false)">
            Hide Overlay
          </q-btn>
          <q-btn flat color="info" @click="checkOverlayState">
            Check State
          </q-btn>
        </q-card-actions>
      </q-card>

      <!-- useDialog Card -->
      <q-card>
        <q-card-section>
          <div class="text-h6">
            useDialog Composable
          </div>
          <div class="text-subtitle2">
            Tasdiqlash va Xabar Dialoglar
          </div>
        </q-card-section>

        <q-card-section>
          <p>
            <code>useDialog</code> composable tasdiqlash va xabar dialoglarini ko'rsatish uchun.
          </p>
          <p class="q-mt-md">
            <strong>Foydalanish:</strong>
          </p>
          <pre class="q-pa-sm bg-grey-2 rounded-borders">
const dialog = useDialog()

// Tasdiqlash dialogi
const confirmed = await dialog.confirm({
  title: 'O\'chirish',
  message: 'Haqiqatan ham o\'chirmoqchimisiz?',
  confirmText: 'Ha',
  cancelText: 'Yo\'q'
})

if (confirmed) {
  // Amal bajariladi
} else {
  // Amal bekor qilindi
}

// Oddiy xabar
await dialog.alert({
  title: 'Ma\'lumot',
  message: 'Bu xabar...'
})</pre>
        </q-card-section>

        <q-card-actions>
          <q-btn flat color="primary" @click="testConfirmDialog">
            Confirm Dialog
          </q-btn>
          <q-btn flat color="info" @click="testAlertDialog">
            Alert Dialog
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

