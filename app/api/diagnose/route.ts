import { NextResponse } from "next/server";

import { diagnoseTask } from "@/lib/diagnose-engine";
import type { TaskType } from "@/lib/types";

export const runtime = "nodejs";

type DiagnosePayload = {
  task?: TaskType;
  goal?: string;
  materials?: string;
  urgency?: "urgent" | "week" | "normal";
  materialLevel?: "low" | "medium" | "high";
  blocker?:
    | "unclear_goal"
    | "quality_low"
    | "cannot_express"
    | "need_plan"
    | "need_interview"
    | "none";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DiagnosePayload;
    const task = typeof body.task === "string" ? body.task : "unknown";
    const goal = typeof body.goal === "string" ? body.goal : "";
    const materials = typeof body.materials === "string" ? body.materials : "";
    const urgency =
      body.urgency === "urgent" || body.urgency === "week" || body.urgency === "normal"
        ? body.urgency
        : undefined;
    const materialLevel =
      body.materialLevel === "low" ||
      body.materialLevel === "medium" ||
      body.materialLevel === "high"
        ? body.materialLevel
        : undefined;
    const blocker =
      body.blocker === "unclear_goal" ||
      body.blocker === "quality_low" ||
      body.blocker === "cannot_express" ||
      body.blocker === "need_plan" ||
      body.blocker === "need_interview" ||
      body.blocker === "none"
        ? body.blocker
        : undefined;

    const result = diagnoseTask({
      taskHint: task,
      goal,
      materials,
      urgency,
      materialLevel,
      blocker,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "诊断请求格式错误，请检查输入后重试。" },
      { status: 400 },
    );
  }
}
