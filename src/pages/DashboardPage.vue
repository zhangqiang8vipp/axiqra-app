<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { workspaceApi } from '@/api/workspace'
import { searchApi } from '@/api/search'
import { authApi } from '@/api/auth'
import { useRouter } from 'vue-router'
import type { WorkspaceVO, SearchResponseVO } from '@/types'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const workspaces = ref<WorkspaceVO[]>([])
const recentSearches = ref<SearchResponseVO[]>([])
const loadingWorkspaces = ref(true)
const loadingSearch = ref(false)
const searchQuery = ref('')

onMounted(async () => {
  try {
    const res = await workspaceApi.list({ pageSize: 5 })
    if (res.data.code === 0 && res.data.data) {
      workspaces.value = res.data.data.records
    }
  } catch {
    // ignore
  } finally {
    loadingWorkspaces.value = false
  }
})

async function handleLogout() {
  try {
    await authApi.logout()
  } catch {
    // ignore
  } finally {
    authStore.clearAuth()
    router.push('/')
  }
}
</script>

<template>
  <div class="dashboard-page">
    <div class="container">

      <!-- Welcome -->
      <section class="section">
        <div class="welcome-card">
          <div class="welcome-avatar">
            {{ authStore.displayName.charAt(0).toUpperCase() }}
          </div>
          <div class="welcome-info">
            <h1 class="welcome-title">
              {{ t('dashboard.welcome', { name: authStore.displayName }) }}
            </h1>
            <p class="welcome-sub">{{ t('dashboard.subtitle') }}</p>
          </div>
        </div>
      </section>

      <!-- Quick actions -->
      <section class="section">
        <h2 class="section-title">{{ t('dashboard.quickActions') }}</h2>
        <div class="quick-grid">
          <RouterLink to="/public-cases" class="quick-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>{{ t('dashboard.browseCases') }}</span>
          </RouterLink>
          <RouterLink to="/workspaces" class="quick-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{{ t('dashboard.myWorkspaces') }}</span>
          </RouterLink>
          <RouterLink to="/tool-models" class="quick-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>{{ t('dashboard.leaderboard') }}</span>
          </RouterLink>
        </div>
      </section>

      <!-- Workspaces -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ t('dashboard.recentWorkspaces') }}</h2>
          <RouterLink to="/workspaces" class="section-link">
            {{ t('dashboard.viewAll') }}
          </RouterLink>
        </div>
        <div v-if="loadingWorkspaces" class="skeleton-list">
          <div v-for="i in 3" :key="i" class="skeleton-row" />
        </div>
        <div v-else-if="workspaces.length === 0" class="empty-state">
          <p>{{ t('dashboard.noWorkspaces') }}</p>
          <RouterLink to="/workspaces" class="btn-primary-sm">
            {{ t('dashboard.createFirst') }}
          </RouterLink>
        </div>
        <div v-else class="list-card">
          <RouterLink
            v-for="ws in workspaces"
            :key="ws.id"
            :to="`/workspaces/${ws.id}`"
            class="list-item"
          >
            <div class="ws-icon" :data-type="ws.workspaceType">
              {{ ws.workspaceName.charAt(0).toUpperCase() }}
            </div>
            <div class="ws-info">
              <span class="ws-name">{{ ws.workspaceName }}</span>
              <span class="ws-type">{{ t(`workspace.type.${ws.workspaceType}`) }}</span>
            </div>
            <span class="ws-role badge" :data-role="ws.myRole">
              {{ ws.myRole }}
            </span>
          </RouterLink>
        </div>
      </section>

      <!-- Logout -->
      <section class="section">
        <button class="btn-ghost-danger" @click="handleLogout">
          {{ t('auth.logout') }}
        </button>
      </section>

    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: var(--space-8) 0 var(--space-16);
}

.container {
  max-width: 960px;
}

.section {
  margin-bottom: var(--space-10);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
}

.section-link:hover {
  text-decoration: underline;
}

.welcome-card {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
}

.welcome-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  font-size: var(--text-xl);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.welcome-sub {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.quick-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  color: var(--color-primary);
  text-decoration: none;
}

.list-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  text-decoration: none;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background: var(--color-bg-secondary);
  text-decoration: none;
}

.ws-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-sm);
  color: #fff;
  flex-shrink: 0;
}

.ws-icon[data-type="personal"] { background: #3b82f6; }
.ws-icon[data-type="team"] { background: #10b981; }
.ws-icon[data-type="enterprise"] { background: #8b5cf6; }

.ws-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ws-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.ws-type {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.badge {
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
}

.badge[data-role="owner"] { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.badge[data-role="admin"] { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.badge[data-role="member"] { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge[data-role="viewer"] { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-row {
  height: 52px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.btn-primary-sm {
  display: inline-flex;
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
}

.btn-ghost-danger {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-error);
  background: transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-ghost-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
