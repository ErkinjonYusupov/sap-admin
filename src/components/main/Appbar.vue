<script lang='ts' setup>
import { Icon } from '@iconify/vue'
import { Dark } from 'quasar'








const dialog = useDialog()
async function logout() {
    const confirm = await dialog.confirm({
        title: "Chiqish",
        message: "Haqiqatan ham dasturdan chiqmoqchimisiz?",
        confirmText: 'Ha, chiqish',
        cancelText: 'Yo\'q',
    })
    if (confirm) {
        localStorage.removeItem('token')
        location.reload()
    }

}

function toggle_dark() {
    toggleDark()
    Dark.toggle()
}

const store = useAuthStore()
</script>

<template>
    <div class="appbar-main">
        <div flex items-center gap-20px>
            <q-btn  flat >
                <Icon icon="majesticons:menu-line" text-30px />
            </q-btn>
            

            <!-- <Button label="Sovg'a ayirish" prepend="ic:outline-remove" size="large" /> -->
        </div>
        <div class="appbar-right">
            <div flex items-center gap-2>
                
                <q-item v-ripple dense clickable rounded-2 bg-gray-2 dark:bg-gray-6
                    style="max-width: 270px; min-width: 250px">
                    <q-item-section avatar>
                        <q-avatar size="36px">
                            <img src="/assets/images/Pic.png" alt="rasm">
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label lines="1">
                            {{ store.user.fullName }}
                        </q-item-label>
                        <q-item-label caption lines="1">
                            {{ store.user.username }}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <Icon icon="mingcute:down-fill" text-20px />
                    </q-item-section>
                </q-item>
                <q-menu transition-show="jump-down" transition-hide="jump-up" class="w-250px dark:bg-gray-800">
                    <q-list>
                        <q-item v-close-popup clickable dense @click="toggle_dark">
                            <q-item-section>
                                <div flex items-center justify-between>
                                    <div flex items-center gap-8px>
                                        <div i="carbon-sun dark:carbon-moon" text-18px />
                                        <div>Tungi rejim</div>
                                    </div>
                                    <q-toggle v-model="Dark.mode" dense color="" @click="toggle_dark" />
                                </div>
                            </q-item-section>
                        </q-item>
                        <q-item v-close-popup clickable dense @click="logout">
                            <q-item-section>
                                <div flex items-center gap-8px>
                                    <Icon icon="material-symbols:logout" text-20px />
                                    <div>Profildan chiqish</div>
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </div>
        </div>
    </div>
    
</template>

<style scoped lang='scss'>
.appbar-main {
    @apply bg-white py-6.5px flex justify-between pr-16px dark:bg-gray-800 sticky top-0 z-100;

    & .input {
        @apply bg-[#EAECF5] w-400px rounded-8px py-2px px-20px dark:bg-gray-600;
    }
}

.appbar-right {
    @apply flex items-center;
}

@media (max-width: 1024px) {
    .appbar-main {
        @apply py-2px pr-10px;

        & .input {
            @apply w-300px rounded-5px py-0 px-16px;
        }
    }

}

@media (max-width: 700px) {
    .appbar-right {
        display: none;
    }

    .m-input {
        display: block;
    }
}
</style>
