<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ modalTitle }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="submitTask">
          <q-input
            v-model="task.name"
            label="Task Name"
            dense
            required
            autofocus
            :rules="[
                (val) => val && validateTaskName(val) || 'Please enter a valid task name.',
              ]"
            class="q-mb-md"
          />

           <q-input
            v-model="task.description"
            label="Task Description"
            dense
            required
            autofocus
            class="q-mb-md"
          />

          <q-select
            v-model="task.priority"
            label="Priority"
            :options="priorityOptions"
            dense
            emit-value
            map-options
            required
            :rules="[
                (val) => !!val && val !== '' || 'Please select task priority.',
              ]"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn :label="buttonLabel" color="primary" @click="submitTask" :loading="isLoading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
// import { watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,  
    default: false
  },
  editTaskObject: {
    type: Object,
    default: () => ({})
  },
  isLoading:{
    type: Boolean,
    default: false  
  }
})

const emit = defineEmits(['update:modelValue', 'addTask', 'editTask'])

const show = ref(false)

watch(() => props.modelValue, val => {
  // updating task form values
  task.value.name = props.editTaskObject?.name ?? ''
  task.value.priority = props.editTaskObject?.priority ?? ''
  task.value.description = props.editTaskObject?.description ?? ''
  
  show.value = val

})
watch(show, val => emit('update:modelValue', val))

const isEditMode = computed(() => props.editTaskObject?.id)
const modalTitle = computed(() => isEditMode.value ? 'Edit Task' : 'Add New Task')
const buttonLabel = computed(() => isEditMode.value ? 'Update' : 'Add')

const task = ref({
  name: '',
  priority: '',
  description: ''
})

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

function submitTask () {
  if (!task.value.name || !task.value.priority) return
    isEditMode.value ? emit('editTask', { ...task.value, id:props.editTaskObject?.id }) : emit('addTask', { ...task.value })
    show.value = false
    task.value = { name: '', priority: null }
}

function validateTaskName(taskName){
   return /^(?!\s*$).+/.test(taskName)
}
</script>
