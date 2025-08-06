import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'

export const useTasksStore = defineStore('tasks', {
    state: () => ({
        tasks: [],
        statusFilter: 'all',
        priorityFilter: 'all',
        searchQuery: '',
        fetchTaskLoader: false
    }),
    actions: {
        async fetchTasks() {
            try {
                this.fetchTaskLoader= true
                const response = await axios.get(`/task/list?status=${this.statusFilter}&priority=${this.priorityFilter}&search=${this.searchQuery}`)
                this.tasks = response.data.tasks.map((task)=>({...task, completed: !!(task.status === 'completed')}))
                this.fetchTaskLoader = false
            } catch {
                Notify.create({
                    message: 'Something went wrong. Please try again later.',
                    color: 'negative',
                })
            }
        },
        async addTask(newTask) {
            try {
                const response = await axios.post('/task/create', newTask)
                const {task} = response.data
                this.tasks.push({...task, completed: !!(task.status === 'completed')})
                Notify.create({
                    message: 'Task added successfully',
                    color: 'positive',
                })


            } catch {
                Notify.create({
                    message: 'Something went wrong. Please try again later.',
                    color: 'negative',
                })
            }
        },
        async deleteTask(taskId) {
            try {
                await axios.delete(`/task/${taskId}`)
                this.tasks = this.tasks.filter((existingTask) => existingTask.id !== taskId)
                Notify.create({
                    message: 'Task deleted successfully',
                    color: 'positive',
                })
            } catch {
                Notify.create({
                    message: 'Something went wrong. Please try again later.',
                    color: 'negative',
                })
            }
        },
        async updateTask(task) {
            try {
                const response = await axios.put(`/task/${task.id}`, task)
                this.tasks = this.tasks.map((existingTask) => (existingTask.id === task.id ? {...response.data.task, completed: !!(task.status === 'completed')} : existingTask))
                Notify.create({
                    message: 'Task updated successfully',
                    color: 'positive',
                })
            } catch {
                Notify.create({
                    message: 'Something went wrong. Please try again later.',
                    color: 'negative',
                })
            }
        },

        async toggleTaskCompletion(task) {
            try {
                const response = await axios.patch(`/task/${task.id}/toggle-status`)
                this.tasks = this.tasks.map((existingTask) => (existingTask.id === task.id ? response.data.task : existingTask))
                Notify.create({
                    message: 'Task completion status updated successfully',
                    color: 'positive',
                })
            } catch {
                Notify.create({
                    message: 'Something went wrong. Please try again later.',
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