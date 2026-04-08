import { NextResponse } from "next/server";

import { saveDocument } from "@/lib/document-store";
import { extractResumeText } from "@/lib/text-extractor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "请先上传简历文件。" },
        { status: 400 },
      );
    }

    const extracted = await extractResumeText(file);
    const saved = saveDocument({
      fileName: file.name,
      fileType: extracted.fileType,
      extractedText: extracted.extractedText,
    });

    return NextResponse.json({
      docId: saved.id,
      fileName: saved.fileName,
      fileType: saved.fileType,
      textPreview: saved.extractedText.slice(0, 240),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败，请稍后重试。";
    return NextResponse.json({ message }, { status: 400 });
  }
}
