import { acceptHMRUpdate, defineStore } from 'pinia'
import { IPaginate } from '~/types/types'
import http from '~/utils/axios'

interface IOrder {
  id: number
  orderNumber: string
  type: 'PURCHASE' | 'SALE' | 'EXPENSE'
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  supplierId?: number
  notes?: string
  createdAt: string
  supplier?: {
    id: number
    name: string
  }
  creator?: {
    id: number
    fullName: string
  }
}

interface IState {
  orders: IOrder[]
  search: string
  typeFilter: string | null
  statusFilter: string | null
  supplierFilter: number | null
  selectedOrder: any
  pagination: IPaginate
}

export const useOrdersStore = defineStore('orders', {
  state: (): IState => ({
    orders: [],
    search: '',
    typeFilter: null,
    statusFilter: null,
    supplierFilter: null,
    selectedOrder: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }),

  actions: {
    async getOrders() {
      try {
        const params: any = {
          page: this.pagination.currentPage,
          pagination: 1,
          perPage: 20,
        }

        if (this.typeFilter) params.type = this.typeFilter
        if (this.statusFilter) params.status = this.statusFilter
        if (this.supplierFilter) params.supplierId = this.supplierFilter

        const { data } = await http.get('/orders', { params })
        this.orders = data.data
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

    async getOrder(id: number) {
      try {
        const { data } = await http.get(`/orders/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async updateOrderStatus(id: number, status: string) {
      try {
        useOverlay(true)
        const { data } = await http.put(`/orders/${id}/status`, { status })
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async deleteOrder(id: number) {
      try {
        useOverlay(true)
        const { data } = await http.delete(`/orders/${id}`)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async createOrder(payload: {
      type: 'PURCHASE' | 'SALE' | 'EXPENSE'
      supplierId?: number
      items: { productId: number; quantity: number; price: number }[]
      notes?: string
    }) {
      try {
        useOverlay(true)
        const { data } = await http.post('/orders', payload)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async updateOrderItem(orderId: number, payload: {
      productId: number
      quantity: number
      price: number
    }) {
      try {
        useOverlay(true)
        const { data } = await http.put(`/orders/${orderId}/items`, payload)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useOrdersStore, import.meta.hot))
