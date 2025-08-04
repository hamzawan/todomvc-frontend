<template>
  <q-page class="q-px-lg q-py-lg" style="max-width: 1440px; margin: 0 auto;">
    <div class="text-h5 q-mb-lg text-weight-bold">My Tasks</div>

    <!-- Filter Row -->
    <div class="row q-col-gutter-md q-mb-md justify-center items-end ">

      <!-- Search Bar in the First Column -->
      <div class="col-12 col-sm-6 col-md-4 col-lg-4 q-pt-none q-pl-md">
        <q-input v-model="searchQuery" label="Search Tasks" dense debounce="1000" :clearable="true" class="full-width">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Status Filter Column -->
      <div class="col-12 col-sm-6 col-md-3 col-lg-3 q-pt-none">
        <q-select v-model="statusFilter" label="Status" :options="statusOptions" emit-value map-options
          :use-popup="false" :use-input="true" />
      </div>

      <!-- Priority Filter Column -->
      <div class="col-12 col-sm-6 col-md-3 col-lg-3 q-pt-none">
        <q-select v-model="priorityFilter" label="Priority" :options="priorityOptions" emit-value map-options
          :use-popup="false" :use-input="true" />
      </div>

      <!-- Add Task Button Column -->
      <div class="col-12 col-sm-6 col-md-2 col-lg-2 q-pt-none">
        <q-btn label="Add Task" icon="add" color="primary" style="width: 100%;" @click="toggleAddOrEditTaskModal()" />
      </div>
    </div>

    <!-- Task List -->
    <q-list bordered separator style="border-radius: 10px; padding: 10px 0px;">
      <q-infinite-scroll :disable="isAllLoaded" @load="loadMoreTasks" :offset="200">
        <template v-for="task in filteredTasks" :key="task.id">
          <q-item clickable class="items-center q-col-gutter-0 q-pa-sm">
            <q-item-section avatar>
              <q-checkbox v-model="task.completed" @update:model-value="toggleComplete(task)" />
            </q-item-section>

            <q-item-section>
              <q-item-label :class="{ 'text-strike text-grey': task.completed }">
                <div class="row items-center">
                  <div class="text-subtitle2 text-weight-bold q-mr-sm q-mb-xs">{{ task.name }}</div>
                  <q-badge :label="task.priority" :color="getPriorityColor(task.priority)" class="q-m-sm q-py-xs"
                    align="top" />
                </div>
              </q-item-label>
              <!-- Task Description -->
              <q-item-label caption class="text-subtitle2 text-grey line-height-md">
                {{ task.description }}
              </q-item-label>
            </q-item-section>

            <!-- Edit and Delete Buttons -->
            <q-item-section side class="d-flex items-center row q-gutter-sm"
              style="flex-direction: row; align-items: center;">
              <!-- On larger screens (md and up), show both icon and text -->
              <q-btn v-if="$q.screen.gt.xs" icon="edit" label="Edit" flat dense class="custom-btn"
                @click="toggleAddOrEditTaskModal(task)" />
              <q-btn v-if="$q.screen.gt.xs" icon="delete" label="Delete" color="red" flat dense class="custom-btn"
                @click="toggleDeleteTaskModal(task)" />

              <!-- On small screens (sm and below), show only icon -->
              <q-btn v-if="$q.screen.lt.sm" icon="edit" flat dense @click="toggleAddOrEditTaskModal(task)" />
              <q-btn v-if="$q.screen.lt.sm" icon="delete" color="red" flat dense @click="toggleDeleteTaskModal(task)" />
            </q-item-section>
          </q-item>
        </template>

        <template v-if="isLoading" v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </q-list>

    <!-- Delete Confirmation Modal -->
    <DeleteTaskModalComponent v-model="showDeleteTaskModal" :item-name="deleteTaskModalItemName"
      @deleteTask="deleteTask" :isLoading="deleteTaskLoader" />

    <!-- Add/Edit Task Modal -->
    <AddOrEditTaskModalComponent v-model="showAddOrEditTaskModal" :isLoading="addOrEidtTaskLoader"
      :editTaskObject="editTaskObject" @addTask="addTask" @editTask="editTask" />
  </q-page>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useTasksStore } from 'stores/tasks'

const DeleteTaskModalComponent = defineAsyncComponent(() =>
  import('src/components/DeleteTaskModal.vue')
)

const AddOrEditTaskModalComponent = defineAsyncComponent(() =>
  import('src/components/AddOrEditTaskModal.vue')
)

const taskStore = useTasksStore()

const showDeleteTaskModal = ref(false)
const deleteTaskModalItemName = ref('')
const deleteTaskId = ref(null)
const isLoading = ref(false)
const showAddOrEditTaskModal = ref(false)
const editTaskObject = ref({})
const addOrEidtTaskLoader = ref(false)
const deleteTaskLoader = ref(false)

// Search query
const searchQuery = computed({
  get: () => taskStore.taskSearchQuery,
  set: (value) => taskStore.setSearchQuery(value ?? '')
})

// Filters
const statusFilter = computed({
  get: () => taskStore.selectedStatusFilter,
  set: (value) => taskStore.setStatusFilter(value)
})

const priorityFilter = computed({
  get: () => taskStore.selectedPriorityFilter,
  set: (value) => taskStore.setPriorityFilter(value)
})

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Incomplete', value: 'incomplete' },
  { label: 'Completed', value: 'completed' }
]

const priorityOptions = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

const filteredTasks = computed(() => {
  return taskStore.taskList.filter(task => {
    const matchStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'completed' && task.completed) ||
      (statusFilter.value === 'incomplete' && !task.completed)

    const matchPriority =
      priorityFilter.value === 'all' || task.priority === priorityFilter.value

    const matchSearch =
      task.name.toLowerCase().includes(searchQuery.value.toLowerCase()) // Search filter

    return matchStatus && matchPriority && matchSearch
  })
})

async function toggleComplete(task) {
  await taskStore.updateTask(task)
}

async function editTask(task) {
  addOrEidtTaskLoader.value = true
  await taskStore.updateTask(task)
  addOrEidtTaskLoader.value = false
}

function toggleDeleteTaskModal(task) {
  showDeleteTaskModal.value = true
  deleteTaskModalItemName.value = task.name
  deleteTaskId.value = task.id
}

function toggleAddOrEditTaskModal(task = null) {
  showAddOrEditTaskModal.value = true
  editTaskObject.value = task
}

async function deleteTask() {
  deleteTaskLoader.value = true
  await taskStore.deleteTask(deleteTaskId.value)
  deleteTaskLoader.value = false

  showDeleteTaskModal.value = false
  deleteTaskModalItemName.value = ''
  deleteTaskId.value = null
}

async function addTask(task) {
  addOrEidtTaskLoader.value = true
  await taskStore.addTask(task)
  addOrEidtTaskLoader.value = false
}

// Function to get color based on priority
function getPriorityColor(priority) {
  switch (priority) {
    case 'low':
      return 'green'
    case 'medium':
      return 'orange'
    case 'high':
      return 'red'
    default:
      return 'grey'
  }
}
</script>

<style>
.text-strike {
  text-decoration: line-through;
}

.line-height-md {
  line-height: 1.4 !important;
}

.custom-btn {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  line-height: normal;
}

.custom-btn:hover {
  background-color: #f0f0f0;
}

.custom-btn .q-icon {
  margin-right: 8px;
  font-size: 18px !important;
}

.custom-btn.q-btn--flat.q-btn--dense {
  transition: background-color 0.3s ease, transform 0.2s ease;
}
</style>
