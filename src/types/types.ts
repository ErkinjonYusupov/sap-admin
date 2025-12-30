import type { ViteSSGContext } from 'vite-ssg'

export type UserModule = (ctx: ViteSSGContext) => void
export interface INavbarLink {
  title: string
  icon: string
  to?: string
  rule?: string
  children?: INavbarLink[]
}
export interface INavbarConfig {
  links: INavbarLink[]
}
export interface IPaginate {
  current_page: number
  last_page: number
}