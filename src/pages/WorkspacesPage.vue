<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { workspaceApi } from '@/api/workspace'
import { useRouter } from 'vue-router'
import type { WorkspaceVO, WorkspaceType } from '@/types'

const { t } = useI18n()
const router = useRouter()

const workspaces = ref<WorkspaceVO[]>([])
const loading = ref(true)
const showCreate = ref(false)
const creating = ref(false)

const newWs = ref({ workspaceType: 'personal' as WorkspaceType, workspaceName: '' })
const errorMsg = ref('')

onMounted(async () => {
  try {
    const res = await workspaceApi.list()
    if (res.data.code === 0 && res.data.data) {
      workspaces.value = res.data.data.records
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})

async function handleCreate() {
  if (!newWs.value.workspaceName.trim()) return
  creating.value = true
  errorMsg.value = ''
  try {
    const res = await workspaceApi.create(newWs.value)
    if (res.data.code === 0 && res.data.data) {
      workspaces.value.unshift(res.data.data)
      showCreate.value = false
      newWs.value = { workspaceType: 'personal', workspaceName: '' }
    } else {
      errorMsg.value = res.data.message
    }
  } catch {
    errorMsg.value = t('workspace.createFailed')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ t('workspace.title') }}</h1>
          <p class="page-sub">{{ t('workspace.subtitle') }}</p>
        </div>
        <button class="btn-primary" @click="showCreate = true">
          + {{ t('workspace.create') }}
        </button>
      </header>

      <!-- Create modal -->
      <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
        <div class="modal-card">
          <h2 class="modal-title">{{ t('workspace.createNew') }}</h2>
          <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>
          <div class="form-group">
            <label class="form-label">{{ t('workspace.name') }}</label>
            <input
              v-model="newWs.workspaceName"
              type="text"
              class="form-input"
              :placeholder="t('workspace.namePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('workspace.type') }}</label>
            <select v-model="newWs.workspaceType" class="form-select">
              <option value="personal">{{ t('workspace.type.personal') }}</option>
              <option value="team">{{ t('workspace.type.team') }}</option>
              <option value="enterprise">{{ t('workspace.type.enterprise') }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" @click="showCreate = false">{{ t('common.cancel') }}</button>
            <button class="btn-primary" :disabled="!newWs.workspaceName.trim() || creating" @click="handleCreate">
              {{ creating ? '...' : t('workspace.create') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton-row" />
      </div>

      <div v-else-if="workspaces.length === 0" class="empty-state">
        <p>{{ t('workspace.empty') }}</p>
        <button class="btn-primary" @click="showCreate = true">{{ t('workspace.createFirst') }}</button>
      </div>

      <div v-else class="workspace-grid">
        <RouterLink
          v-for="ws in workspaces"
          :key="ws.id"
          :to="`/workspaces/${ws.id}`"
          class="ws-card"
        >
          <div class="ws-icon" :data-type="ws.workspaceType">
            {{ ws.workspaceName.charAt(0).toUpperCase() }}
          </div>
          <div class="ws-info">
            <span class="ws-name">{{ ws.workspaceName }}</span>
            <span class="ws-type">{{ t(`workspace.type.${ws.workspaceType}`) }}</span>
          </div>
          <div class="ws-meta">
            <span v-if="ws.memberCount" class="ws-members">
              {{ ws.memberCount }} {{ t('workspace.members') }}
            </span>
            <span class="badge" :data-role="ws.myRole">{{ ws.myRole }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-8) 0 var(--space-16);
}

.container {
  max-width: 960px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.page-sub {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.btn-primary {
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--space-6);
}

.modal-card {
  width: 100%;
  max-width: 420px;
  padding: var(--space-8);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
}

.alert-error {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-row {
  height: 80px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  text-align: center;
  padding: var(--space-16);
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.workspace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.ws-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.ws-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
}

.ws-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-lg);
  color: #fff;
}

.ws-icon[data-type="personal"] { background: #3b82f6; }
.ws-icon[data-type="team"] { background: #10b981; }
.ws-icon[data-type="enterprise"] { background: #8b5cf6; }

.ws-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ws-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.ws-type {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.ws-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ws-members {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
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
</style>
