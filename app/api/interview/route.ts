import { NextResponse } from "next/server";

import { buildInterviewPrep } from "@/lib/interview-engine";

export const runtime = "nodejs";

type InterviewPayload = {
  role?: string;
  materials?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InterviewPayload;
    const role = typeof body.role === "string" ? body.role : "AI 产品经理";
    const materials = typeof body.materials === "string" ? body.materials.trim() : "";

    if (!materials) {
      return NextResponse.json(
        { message: "请先输入简历或项目材料，再生成面试问题。" },
        { status: 400 },
      );
    }

    const result = buildInterviewPrep({ role, materials });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "面试准备请求格式错误，请检查后重试。" },
      { status: 400 },
    );
  }
}
