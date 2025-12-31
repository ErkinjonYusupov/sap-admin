/**
 * ISO formatdagi sanani "Dek 30 2025, 18:22" formatga o'zgartiradi
 * @param isoString - ISO 8601 formatdagi sana (masalan: "2025-12-30T18:22:02.821Z")
 * @returns Formatlangan sana string
 */
export function formatDate(isoString: string): string {
  const months = [
    'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
    'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'
  ];

  const date = new Date(isoString);

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${month} ${day} ${year}, ${hours}:${minutes}`;
}


export function useRule(rule: string) {
  const store = useAuthStore()
  return store.user.rules.includes(rule) || store.user.rules.includes('admin')
}