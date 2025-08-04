<template>
  <q-dialog v-model="show">
    <q-card>
      <q-card-section class="row items-center q-pa-sm">
        <q-icon name="warning" color="red" size="md" class="q-mr-sm" />
        <div class="text-h6">Delete Task</div>
      </q-card-section>

      <q-card-section>
        <div>Are you sure you want to delete <strong>{{ itemName }}</strong>?</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn label="Delete" color="red" @click="confirmDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  itemName: {
    type: String,
    default: 'this item'
  }
})

const emit = defineEmits(['update:modelValue', 'confirmed'])

const show = ref(props.modelValue)

watch(() => props.modelValue, val => (show.value = val))
watch(show, val => emit('update:modelValue', val))

function confirmDelete() {
  emit('confirmed')
  show.value = false
}
</script>
