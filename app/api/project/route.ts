import { NextResponse } from "next/server";

import { buildProjectPackaging } from "@/lib/project-engine";

export const runtime = "nodejs";

type ProjectPayload = {
  projectText?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProjectPayload;
    const projectText =
      typeof body.projectText === "string" ? body.projectText.trim() : "";

    if (!projectText) {
      return NextResponse.json(
        { message: "请先输入项目材料，再执行项目封装。" },
        { status: 400 },
      );
    }

    const result = buildProjectPackaging({ projectText });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "项目封装请求格式错误，请检查后重试。" },
      { status: 400 },
    );
  }
}
