import { acceptHMRUpdate, defineStore } from 'pinia'
import { IPaginate } from '~/types/types'
import http from '~/utils/axios'

interface IProduct {
  id: number
  title: string
  categoryId: number
  unit: string
  barcode: string
  inputPrice: number
  sellPrice: number
  active: boolean
  category?: {
    id: number
    name: string
  }
}

interface IState {
  products: IProduct[]
  search: string
  categoryFilter: number | null
  obj: {
    id: number | null
    title: string
    categoryId: number | null
    unit: string
    barcode: string
    sellPrice: number | null
  }
  editDialog: boolean
  pagination: IPaginate
}

export const useProductsStore = defineStore('products', {
  state: (): IState => ({
    products: [],
    search: '',
    categoryFilter: null,
    obj: {
      id: null,
      title: '',
      categoryId: null,
      unit: 'dona',
      barcode: '',
      sellPrice: null,
    },
    editDialog: false,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }),

  actions: {
    async getProducts() {
      try {
        const params: any = {
          page: this.pagination.currentPage,
          pagination: 1,
          perPage: 20,
          search: this.search,
        }

        if (this.categoryFilter) {
          params.categoryId = this.categoryFilter
        }

        const { data } = await http.get('/products', { params })
        this.products = data.data
        this.pagination.totalPages = data.totalPages || 1
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async getProduct(id: number) {
      try {
        const { data } = await http.get(`/products/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async createProduct() {
      try {
        const payload = {
          title: this.obj.title,
          categoryId: this.obj.categoryId,
          unit: this.obj.unit,
          barcode: this.obj.barcode,
          sellPrice: this.obj.sellPrice,
        }

        if (this.obj.id) {
          const { data } = await http.put(`/products/${this.obj.id}`, payload)
          return Promise.resolve(data)
        }
        const { data } = await http.post('/products', payload)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async toggleActive(row: any) {
      try {
        useOverlay(true)
        const { data } = await http.put(`/products/active/${row.id}`, {
          active: row.active,
        })
        return Promise.resolve(data)
      }
      catch (err) {
        return Promise.reject(err)
      }
      finally {
        useOverlay(false)
      }
    },

    async deleteProduct(id: number) {
      try {
        useOverlay(true)
        const { data } = await http.delete(`/products/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async uploadExcel(file: File, updateExisting = false) {
      try {
        useOverlay(true)
        const formData = new FormData()
        formData.append('file', file)
        if (updateExisting) {
          formData.append('updateExisting', 'true')
        }

        const { data } = await http.post('/products/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async exportExcel() {
      try {
        useOverlay(true)
        const params: any = {}

        if (this.search) {
          params.search = this.search
        }

        if (this.categoryFilter) {
          params.categoryId = this.categoryFilter
        }

        const response = await http.get('/products/export', {
          params,
          responseType: 'blob',
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `products_${new Date().getTime()}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return Promise.resolve({ message: 'Export muvaffaqiyatli' })
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
        title: '',
        categoryId: null,
        unit: 'dona',
        barcode: '',
        sellPrice: null,
      }
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot))
