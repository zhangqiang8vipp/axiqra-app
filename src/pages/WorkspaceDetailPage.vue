<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { workspaceApi } from '@/api/workspace'
import type { WorkspaceVO, MemberVO, MemberRole } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const wsId = Number(route.params.id)
const workspace = ref<WorkspaceVO | null>(null)
const members = ref<MemberVO[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [wsRes, memRes] = await Promise.all([
      workspaceApi.getById(wsId),
      workspaceApi.listMembers(wsId),
    ])
    if (wsRes.data.code === 0) workspace.value = wsRes.data.data
    if (memRes.data.code === 0 && memRes.data.data) {
      members.value = memRes.data.data.records
    }
  } catch {
    router.push('/workspaces')
  } finally {
    loading.value = false
  }
})

const canManage = computed(() =>
  workspace.value?.myRole === 'owner' || workspace.value?.myRole === 'admin',
)

async function handleRemoveMember(memberId: number) {
  if (!confirm(t('workspace.confirmRemove'))) return
  try {
    await workspaceApi.removeMember(wsId, memberId)
    members.value = members.value.filter((m) => m.memberId !== memberId)
  } catch {
    // ignore
  }
}

const roleLabel: Record<MemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}
</script>

<template>
  <div class="page">
    <div class="container">
      <button class="back-btn" @click="router.push('/workspaces')">
        ← {{ t('workspace.back') }}
      </button>

      <div v-if="loading" class="skeleton-header" />

      <template v-else-if="workspace">
        <header class="ws-header">
          <div class="ws-icon" :data-type="workspace.workspaceType">
            {{ workspace.workspaceName.charAt(0).toUpperCase() }}
          </div>
          <div class="ws-info">
            <h1 class="ws-title">{{ workspace.workspaceName }}</h1>
            <div class="ws-meta">
              <span class="badge" :data-type="workspace.workspaceType">
                {{ t(`workspace.type.${workspace.workspaceType}`) }}
              </span>
              <span class="ws-date">
                {{ t('workspace.created') }}: {{ new Date(workspace.gmtCreate).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </header>

        <!-- Members section -->
        <section class="section">
          <h2 class="section-title">{{ t('workspace.members') }}</h2>
          <div class="members-table">
            <div class="table-header">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
              <span v-if="canManage">Actions</span>
            </div>
            <div
              v-for="m in members"
              :key="m.memberId"
              class="table-row"
            >
              <span class="member-info">
                <span class="member-avatar">
                  {{ (m.nickname || m.username || '?').charAt(0).toUpperCase() }}
                </span>
                <span>
                  <span class="member-name">{{ m.nickname || m.username }}</span>
                  <span class="member-email">{{ m.email }}</span>
                </span>
              </span>
              <span class="badge" :data-role="m.role">{{ roleLabel[m.role] }}</span>
              <span class="member-status">{{ m.status }}</span>
              <span class="member-date">{{ new Date(m.joinedAt).toLocaleDateString() }}</span>
              <span v-if="canManage && m.role !== 'owner'">
                <button class="btn-remove" @click="handleRemoveMember(m.memberId)">
                  {{ t('workspace.remove') }}
                </button>
              </span>
              <span v-else-if="canManage && m.role === 'owner'" />
              <span v-else />
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-8) 0 var(--space-16);
}

.container {
  max-width: 900px;
}

.back-btn {
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: transparent;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.back-btn:hover {
  color: var(--color-primary);
}

.skeleton-header {
  height: 80px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ws-header {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

.ws-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-2xl);
  color: #fff;
  flex-shrink: 0;
}

.ws-icon[data-type="personal"] { background: #3b82f6; }
.ws-icon[data-type="team"] { background: #10b981; }
.ws-icon[data-type="enterprise"] { background: #8b5cf6; }

.ws-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.ws-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.badge[data-type="personal"] { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.badge[data-type="team"] { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge[data-type="enterprise"] { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }

.ws-date {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.section {
  margin-bottom: var(--space-10);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-5);
}

.members-table {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  font-size: var(--text-sm);
}

.table-row:last-child {
  border-bottom: none;
}

.member-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-name {
  display: block;
  font-weight: 500;
  color: var(--color-text-primary);
}

.member-email {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.badge[data-role="owner"] { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.badge[data-role="admin"] { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.badge[data-role="member"] { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge[data-role="viewer"] { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

.member-status {
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.member-date {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
}

.btn-remove {
  font-size: var(--text-xs);
  color: var(--color-error);
  background: transparent;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
