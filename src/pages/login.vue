<route lang="yaml">
meta:
  public: true
  layout: empty
</route>

<template>
  <div class="login-page">
    <q-card class="login-card">
      <q-card-section class="text-center">
        <div class="text-h5 text-weight-bold q-mb-md">Tizimga kirish</div>
        <div class="text-grey-7">Davom etish uchun tizimga kiring</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="username"
            outlined
            dense
            label="Foydalanuvchi nomi"
            :error="!!errorMessage"
            class="q-mb-md"
            autofocus
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            outlined
            dense
            label="Parol"
            :type="showPassword ? 'text' : 'password'"
            :error="!!errorMessage"
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-banner v-if="errorMessage" dense rounded class="bg-negative text-white q-mb-md">
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ errorMessage }}
          </q-banner>

          <q-btn
            type="submit"
            color="primary"
            label="Tizimga kirish"
            unelevated
            no-caps
            class="full-width"
            size="md"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useOverlay } from '~/composables/useOverlay'

const authStore = useAuthStore()
const { username, password } = storeToRefs(authStore)
const router = useRouter()

const showPassword = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''

  // Validate
  if (!username.value || !password.value) {
    errorMessage.value = 'Iltimos, barcha maydonlarni to\'ldiring'
    return
  }

  try {
    useOverlay(true)
    const response = await authStore.login()

    // Success
    if (response.status === 'success') {
      router.replace(sessionStorage.getItem('path') || '/')
    sessionStorage.removeItem('path')
    }
  }
  catch (error: any) {
    // Handle error
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    }
    else if (error.message) {
      errorMessage.value = error.message
    }
    else {
      errorMessage.value = 'Login jarayonida xatolik yuz berdi'
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
}
</style>