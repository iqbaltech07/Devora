import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rute yang butuh autentikasi (Protected Routes)
  const isProtectedRoute = 
    pathname.startsWith("/profile") || 
    pathname.startsWith("/matches") || 
    pathname.startsWith("/projects") || 
    pathname.startsWith("/find-partner") ||
    pathname.startsWith("/onboarding");

  // Jika bukan protected route, biarkan lewat
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Menggunakan betterFetch untuk mengecek sesi (karena Prisma tidak support Edge Runtime secara native)
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  // Jika tidak ada sesi dan mencoba akses rute terproteksi, lempar ke /signin
  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    // Simpan rute asli agar bisa dikembalikan setelah login (opsional)
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Jika sesi valid, lanjutkan request
  return NextResponse.next();
}

// Konfigurasi Matcher untuk mengoptimalkan performa Proxy
// Proxy hanya akan dijalankan pada rute-rute ini
export const config = {
  matcher: [
    "/profile/:path*", 
    "/matches/:path*", 
    "/projects/:path*", 
    "/find-partner/:path*",
    "/onboarding/:path*"
  ],
};
