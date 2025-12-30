import type { INavbarConfig } from '~/types/types'

const navbarConfig: INavbarConfig = {
  links: [
    {
      title: 'Bosh sahifa',
      icon: 'icon',
      to: '/',
      rule: 'dashborad_show',
    },
    {
      title: 'Foydalanuvchilar',
      icon: 'icon',
      children: [
        {
          title: 'Foydalanuvchilar',
          icon: 'icon',
          to: '/product-service/product-connection',
          rule: 'users_show',
        },
        {
          title: 'Mijozlar',
          icon: 'carbon:category-new-each',
          to: '/product-service/specifications',
          rule: 'customers_show',
        },
        
      ],
    },
    

     

  ],
}
export default navbarConfig
