// ============================================================
// Core API types
// ============================================================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
  requestId: string
  traceId: string
  timestamp: string
}

export interface PageResponse<T> {
  records: T[]
  pageNum: number
  pageSize: number
  total: number
  pages: number
}

// ============================================================
// Enums
// ============================================================

export type WorkspaceType = 'personal' | 'team' | 'enterprise'
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'
export type MemberStatus = 'active' | 'suspended' | 'pending'
export type PublicCaseStatus =
  | 'candidate'
  | 'reviewing'
  | 'verified'
  | 'stable'
  | 'canonical'
  | 'archived'

export const PUBLIC_CASE_SEARCHABLE_STATUSES: PublicCaseStatus[] = [
  'verified',
  'stable',
  'canonical',
]

// ============================================================
// Auth
// ============================================================

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  nickname?: string
}

export interface ProfileUpdateRequest {
  nickname?: string
  email?: string
  avatar?: string
}

export interface LoginResponse {
  userId: number
  username: string
  nickname: string | null
  email: string | null
  avatar: string | null
  token: string
}

export interface CurrentUser extends LoginResponse {}

// ============================================================
// Nav
// ============================================================

export interface NavItemVO {
  id: string
  label: string
  icon: string | null
  path: string | null
  category: string | null
}

export interface NavResponseVO {
  baseUserNav: NavItemVO[]
  spaceMembershipNav: NavItemVO[]
  grantedScopeNav: NavItemVO[]
  governanceNav: NavItemVO[]
  adminNav: NavItemVO[]
}

// ============================================================
// Workspace
// ============================================================

export interface WorkspaceVO {
  id: number
  workspaceName: string
  workspaceType: WorkspaceType
  ownerId: number
  tenantId: number | null
  myRole: string | null
  memberCount: number | null
  gmtCreate: string
}

export interface WorkspaceCreateRequest {
  workspaceType: WorkspaceType
  workspaceName: string
}

export interface WorkspaceUpdateRequest {
  workspaceName: string
  workspaceType?: WorkspaceType
}

export interface MemberVO {
  memberId: number
  userId: number
  workspaceId: number
  role: MemberRole
  status: MemberStatus
  username: string | null
  nickname: string | null
  email: string | null
  joinedAt: string
}

export interface MemberRoleUpdateRequest {
  memberId: number
  role: MemberRole
}

// ============================================================
// Public Case
// ============================================================

export interface PublicCaseDetailVO {
  id: number
  sourceCaseId: number
  workspaceId: number
  authorId: number
  redactionStatus: string | null
  reviewId: number | null
  status: PublicCaseStatus
  gmtCreate: string
  gmtModified: string
}

// ============================================================
// Tool Model
// ============================================================

export interface ToolModelLeaderboardVO {
  toolName: string
  reportedModelName: string
  domain: string | null
  techStack: string | null
  rank: number
  successRate7d: number
  sampleSize: number
  rankScore: number
  windowStart: string
  windowEnd: string
}

// ============================================================
// Search
// ============================================================

export interface SearchRequest {
  query: string
  workspaceId?: number
  techStack?: string
  domain?: string
  limit?: number
  minVerificationLevel?: number
  includeCandidateSeed?: boolean
}

export interface CandidateSeedVO {
  id: number
  workspaceId: number
  authorId: number
  queryHash: string | null
  taskGoal: string | null
  techStack: string | null
  coverageGap: string | null
  status: string | null
  assigneeId: number | null
  solutionId: number | null
}

export interface SearchResultItemVO {
  solutionId: number | null
  solutionCode: string | null
  title: string | null
  summary: string | null
  domain: string | null
  techStack: string | null
  verificationLevel: string | null
  riskLevel: string | null
  status: string | null
  visibilityScope: string | null
  workspaceId: number | null
  score: number | null
  scoreReason: string | null
}

export interface SearchResponseVO {
  query: string
  totalHits: number
  returnedHits: number
  empty: boolean
  candidateSeedCreated: boolean
  emptyReason: string | null
  candidateSeed: CandidateSeedVO | null
  items: SearchResultItemVO[]
}
