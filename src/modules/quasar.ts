import type { UserModule } from '~/types/types'
import { Dialog, Loading, Notify, Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

// Setup Quasar
// https://quasar.dev/
export const install: UserModule = ({ app }) => {
  app.use(Quasar, {
    plugins: {
      Notify,
      Dialog,
      Loading,
    },
    iconSet,
    config: {
      dark: 'auto', // 'auto' - tizim dark mode ni avtomatik aniqlaydi
    },
  })
}
