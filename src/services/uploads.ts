import { api } from "./api";

export interface UploadResult {
  url: string;
}

const URL_KEYS = ["url", "secureUrl", "secure_url", "fileUrl", "file_url"] as const;

export async function uploadCoverImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const payload = (data?.data ?? data ?? {}) as Record<string, unknown>;
  const found = URL_KEYS.map((key) => payload?.[key as keyof typeof payload])
    .find((value) => typeof value === "string" && value.length > 0);

  if (typeof found !== "string" || !found) {
    throw new Error("Upload response missing file URL");
  }

  return { url: found };
}
