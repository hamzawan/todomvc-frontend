<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">My Tasks</div>

    <!-- Filter Row -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-3">
        <q-select
          v-model="statusFilter"
          label="Status"
          :options="statusOptions"
          dense
          emit-value
          map-options
        />
      </div>

      <div class="col-3">
        <q-select
          v-model="priorityFilter"
          label="Priority"
          :options="priorityOptions"
          dense
          emit-value
          map-options
        />
      </div>

       <div class="col-3">
        <q-btn label="Add Task" color="primary" @click="toggleAddOrEditTaskModal()" />
      </div>
    </div>

    <!-- Task List -->
 <q-list bordered separator>
  <q-infinite-scroll
    :disable="isAllLoaded"
    @load="loadMoreTasks"
    :offset="200"
  >
    <template v-for="task in filteredTasks" :key="task.id">
      <q-item clickable>
        <q-item-section avatar>
          <q-checkbox
            v-model="task.completed"
            @update:model-value="toggleComplete(task)"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label :class="{ 'text-strike text-grey': task.completed }">
            {{ task.name }}
          </q-item-label>
          <q-item-label caption>
            Priority: {{ task.priority }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn icon="edit" flat dense @click="toggleAddOrEditTaskModal(task)" />
          <q-btn icon="delete" color="red" flat dense @click="toggleDeleteTaskModal(task)" />
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
    <DeleteTaskModalComponent
      v-model="showDeleteTaskModal"
      :item-name="deleteTaskModalItemName"
      @deleteTask="deleteTask"
      :isLoading="deleteTaskLoader"
    />

    <AddOrEditTaskModalComponent v-model="showAddOrEditTaskModal" @addTask="addTask" :isLoading="addOrEidtTaskLoader"/>
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
const editTaskObject = ref(null)
const addOrEidtTaskLoader = ref(false)
const deleteTaskLoader = ref(false)

// Filters
const statusFilter = ref('all')      // all | completed | incomplete
const priorityFilter = ref('all')    // all | low | medium | high

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

    return matchStatus && matchPriority
  })
})

// Actions
async function toggleComplete(task) {
    await taskStore.updateTask(task)
}

// function editTask(task) {
//   console.log('Edit', task)
// }

const toggleDeleteTaskModal = (task) => {
  showDeleteTaskModal.value = true
  deleteTaskModalItemName.value = task.name
  deleteTaskId.value = task.id
}

function toggleAddOrEditTaskModal(task=null) {
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

</script>

<style scoped>
.text-strike {
  text-decoration: line-through;
}
</style>
