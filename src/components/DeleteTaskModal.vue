<template>
  <q-dialog v-model="show">
    <q-card class="q-pa-md">
      <q-card-section class="row items-center q-pa-none">
        <q-icon name="warning" color="red" size="sm" class="q-mr-sm" />
        <div class="text-h6">Delete Task</div>
      </q-card-section>

      <q-card-section class="q-pa-none q-mt-sm q-mb-lg">
        <div>
          Are you sure you want to delete <strong>{{ itemName }}</strong
          >?
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-none">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          label="Delete"
          color="red"
          @click="confirmDelete"
          :loading="isLoading"
          :disabled="isLoading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
    required: true,
  },
  itemName: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'deleteTask'])

const show = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => (show.value = val)
)
watch(show, (val) => emit('update:modelValue', val))

function confirmDelete() {
  emit('deleteTask')
  show.value = false
}
</script>
