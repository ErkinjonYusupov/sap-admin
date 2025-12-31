import { acceptHMRUpdate, defineStore } from 'pinia'
import { IPaginate } from '~/types/types'
import http from '~/utils/axios'

interface IStockItem {
  id: number
  productId: number
  quantity: number
  product: {
    id: number
    title: string
    barcode: string
    category?: {
      id: number
      title: string
    }
  }
}

interface IStockMovement {
  id: number
  productId: number
  orderId?: number
  quantity: number
  type: 'IN' | 'OUT'
  beforeQuantity: number
  afterQuantity: number
  notes?: string
  createdAt: string
  product: {
    id: number
    title: string
    barcode: string
  }
  order?: {
    id: number
    orderNumber: string
  }
}

interface IState {
  stockItems: IStockItem[]
  movements: IStockMovement[]
  search: string
  categoryFilter: number | null
  lowStockFilter: boolean
  pagination: IPaginate
  movementsPagination: IPaginate
}

export const useStockStore = defineStore('stock', {
  state: (): IState => ({
    stockItems: [],
    movements: [],
    search: '',
    categoryFilter: null,
    lowStockFilter: false,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
    movementsPagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }),

  actions: {
    async getStock() {
      try {
        const params: any = {
          page: this.pagination.currentPage,
          pagination: 1,
          perPage: 20,
        }

        if (this.search) params.search = this.search
        if (this.categoryFilter) params.categoryId = this.categoryFilter
        if (this.lowStockFilter) params.lowStock = true

        const { data } = await http.get('/stock', { params })
        this.stockItems = data.data
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

    async getMovements() {
      try {
        const params: any = {
          page: this.movementsPagination.currentPage,
          pagination: 1,
          perPage: 20,
        }

        const { data } = await http.get('/stock/movements', { params })
        this.movements = data.data
        this.movementsPagination.totalPages = data.totalPages || 1
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },

    async adjustStock(payload: {
      productId: number
      quantity: number
      type: 'IN' | 'OUT'
      notes?: string
    }) {
      try {
        useOverlay(true)
        const { data } = await http.post('/stock/adjust', payload)
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
  import.meta.hot.accept(acceptHMRUpdate(useStockStore, import.meta.hot))
