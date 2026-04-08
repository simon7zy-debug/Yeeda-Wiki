import { NextResponse } from "next/server";

import { buildWorkflowGuide } from "@/lib/workflow-engine";

export const runtime = "nodejs";

type WorkflowPayload = {
  goal?: string;
  materials?: string;
  constraints?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WorkflowPayload;
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";
    const materials = typeof body.materials === "string" ? body.materials : "";
    const constraints = typeof body.constraints === "string" ? body.constraints : "";

    if (!goal) {
      return NextResponse.json(
        { message: "请先输入目标，再生成工作流建议。" },
        { status: 400 },
      );
    }

    const result = buildWorkflowGuide({ goal, materials, constraints });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "工作流请求格式错误，请检查后重试。" },
      { status: 400 },
    );
  }
}
