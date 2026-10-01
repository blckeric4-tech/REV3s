import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { storeAsset, MAX_VIDEO_BYTES } from "@/lib/image-store";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const VIDEO_EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
};

/**
 * Admin-only media upload. Writes into public/uploads so the returned path can
 * be used directly as a product `image`, a gallery entry or the hero video.
 *
 * Accepts multipart/form-data with a single `file` field.
 */
export async function POST(request: Request) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }

  const isVideo = Boolean(VIDEO_EXT_BY_TYPE[file.type]);
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return NextResponse.json(
      {
        error: isVideo
          ? "That video is larger than 40 MB. Please compress it first."
          : "That image is larger than 6 MB. Please compress it first.",
      },
      { status: 413 }
    );
  }

  const ext = isVideo ? VIDEO_EXT_BY_TYPE[file.type] : EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Unsupported video type. Use MP4, WebM, MOV or OGG."
          : "Unsupported file type. Use JPEG, PNG, WebP, AVIF or GIF.",
      },
      { status: 415 }
    );
  }

  try {
    const url = await storeAsset(Buffer.from(await file.arrayBuffer()), ext);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Could not save the file. Check the folder permissions." },
      { status: 500 }
    );
  }
}
