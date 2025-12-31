import { Loading } from 'quasar'

// Global state
const overlayState = ref(false)

function useOverlay(state?: boolean) {
  // Agar holat o'zgarmasa, hech narsa qilmaymiz
  if (state === overlayState.value) {
    return
  }

  if (state === true) {
    overlayState.value = true
    Loading.show({
      message: 'Yuklanmoqda...',
      spinnerColor: 'primary',
      messageColor: 'white',

      
    })
  }
  else if (state === false) {
    overlayState.value = false
    Loading.hide()
  }
}

function getOverlay() {
  return overlayState.value
}

export { useOverlay, getOverlay }
export default useOverlay