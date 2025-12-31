import type { INavbarConfig } from '~/types/types'

const navbarConfig: INavbarConfig = {
  links: [
    {
      title: 'Bosh sahifa',
      icon: 'codicon:home',
      to: '/',
      rule: 'dashborad_show',
    },
    {
      title: 'Foydalanuvchilar',
      icon: 'majesticons:users-line',
      children: [
        {
          title: 'Foydalanuvchilar',
          icon: 'majesticons:users-line',
          to: '/users',
          rule: 'users_show',
        },
        {
          title: 'Mijozlar',
          icon: 'carbon:category-new-each',
          to: '/customers',
          rule: 'customers_show',
        },

      ],
    },
    {
      title: 'Kategoriyalar',
      icon: 'mdi:folder-multiple-outline',
      to: '/categories',
      rule: 'categories_show',
    },
    {
      title: 'Mahsulotlar',
      icon: 'mdi:package-variant-closed',
      to: '/products',
      rule: 'products_show',
    },
    {
      title: 'Yetkazuvchilar',
      icon: 'mdi:truck-delivery',
      to: '/suppliers',
      rule: 'suppliers_show',
    },



  ],
}
export default navbarConfig
