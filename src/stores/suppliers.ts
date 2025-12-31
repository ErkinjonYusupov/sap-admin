import { acceptHMRUpdate, defineStore } from 'pinia'
import { IPaginate } from '~/types/types'
import http from '~/utils/axios'

interface ISupplier {
  id: number
  name: string
  phone: string
  notes: string
  active: boolean
  _count?: {
    productSupplier: number
  }
}

interface IState {
  suppliers: ISupplier[]
  search: string
  obj: {
    id: number | null
    name: string
    phone: string
    notes: string
  }
  selectedSupplier: any
  editDialog: boolean
  productsDialog: boolean
  pagination: IPaginate
}

export const useSuppliersStore = defineStore('suppliers', {
  state: (): IState => ({
    suppliers: [],
    search: '',
    obj: {
      id: null,
      name: '',
      phone: '',
      notes: '',
    },
    selectedSupplier: null,
    editDialog: false,
    productsDialog: false,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }),

  actions: {
    async getSuppliers() {
      try {
        const params: any = {
          page: this.pagination.currentPage,
          pagination: 1,
          perPage: 20,
          search: this.search,
        }

        const { data } = await http.get('/suppliers', { params })
        this.suppliers = data.data
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

    async getSupplier(id: number) {
      try {
        const { data } = await http.get(`/suppliers/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async createSupplier() {
      try {
        const payload = {
          name: this.obj.name,
          phone: this.obj.phone,
          notes: this.obj.notes,
        }

        if (this.obj.id) {
          const { data } = await http.put(`/suppliers/${this.obj.id}`, payload)
          return Promise.resolve(data)
        }
        const { data } = await http.post('/suppliers', payload)
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
        const { data } = await http.put(`/suppliers/active/${row.id}`, {
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

    async deleteSupplier(id: number) {
      try {
        useOverlay(true)
        const { data } = await http.delete(`/suppliers/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async manageProducts(supplierId: number, action: 'add' | 'remove', products: any[]) {
      try {
        useOverlay(true)
        const payload: any = {
          action,
          products,
        }

        const { data } = await http.post(`/suppliers/${supplierId}/products`, payload)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async updateProductPrice(supplierId: number, productId: number, price: number) {
      try {
        useOverlay(true)
        const { data } = await http.put(`/suppliers/${supplierId}/products/${productId}`, {
          price,
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

    resetObj() {
      this.obj = {
        id: null,
        name: '',
        phone: '',
        notes: '',
      }
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSuppliersStore, import.meta.hot))
