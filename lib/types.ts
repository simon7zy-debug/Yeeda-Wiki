export type Severity = "P0" | "P1" | "P2";

export type RoleKey = "HR" | "PM" | "技术" | "设计" | "项目管理";

export type RoleScore = {
  role: RoleKey;
  score: number;
  summary: string;
};

export type ReviewIssue = {
  id: string;
  ruleId: string;
  severity: Severity;
  title: string;
  reason: string;
  suggestion: string;
  hitRule: string;
  evidence?: string;
};

export type ReviewResult = {
  totalScore: number;
  summary: string;
  roleScores: RoleScore[];
  issues: ReviewIssue[];
};

export type RewriteSuggestion = {
  issueId: string;
  before: string;
  after: string;
};

export type RewriteResult = {
  quickFixes: RewriteSuggestion[];
  optimizedProjectSample: string;
  fullDraft: string;
  resumeDeliveryDraft?: string;
  deliveryChecklist?: string[];
};

export type StoredDocument = {
  id: string;
  fileName: string;
  fileType: "pdf" | "docx";
  extractedText: string;
  createdAt: number;
  reviewResult?: ReviewResult;
  rewriteResult?: RewriteResult;
};

export type TaskType =
  | "resume_optimization"
  | "project_packaging"
  | "interview_preparation"
  | "ai_workflow_guidance"
  | "task_planning"
  | "unknown";

export type UserState =
  | "goal_blurry"
  | "goal_clear_missing_material"
  | "has_material_quality_low"
  | "near_delivery_fast_opt"
  | "has_project_cannot_express"
  | "feature_idea_not_decomposed"
  | "ready_for_execution";

export type DiagnoseResult = {
  taskType: TaskType;
  taskTypeLabel: string;
  currentState: UserState;
  currentStateLabel: string;
  recommendedModule: string;
  recommendedRoute: "/resume" | "/project" | "/interview" | "/workflow" | "/planner";
  confidence: number;
  reasoning: string[];
  nextActions: string[];
};

export type PlannerStep = {
  id: string;
  title: string;
  objective: string;
  input: string;
  output: string;
  priority: Severity;
  relatedModule:
    | "/resume"
    | "/project"
    | "/interview"
    | "/workflow"
    | "/planner"
    | "/diagnose";
  eta: string;
};

export type TaskPlanResult = {
  summary: string;
  diagnosedTaskType: TaskType;
  diagnosedTaskLabel: string;
  recommendedRoute: "/resume" | "/project" | "/interview" | "/workflow" | "/planner";
  requiredDocs: string[];
  milestones: string[];
  riskAlerts: string[];
  steps: PlannerStep[];
};

export type ProjectPackagingResult = {
  structure: {
    background: string;
    user: string;
    problem: string;
    solution: string;
    tech: string;
    result: string;
  };
  narrative60s: string;
  interviewFollowUps: string[];
  missingInfo: string[];
  nextActions: string[];
};

export type InterviewQuestion = {
  id: string;
  question: string;
  intent: string;
  answerFramework: string;
  evidenceHint: string;
  riskLevel: "High" | "Medium" | "Low";
};

export type InterviewPrepResult = {
  summary: string;
  role: string;
  questions: InterviewQuestion[];
  selfCheckList: string[];
  nextActions: string[];
};

export type WorkflowStep = {
  stage: string;
  objective: string;
  aiAction: string;
  requiredInput: string;
  expectedOutput: string;
  qualityGate: string;
};

export type WorkflowGuideResult = {
  summary: string;
  workflowSteps: WorkflowStep[];
  collaborationRules: string[];
  suggestedTools: string[];
  nextActions: string[];
};
