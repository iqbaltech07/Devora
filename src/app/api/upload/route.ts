import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // 1. Handle Multipart Form Data (File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const category = (formData.get("category") as string) || "avatars";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Check max file size (10 MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Ukuran file maksimal adalah 10 MB" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize extension and file name
      const originalName = file.name || "image.png";
      const ext = path.extname(originalName).toLowerCase() || ".png";
      const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".svg"];

      if (!allowedExts.includes(ext)) {
        return NextResponse.json(
          { error: "Format file tidak didukung. Harap upload gambar (PNG, JPG, WEBP) atau PDF." },
          { status: 400 }
        );
      }

      const safeFolder = category === "certificates" ? "certificates" : "avatars";
      const safeId = `${session.user.id.slice(0, 8)}-${Date.now()}`;
      const fileName = `${safeFolder.slice(0, 4)}-${safeId}${ext}`;

      // Ensure directory exists in public/uploads/${safeFolder}
      const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        const publicUrl = `/uploads/${safeFolder}/${fileName}`;
        return NextResponse.json({
          url: publicUrl,
          fileName: originalName,
          size: file.size,
          type: file.type,
        });
      } catch (fsErr) {
        console.warn("Failed to write to public directory, falling back to base64 data URL:", fsErr);
        const mime = file.type || (ext === ".pdf" ? "application/pdf" : "image/png");
        const base64Url = `data:${mime};base64,${buffer.toString("base64")}`;
        return NextResponse.json({
          url: base64Url,
          fileName: originalName,
          size: file.size,
          type: file.type,
        });
      }
    }

    // 2. Handle JSON Base64 Payload
    const body = await request.json();
    if (body.dataUrl) {
      return NextResponse.json({
        url: body.dataUrl,
        fileName: body.fileName || "avatar.png",
      });
    }

    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file. Silakan coba lagi." }, { status: 500 });
  }
}
