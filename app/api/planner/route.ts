import { NextResponse } from "next/server";

import { buildTaskPlan } from "@/lib/planner-engine";

export const runtime = "nodejs";

type PlannerPayload = {
  goal?: string;
  materials?: string;
  deadline?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlannerPayload;
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";
    const materials = typeof body.materials === "string" ? body.materials : "";
    const deadline = typeof body.deadline === "string" ? body.deadline : "";

    if (!goal) {
      return NextResponse.json(
        { message: "请先输入目标，再进行任务拆解。" },
        { status: 400 },
      );
    }

    const plan = buildTaskPlan({
      goal,
      materials,
      deadline,
    });

    return NextResponse.json(plan);
  } catch {
    return NextResponse.json(
      { message: "任务拆解请求格式错误，请检查后重试。" },
      { status: 400 },
    );
  }
}
