import { acceptHMRUpdate, defineStore } from 'pinia'
import { IPaginate } from '~/types/types'
import http from '~/utils/axios'

interface ICategory {
  id: number
  name: string
  parentId: number | null
  children?: ICategory[]
}

interface IState {
  categories: ICategory[]
  categoriesTree: ICategory[]
  search: string
  obj: {
    id: number | null
    name: string
    parentId: number | null
  }
  editDialog: boolean
  pagination: IPaginate
}

export const useCategoriesStore = defineStore('categories', {
  state: (): IState => ({
    categories: [],
    categoriesTree: [],
    search: '',
    obj: {
      id: null,
      name: '',
      parentId: null,
    },
    editDialog: false,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }),

  actions: {
    async getCategories(parentId?: number | null) {
      try {
        const params: any = {
          page: this.pagination.currentPage,
          pagination: 1,
          search: this.search,
        }

        if (parentId !== undefined) {
          params.parentId = parentId
        }

        const { data } = await http.get('/categories', { params })
        this.categories = data.data
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async getCategoriesTree() {
      try {
        const { data } = await http.get('/categories/tree')
        this.categoriesTree = data.data
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async getCategory(id: number) {
      try {
        const { data } = await http.get(`/categories/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async createCategory() {
      try {
        const payload: any = {
          name: this.obj.name,
        }

        if (this.obj.parentId !== null && this.obj.parentId !== undefined) {
          payload.parentId = this.obj.parentId
        } else {
          payload.parentId = null
        }

        if (this.obj.id) {
          const { data } = await http.put(`/categories/${this.obj.id}`, payload)
          return Promise.resolve(data)
        }
        const { data } = await http.post('/categories', payload)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async deleteCategory(id: number) {
      try {
        useOverlay(true)
        const { data } = await http.delete(`/categories/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    resetObj() {
      this.obj = {
        id: null,
        name: '',
        parentId: null,
      }
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCategoriesStore, import.meta.hot))
