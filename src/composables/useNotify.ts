import { useQuasar } from 'quasar'

function useNotify() {
  const q = useQuasar()

  const success = (message: string) => {
    q.notify({
      message,
      icon: 'check_circle_outline',
      color: 'positive',
      classes: 'glossy',
      progress: true,
      timeout: 2500,
    })
  }

  const error = (message: string) => {
    q.notify({
      message,
      icon: 'report_problem',
      color: 'negative',
      classes: 'glossy',
      progress: true,
      timeout: 2500,
    })
  }

  const warning = (message: string) => {
    q.notify({
      message,
      icon: 'info',
      color: 'orange',
      classes: 'glossy',
      progress: true,
      timeout: 2500,
    })
  }

  return { success, error, warning }
}

export default useNotify
