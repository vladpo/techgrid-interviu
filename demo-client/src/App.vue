<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  PATH_CURRENCY_GRAPH_QUOTES,
  PATH_CURRENCY_TABLE_QUOTES,
  PATH_HOME,
  PATH_LOGIN,
  PATH_REGISTER
} from '@/router'
import { computed, ref, watchEffect } from 'vue'
import useSession from '@/session'

const pathHome = ref(PATH_HOME)
const pathLogin = ref(PATH_LOGIN)
const pathRegister = ref(PATH_REGISTER)
const pathTableQuotes = ref(PATH_CURRENCY_TABLE_QUOTES)
const pathGraphQuotes = ref(PATH_CURRENCY_GRAPH_QUOTES)
const { session, logout } = useSession()
const isExpired = ref(true)
watchEffect(async () => {
  const s = session.value
  isExpired.value = await s.isExpired()
})
const error = ref('')
const onLogout = () => logout((err) => (error.value = err.message))
const route = useRoute()
const path = computed(() => route.path)
</script>

<template>
  <div class="bg-gradient-to-br from-gray-700 via-gray-900 to-black transition-all text-white">
    <header>
      <nav>
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div class="hidden w-full md:block md:w-auto">
            <RouterLink :to="pathHome" :class="path === pathHome ? 'text-white' : 'text-white/60'"
              >Home
            </RouterLink>
            <RouterLink
              :to="pathTableQuotes"
              v-if="!isExpired"
              :class="path === pathTableQuotes ? 'text-white' : 'text-white/60'"
              >Currency Table Quotes
            </RouterLink>
            <RouterLink
              :to="pathGraphQuotes"
              v-if="!isExpired"
              :class="path === pathGraphQuotes ? 'text-white' : 'text-white/60'"
              >Currency Graph Quotes
            </RouterLink>
            <RouterLink
              :to="pathLogin"
              v-if="isExpired"
              :class="path === pathLogin ? 'text-white' : 'text-white/60'"
              >Login
            </RouterLink>
            <RouterLink
              :to="pathRegister"
              v-if="isExpired"
              :class="path === pathRegister ? 'text-white' : 'text-white/60'"
              >Register
            </RouterLink>
            <RouterLink
              :to="pathHome"
              @click="onLogout"
              v-if="!isExpired"
              class="text-white/60"
              active-class="text-white"
              >Logout
            </RouterLink>
            <span v-if="error">{{ error }}</span>
          </div>
        </div>
      </nav>
    </header>
    <main class="min-h-screen">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
