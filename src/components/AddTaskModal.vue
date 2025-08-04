<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Add New Task</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="submitTask">
          <q-input
            v-model="task.name"
            label="Task Name"
            dense
            required
            autofocus
          />

          <q-select
            v-model="task.priority"
            label="Priority"
            :options="priorityOptions"
            dense
            emit-value
            map-options
            required
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn label="Add" color="primary" @click="submitTask" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
// import { watch } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'task-added'])

const show = ref(props.modelValue)

watch(() => props.modelValue, val => (show.value = val))
watch(show, val => emit('update:modelValue', val))

const task = ref({
  name: '',
  priority: null
})

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

function submitTask () {
  if (!task.value.name || !task.value.priority) return
  emit('task-added', { ...task.value })
  show.value = false
  task.value = { name: '', priority: null }
}
</script>
