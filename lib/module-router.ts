import type { TaskType } from "@/lib/types";

export function getRouteByTaskType(taskType: TaskType): "/resume" | "/project" | "/interview" | "/workflow" | "/planner" {
  if (taskType === "resume_optimization") return "/resume";
  if (taskType === "project_packaging") return "/project";
  if (taskType === "interview_preparation") return "/interview";
  if (taskType === "task_planning") return "/planner";
  return "/workflow";
}

export function getModuleNameByTaskType(taskType: TaskType): string {
  if (taskType === "resume_optimization") return "Resume Review";
  if (taskType === "project_packaging") return "Project Packaging";
  if (taskType === "interview_preparation") return "Interview Prep";
  if (taskType === "task_planning") return "Task Planner";
  if (taskType === "ai_workflow_guidance") return "AI Workflow Guidance";
  return "AI Workflow Guidance";
}

export function getTaskTypeLabel(taskType: TaskType): string {
  if (taskType === "resume_optimization") return "优化简历";
  if (taskType === "project_packaging") return "封装项目";
  if (taskType === "interview_preparation") return "准备面试";
  if (taskType === "task_planning") return "拆解任务";
  if (taskType === "ai_workflow_guidance") return "设计 AI 工作流";
  return "目标仍需澄清";
}
