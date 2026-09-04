"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import {
  Users,
  FolderKanban,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useMatchStore } from "@/store/useMatchStore";
import { useProjectStore } from "@/store/useProjectStore";

export function RightSidebarWidget() {
  const { candidates, fetchCandidates } = useMatchStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchCandidates();
    fetchProjects();
  }, [fetchCandidates, fetchProjects]);

  const trendingProjects = projects.slice(0, 3);
  const recommendedBuilders = candidates.slice(0, 4);

  return (
    <aside className="w-full space-y-5">
      {/* ─── 1. REKOMENDASI TEMAN SEJAWAT ─── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#317B67]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Cari Partner Proyek
            </h3>
          </div>
          <Link
            href="/findpartner"
            className="text-[11px] font-bold text-[#317B67] hover:underline flex items-center gap-1"
          >
            <span>Matchmaking</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {recommendedBuilders.length > 0 ? (
            recommendedBuilders.map((builder) => (
              <div
                key={builder.id}
                className="flex items-center justify-between gap-3 group"
              >
                <Link
                  href={`/profile/${builder.id}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1"
                >
                  <Avatar
                    src={builder.avatarUrl}
                    fallback={builder.name.slice(0, 2).toUpperCase()}
                    size="sm"
                    className="w-9 h-9 border border-[#E2E8F0] group-hover:border-[#317B67] transition-colors shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#317B67] transition-colors truncate">
                        {builder.name}
                      </h4>
                      <span className="text-[10px] text-[#317B67] font-bold">
                        {builder.matchScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {builder.title}
                    </p>
                  </div>
                </Link>

                <Link href={`/profile/${builder.id}`}>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F172A] hover:text-white text-[#0F172A] text-xs font-bold transition-all shrink-0"
                  >
                    Lihat
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-2 text-center">
              Belum ada rekomendasi partner baru.
            </p>
          )}
        </div>
      </div>

      {/* ─── 2. PROYEK KOMUNITAS TRENDING ─── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Proyek Butuh Rekan
            </h3>
          </div>
          <Link
            href="/projects"
            className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Semua</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {trendingProjects.length > 0 ? (
            trendingProjects.map((project) => (
              <Link
                key={project.id}
                href="/projects"
                className="block p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-400/60 transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors truncate">
                    {project.title}
                  </h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {project.stage}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] line-clamp-2">
                  {project.description}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-2 text-center">
              Belum ada proyek terbuka.
            </p>
          )}
        </div>
      </div>

      {/* ─── 3. TOP TAGAR BUILDER ─── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
          <Tag className="w-4 h-4 text-[#317B67]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            Top Tagar Builder
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            "#NeedPartner",
            "#BuildInPublic",
            "#Nextjs",
            "#React",
            "#TailwindCSS",
            "#TypeScript",
            "#PostgreSQL",
            "#AI",
            "#Showcase",
            "#Golang",
          ].map((tag) => (
            <Link
              key={tag}
              href={`/findpartner?tag=${tag.replace("#", "")}`}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-[#E8F7F0] hover:text-[#317B67] text-[11px] font-semibold text-[#475569] transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
