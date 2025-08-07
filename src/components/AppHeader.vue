<template>
  <q-header elevated>
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="toggleLeftDrawer"
        v-if="authStore.isAuthenticated"
      />

      <q-toolbar-title> Todo MVC </q-toolbar-title>

      <!-- <div class="q-mr-md text-caption text-grey-5">v{{ version }}</div> -->

      <div v-if="authStore.isAuthenticated" class="cursor-pointer">
        Logged in as
        <b>{{ authStore?.user?.first_name }} {{ authStore?.user?.last_name }}</b>
        <q-icon size="xs" name="arrow_drop_down" />
        <q-menu fir anchor="bottom right" self="top right">
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup class="dropdwon-item">
              <q-item-section @click="toggleEditProfileModal()" class="dropdwon-text"
                >Edit Username</q-item-section
              >
            </q-item>
            <q-item clickable v-close-popup class="dropdwon-item">
              <q-item-section @click="authStore.logout()" class="dropdwon-text"
                >Logout</q-item-section
              >
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </q-toolbar>
  </q-header>

  <q-drawer
    v-if="authStore.isAuthenticated"
    v-model="leftDrawerOpen"
    show-if-above
    bordered
    :width="220"
  >
    <q-list>
      <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
    </q-list>
  </q-drawer>

  <EditUserNameModalComponent v-model="showEditUserNameModal" @editProfile="editProfile" />
</template>


<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useAuthStore } from 'stores/auth'
// import versionData from '@/version.json'
import EssentialLink from 'components/EssentialLink.vue'

const EditUserNameModalComponent = defineAsyncComponent(() =>
  import('components/EditUserNameModal.vue')
)

const showEditUserNameModal = ref(false)

const linksList = [
  {
    title: 'My Tasks',
    icon: 'list',
    link: '/tasks',
  },
]

const authStore = useAuthStore()
// const version = versionData.version

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleEditProfileModal() {
  showEditUserNameModal.value = true
}

function editProfile(user) {
  authStore.updateUser(user)
  showEditUserNameModal.value = false
}
</script>

<style lang="scss">
.dropdwon-item {
  min-height: 40px;
  .dropdwon-text {
    height: max-content;
    margin: auto 0;
  }
}
</style>