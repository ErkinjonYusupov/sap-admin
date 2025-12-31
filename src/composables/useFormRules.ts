export default function useFormRules() {
  return {
    required:
        (message = '') =>
          (val: any) => {
            return !!val || message || 'Bu maydon to\'ldirilishi shart'
          },
    min:
        (length: number, message = '') =>
          (val: any) => {
            return (
              val.length >= length
            || message
            || `Bu maydon kamida ${length} ta belgidan iborat bo\'lishi kerak`
            )
          },
    max:
        (length: number, message = '') =>
          (val: any) => {
            return (
              val.length <= length
            || message
            || `Bu maydon ko'pi bilan ${length}ta belgidan iborat bo'lishi mumkin`
            )
          },
    notNol:
        (length?: number, message = '') =>
          (val: any) => {
            return (
              val > 0 || message || 'Bu maydon 0 dan katta qiymatda bo\'lishi kerak'
            )
          },
    minDate:
        (date: Date, message = '') =>
          (val: any) => {
            return (
              val.date > date
            || message
            || 'Bu maydon 0 dan katta qiymatda bo\'lishi kerak'
            )
          },
    isEqual: (message: string, comparingValue: any) => (val: any) => {
      return val === comparingValue || message || 'Bu maydon to\'ldirishi shart'
    },
    notMinus:
        (length?: number, message = '') =>
          (val: any) => {
            return val >= 0 || message || 'Bu maydon musbat son bo\'lishi kerak'
          },
  }
}
