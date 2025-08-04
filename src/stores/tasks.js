import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'

export const useTasksStore = defineStore('tasks', {
    state: () => ({
        tasks: [
            {
                id: 1,
                name: 'Buy groceries',
                priority: 'medium',
                completed: false,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque efficitur, urna eu posuere iaculis, arcu mi fermentum ligula, nec tristique purus risus non nulla.'
            },
            {
                id: 2,
                name: 'Finish project',
                priority: 'high',
                completed: true,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent aliquet purus et nulla egestas, in efficitur risus varius. Nulla facilisi. Duis id nisi dui.'
            },
            {
                id: 3,
                name: 'Call John',
                priority: 'low',
                completed: false,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur a velit bibendum, pretium risus in, feugiat orci. Etiam euismod ligula vitae felis volutpat.'
            },
            {
                id: 4,
                name: 'Study Vue 3',
                priority: 'high',
                completed: false,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis turpis eu libero aliquet, nec cursus leo vulputate. Ut non felis vel nulla feugiat faucibus.'
            }
        ],
        statusFilter: 'all',
        priorityFilter: 'all',
        searchQuery: '',
        fetchTaskLoader: false
    }),
    actions: {
        async fetchTasks() {
            try {
                const response = await axios.get(`/tasks/list?status=${this.statusFilter}&priority=${this.priorityFilter}&search=${this.searchQuery}`)
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
        setStatusFilter(statusFilter) {
            this.statusFilter = statusFilter
            this.fetchTasks()
        },
        setPriorityFilter(priorityFilter) {
            this.priorityFilter = priorityFilter
            this.fetchTasks()
        },
        setSearchQuery(query) {
            this.searchQuery = query
            this.fetchTasks()
        }
    },
    getters: {
        taskList: (state) => state.tasks,
        selectedStatusFilter: (state) => state.statusFilter,
        selectedPriorityFilter: (state) => state.priorityFilter,
        taskSearchQuery: (state) => state.searchQuery,
    }
})

// Hot Module Replacement support
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
}   