import { NextResponse } from "next/server";

import { getDocument, updateRewrite } from "@/lib/document-store";
import { buildRuleBasedRewrite, buildRuleBasedReview } from "@/lib/review-engine";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("docId");

  if (!docId) {
    return NextResponse.json({ message: "缺少 docId 参数。" }, { status: 400 });
  }

  const document = getDocument(docId);
  if (!document) {
    return NextResponse.json(
      { message: "文档不存在或已过期，请重新上传。" },
      { status: 404 },
    );
  }

  const review = document.reviewResult ?? buildRuleBasedReview(document.extractedText);
  const rewrite =
    document.rewriteResult ?? buildRuleBasedRewrite(document.extractedText, review);

  if (!document.rewriteResult) {
    updateRewrite(docId, rewrite);
  }

  return NextResponse.json({
    docId,
    fileName: document.fileName,
    rewrite,
  });
}
