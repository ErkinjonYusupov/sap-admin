import { acceptHMRUpdate, defineStore } from 'pinia'
import http from '~/utils/axios'

interface IState {
  username: string
  password: string
  
  user: {
    id: number,
    username: string,
    fullName: string,
    rules: string[]
  }
}


export const useAuthStore = defineStore('auth', {
  state: (): IState => ({
    username: '',
    password: '',
    user: {
      id: 0,
      username: '',
      fullName: '',
      rules: []
    }
  }),

  actions: {

    async login() {
      try {
        const {data} = await http.post('/auth/login', {
          username: this.username,
          password: this.password,
        })
        localStorage.setItem('token', data.data.token)
        this.user = data.data
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },
    async authMe() {
      try {
        const {data} = await http.get('/auth/me')
        this.user = data.data
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
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
