import type { RewriteResult, ReviewResult, StoredDocument } from "@/lib/types";

type StoreShape = Map<string, StoredDocument>;

const globalStore = globalThis as typeof globalThis & {
  __aipmDocumentStore?: StoreShape;
};

function getStore(): StoreShape {
  if (!globalStore.__aipmDocumentStore) {
    globalStore.__aipmDocumentStore = new Map<string, StoredDocument>();
  }
  return globalStore.__aipmDocumentStore;
}

export function saveDocument(input: {
  fileName: string;
  fileType: "pdf" | "docx";
  extractedText: string;
}): StoredDocument {
  const document: StoredDocument = {
    id: crypto.randomUUID(),
    fileName: input.fileName,
    fileType: input.fileType,
    extractedText: input.extractedText,
    createdAt: Date.now(),
  };

  getStore().set(document.id, document);
  return document;
}

export function getDocument(docId: string): StoredDocument | undefined {
  return getStore().get(docId);
}

export function updateReview(docId: string, reviewResult: ReviewResult): void {
  const document = getStore().get(docId);
  if (!document) return;
  document.reviewResult = reviewResult;
}

export function updateRewrite(docId: string, rewriteResult: RewriteResult): void {
  const document = getStore().get(docId);
  if (!document) return;
  document.rewriteResult = rewriteResult;
}
