import type { QDialogOptions } from 'quasar'
import { Dialog } from 'quasar'

interface DialogOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  persistent?: boolean
}

function useDialog() {
  const confirm = (options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      Dialog.create({
        title: options.title || 'Tasdiqlash',
        message: options.message,
        cancel: {
          label: options.cancelText || 'Bekor qilish',
          color: 'negative',
          flat: true,
        },
        ok: {
          label: options.confirmText || 'Tasdiqlash',
          color: 'primary',
        },
        persistent: options.persistent || false,
      })
        .onOk(() => {
          resolve(true)
        })
        .onCancel(() => {
          resolve(false)
        })
    })
  }

  const alert = (options: Omit<DialogOptions, 'confirmText' | 'cancelText'>): Promise<void> => {
    return new Promise((resolve) => {
      Dialog.create({
        title: options.title || 'Xabar',
        message: options.message,
        ok: {
          label: 'OK',
          color: 'primary',
        },
        persistent: options.persistent || false,
      })
        .onOk(() => {
          resolve()
        })
        .onDismiss(() => {
          resolve()
        })
    })
  }

  return { confirm, alert }
}

export default useDialog