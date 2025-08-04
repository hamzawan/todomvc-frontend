import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [
        { id: 1, name: 'Buy groceries', priority: 'medium', completed: false },
        { id: 2, name: 'Finish project', priority: 'high', completed: true },
        { id: 3, name: 'Call John', priority: 'low', completed: false },
        { id: 4, name: 'Study Vue 3', priority: 'high', completed: false }
    ],
  }), 
  actions: {
    async fetchTasks() {
      try {
        const response = await axios.get('/tasks/list')
        this.tasks = response.data
      } catch {
        Notify.create({
          message: 'An unknown error occurred',
          color: 'negative',
        })
      }
    },
    async addTask(task) {
      try {
        const response = await axios.post('/tasks/create', task)
        this.tasks.push(response.data)
        // this.tasks.push({...task, id:9, completed: false})
        Notify.create({
          message: 'Task added successfully',
          color: 'positive',
        })


      } catch {
        Notify.create({
          message: 'An unknown error occurred',
          color: 'negative',
        })
      }
    },
    async deleteTask(taskId) {
      try {
        await axios.delete(`/tasks/${taskId}/delete`)
        this.tasks = this.tasks.filter((existingTask) => existingTask.id !== taskId)
        Notify.create({
          message: 'Task deleted successfully',
          color: 'positive',
        })
      } catch {
        Notify.create({
          message: 'An unknown error occurred',
          color: 'negative',
        })
      }
    },
    async updateTask(task) {
      try {
        const response = await axios.put(`/tasks/${task.id}/update`, task)
        this.tasks = this.tasks.map((existingTask) => (existingTask.id === task.id ? response.data : existingTask))
        Notify.create({
          message: 'Task updated successfully',
          color: 'positive',
        })
      } catch {
        Notify.create({
          message: 'An unknown error occurred',
          color: 'negative',
        })
      }
    },
  },
  getters: {
    taskList: (state) => state.tasks,
  }
})

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
}   