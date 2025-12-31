import { acceptHMRUpdate, defineStore } from 'pinia'
import { IPaginate } from '~/types/types'
import http from '~/utils/axios'
interface IRule{
  id:number,
  title:string,
  code:string
}
interface IState {
  users: any[],
  search:string,
  obj:{
    id: number|null
    username:string,
    password:string,
    fullName:string,
  }
  userRules:{
    availableRules:IRule[]
    currentRules:IRule[]
  }
  selectedAvailableRules:IRule[]
  selectedCurrentRules:IRule[]
  selectedUser:any
  editDialog:boolean
  rulesDialog:boolean
  pagination:IPaginate
}


export const useUsersStore = defineStore('users', {
  state: (): IState => ({
    users:[],
    search:'',
    obj:{
      id:null,
      username:'',
      password:'',
      fullName:'',
    },
    userRules:{
      availableRules:[],
      currentRules:[],
    },
    selectedAvailableRules:[],
    selectedCurrentRules:[],
    selectedUser:null,
    editDialog:false,
    rulesDialog:false,
    pagination:{
      currentPage:1,
      totalPages:1,
    }
  }),

  actions: {
    async getUsers() {
      try {
        const {data} = await http.get('/users', {
          params:{
            page:this.pagination.currentPage,
            pagination:1,
            search:this.search
          }
        })
        console.log(data)
        this.users = data.data
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
      finally {
        useOverlay(false)
      }
    },
    async createUser() {
      try {
        if(this.obj.id){
          const {data} = await http.put(`/users/${this.obj.id}`,this.obj)
          return Promise.resolve(data)
        }
        const {data} = await http.post('/users',this.obj)
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
        const { data } = await http.put(`/users/active/${row.id}`, {
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
    async getUserRules() {
      try {
        useOverlay(true)
        const { data } = await http.get(`/users/${this.selectedUser.id}/available-rules`)
        this.userRules = data.data
        return Promise.resolve(data)
      }
      catch (err) {
        return Promise.reject(err)
      }
      finally {
        useOverlay(false)
      }
    },
    async updateUserRulse(action: string) {
      try {
        useOverlay(true)
        const { data } = await http.post(`/users/${this.selectedUser.id}/rules`, 
          {
            ids: action ==='add'? this.selectedAvailableRules
            .map((item: any) => item.id)
            :this.selectedCurrentRules
            .map((item: any) => item.id),
            action
          }
        )
        this.selectedAvailableRules = []
        this.selectedCurrentRules = []
        this.getUserRules()
        return Promise.resolve(data)
      }
      catch (err) {
        return Promise.reject(err)
      }
      finally {
        useOverlay(false)
      }
    },

  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
