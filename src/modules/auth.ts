import type { UserModule } from '~/types/types'
import { createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import navbarConfig from '~/config/navbar'

// Setup Pinia
// https://pinia.vuejs.org/
export const install: UserModule = ({ isClient, initialState, app, router }) => {
  const pinia = createPinia()
  app.use(pinia)
  // Refer to
  // https://github.com/antfu/vite-ssg/blob/main/README.md#state-serialization
  // for other serialization strategies.
  if (isClient)
    pinia.state.value = (initialState.pinia) || {}
  else
    initialState.pinia = pinia.state.value

  const store = useAuthStore()

  router.beforeEach(async (to, from, next) => {
    function findFirstAuthorizedRoute(): string | null {
      const isSuperAdmin = store.user.rules.includes('admin')
      for (const link of navbarConfig.links) {
        // Check parent link
        if (link.to && link.rule) {
          if (isSuperAdmin || store.user.rules.includes(link.rule))
            return link.to
        }

        // Check children regardless of parent rule
        if (link.children) {
          for (const child of link.children) {
            if (child.to && child.rule) {
              if (isSuperAdmin || store.user.rules.includes(child.rule))
                return child.to
            }
          }
        }
      }
      return null
    }
    if (to.meta.public) {
        if (localStorage.getItem('token')) {
          await store.authMe()
          // Redirect to first authorized route instead of always '/'
          const firstAuthorizedRoute = findFirstAuthorizedRoute()
          if (firstAuthorizedRoute)
            next(firstAuthorizedRoute)
          else
            next('/')
        }
        else {
          next()
        }
      }
      else {
        if (localStorage.getItem('token')) {
          await store.authMe()
          let isAuthorized = true
          if (to.meta.rule)
            isAuthorized = store.user.rules.includes(to.meta.rule as string) || store.user.rules.includes('admin')
          if (to.path === '/' && !isAuthorized) {
            const firstAuthorizedRoute = findFirstAuthorizedRoute()
            if (firstAuthorizedRoute)
              next(firstAuthorizedRoute)
            else
              next('/404')
          }
          else if (isAuthorized) {
            next()
          }
          else {
            next('/404')
          }
        }
        else {
          sessionStorage.setItem('path', to.fullPath)
          next('/login')
        }
      }
  })
}
