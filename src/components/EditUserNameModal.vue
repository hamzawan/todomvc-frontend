<template>
  <!-- <q-page class="q-px-lg q-py-lg">
    <div class="text-h5 q-mb-lg text-weight-bold">Edit User Name</div> -->

  <!-- Edit Button -->
  <!-- <q-btn label="Edit Name" icon="edit" color="primary" @click="openEditModal" /> -->

  <!-- Edit Name Modal -->
  <q-dialog v-model="showModal">
    <q-card style="min-width: 350px">
      <q-form @submit="updateUserName">
        <q-card-section>
          <div class="text-h6">Edit User Name</div>
          <q-input
            v-model="user.first_name"
            label="Please enter first name."
            dense
            autofocus
            :rules="[
              (val) => (val && val.length > 3) || 'First name must be at least 4 characters',
            ]"
            class="q-mb-md"
          />
          <q-input
            v-model="user.last_name"
            label="Please enter last name."
            dense
            autofocus
            :rules="[(val) => (val && val.length > 3) || 'Last name must be at least 4 characters']"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" flat v-close-popup />
          <q-btn label="Save" color="primary" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const showModal = ref(false)
const authStore = useAuthStore()

const user = ref({
  first_name: '',
  last_name: '',
})

const emit = defineEmits(['update:modelValue', 'editProfile'])

watch(
  () => props.modelValue,
  (val) => {
    showModal.value = val
    user.value.first_name = authStore.user.first_name
    user.value.last_name = authStore.user.last_name
  }
)
watch(showModal, (val) => emit('update:modelValue', val))

const updateUserName = () => {
  emit('editProfile', user.value)
  showModal.value = false
}
</script>
