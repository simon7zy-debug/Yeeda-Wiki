import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { getData as getPdfWorkerData } from "pdf-parse/worker";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["pdf", "docx"]);
let isPdfWorkerConfigured = false;

function ensurePdfWorkerConfigured() {
  if (isPdfWorkerConfigured) return;
  PDFParse.setWorker(getPdfWorkerData());
  isPdfWorkerConfigured = true;
}

function getExtension(fileName: string): "pdf" | "docx" | null {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return null;
  const extension = fileName.slice(lastDot + 1).toLowerCase();
  if (!ALLOWED_TYPES.has(extension)) return null;
  return extension as "pdf" | "docx";
}

function normalizeExtractedText(input: string): string {
  return input.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractResumeText(file: File): Promise<{
  fileType: "pdf" | "docx";
  extractedText: string;
}> {
  const fileType = getExtension(file.name);
  if (!fileType) {
    throw new Error("仅支持上传 PDF 或 DOCX 文件。");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("文件大小不能超过 8MB。");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let extractedText = "";

  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    extractedText = result.value;
  } else {
    ensurePdfWorkerConfigured();
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    extractedText = result.text;
  }

  const normalized = normalizeExtractedText(extractedText);
  if (!normalized) {
    throw new Error("未提取到有效文本，请检查文档内容。");
  }

  return {
    fileType,
    extractedText: normalized,
  };
}
