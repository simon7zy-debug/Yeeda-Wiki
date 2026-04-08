"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UploadResult = {
  docId: string;
  fileName: string;
  fileType: "pdf" | "docx";
  textPreview: string;
};

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function isFileAccepted(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export default function ResumePage() {
  const router = useRouter();
  const [fromDiagnose, setFromDiagnose] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const selectedFileInfo = useMemo(() => {
    if (!selectedFile) return null;
    return `${selectedFile.name} · ${(selectedFile.size / 1024).toFixed(1)} KB`;
  }, [selectedFile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setFromDiagnose(params.get("from") === "diagnose");
  }, []);

  function onSelectFile(file: File | null) {
    setUploadResult(null);
    setErrorMessage(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isFileAccepted(file)) {
      setSelectedFile(null);
      setErrorMessage("仅支持上传 PDF 或 DOCX 格式。");
      return;
    }

    setSelectedFile(file);
  }

  async function startReview() {
    if (!selectedFile) {
      setErrorMessage("请先选择简历文档。");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "上传失败，请稍后再试。");
      }

      setUploadResult(payload);
      router.push(`/review?docId=${payload.docId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "上传失败，请稍后重试。";
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, #f2c6a8 0%, transparent 35%), radial-gradient(circle at 85% 20%, #f0dbb9 0%, transparent 38%), radial-gradient(circle at 60% 85%, #d7e3d4 0%, transparent 45%)",
        }}
      />
      <main className="relative w-full max-w-3xl rounded-3xl border border-line bg-panel/95 p-6 shadow-xl backdrop-blur sm:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-line bg-white px-3 py-1 text-xs font-medium tracking-wide text-ink-soft">
              AIPM Workbench · Resume Review
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              上传简历文档，开始评审
            </h1>
            <p className="mt-3 text-sm leading-7 text-ink-soft sm:text-base">
              保留原有简历流程：上传文档 → 自动解析 → 规则评审 → 改写建议。
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              流程要求：请先经过 Diagnose 分流再进入本页执行。
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              首页
            </Link>
            <Link
              href="/diagnose?task=resume_optimization"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              先诊断
            </Link>
          </div>
        </div>

        {!fromDiagnose ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            当前为直达访问。请先进入 Diagnose，完成问题确认后再执行简历评审。
            <Link href="/diagnose?task=resume_optimization" className="ml-1 font-semibold underline">
              去 Diagnose
            </Link>
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            已通过 Diagnose 分流，当前节点：Resume Review。
          </div>
        )}

        <section
          className={`rounded-2xl border-2 border-dashed p-6 transition ${
            isDragging
              ? "border-accent bg-orange-50"
              : "border-line bg-[#fffdfa]"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            onSelectFile(event.dataTransfer.files[0] ?? null);
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                拖拽文件到这里，或点击按钮选择文件
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                支持格式：PDF、DOCX；建议文件大小 ≤ 8MB
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent">
              选择文件
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-soft">
            {selectedFileInfo ?? "还未选择文件"}
          </div>
        </section>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {uploadResult ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            已完成解析：{uploadResult.fileName}（{uploadResult.fileType.toUpperCase()}）
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedFile || isUploading || !fromDiagnose}
            onClick={startReview}
          >
            {isUploading ? "解析中..." : "开始评审"}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
            onClick={() => {
              setSelectedFile(null);
              setUploadResult(null);
              setErrorMessage(null);
            }}
          >
            重置
          </button>
        </div>
      </main>
    </div>
  );
}
