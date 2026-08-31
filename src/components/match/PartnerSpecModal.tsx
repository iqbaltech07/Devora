"use client";

import { useMatchStore } from "@/store/useMatchStore";
import { useUiStore } from "@/store/useUiStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  X,
  Flame,
  Users,
  GitBranch,
  Star,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
  Code2,
  Heart,
  MessageSquare,
  Layers,
  Zap,
} from "lucide-react";

export function PartnerSpecModal() {
  const { inspectingCandidate, setInspectingCandidate, swipeRight, matchedCandidates } =
    useMatchStore();
  const { addToast } = useUiStore();

  if (!inspectingCandidate) return null;

  const isAlreadyMatched = matchedCandidates.some(
    (c) => c.id === inspectingCandidate.id
  );

  const handleConnect = () => {
    if (!isAlreadyMatched) {
      swipeRight(inspectingCandidate.id);
    }
    addToast({
      title: "Undangan Kolaborasi Terkirim",
      description: `Kamu sudah mengajak ${inspectingCandidate.name} buat ngoding bareng!`,
      type: "success",
    });
    setInspectingCandidate(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-devora-surface border border-devora-border rounded-container shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-devora-border bg-devora-surface-strong/50">
          <div className="flex items-start gap-4">
            <Avatar
              src={inspectingCandidate.avatarUrl}
              fallback={inspectingCandidate.name.slice(0, 2).toUpperCase()}
              size="lg"
              className="border-2 border-devora-border shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-devora-ink tracking-tight">
                  {inspectingCandidate.name}
                </h2>
                <Badge variant="brand" className="text-xs font-bold px-2 py-0.5">
                  <Flame className="w-3 h-3 mr-1 fill-devora-brand" />
                  {inspectingCandidate.matchScore}% Match Cocok
                </Badge>
                {isAlreadyMatched && (
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Sudah Cocok
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-devora-ink-soft">
                {inspectingCandidate.title}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-devora-muted pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-devora-brand" />
                  {inspectingCandidate.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-devora-brand" />
                  Waktu luang {inspectingCandidate.availabilityHrs} jam/mgg
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">{inspectingCandidate.timezone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setInspectingCandidate(null)}
            className="p-2 text-devora-muted hover:text-devora-ink rounded-button hover:bg-devora-surface-strong transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Bio statement */}
          <div className="p-4 bg-devora-background border border-devora-border rounded-button">
            <p className="text-xs sm:text-sm text-devora-ink leading-relaxed italic">
              &ldquo;{inspectingCandidate.bio}&rdquo;
            </p>
          </div>

          {/* Why We Match Breakdown */}
          {inspectingCandidate.matchReasons && inspectingCandidate.matchReasons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-devora-brand" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-devora-muted">
                  Kenapa Kalian Cocok Ngoding Bareng
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inspectingCandidate.matchReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-devora-surface-strong/70 border border-devora-border rounded-button space-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-devora-ink">
                      <CheckCircle2 className="w-3.5 h-3.5 text-devora-brand" />
                      <span>{reason.title}</span>
                    </div>
                    <p className="text-xs text-devora-muted leading-relaxed pl-5.5">
                      {reason.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Technical Skill Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-devora-brand" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-devora-muted">
                  Keahlian & Pengalaman Teknis
                </h3>
              </div>
              <span className="text-xs text-devora-muted">
                {inspectingCandidate.skills?.length || 0} Keahlian Terverifikasi
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {inspectingCandidate.skills?.map((skill) => (
                <div
                  key={skill.id}
                  className="p-2.5 bg-devora-background border border-devora-border rounded-button flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-devora-ink block">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-devora-muted">
                      {skill.category}
                    </span>
                  </div>
                  <Badge
                    variant={skill.proficiency === "Senior" ? "brand" : "default"}
                    className="text-[10px] px-1.5 py-0 font-medium"
                  >
                    {skill.proficiency} ({skill.yearsOfExperience} thn)
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Repositories / Evidence */}
          {inspectingCandidate.repositories && inspectingCandidate.repositories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-devora-brand" />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-devora-muted">
                    Bukti Repositori & Karya Open Source
                  </h3>
                </div>
                {inspectingCandidate.githubUsername && (
                  <a
                    href={inspectingCandidate.githubUrl || `https://github.com/${inspectingCandidate.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-devora-brand hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>@{inspectingCandidate.githubUsername}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="space-y-2">
                {inspectingCandidate.repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-3 bg-devora-background border border-devora-border rounded-button flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-devora-ink">
                          {repo.name}
                        </span>
                        <Badge variant="default" className="text-[10px] py-0 px-1.5">
                          {repo.language}
                        </Badge>
                      </div>
                      <p className="text-xs text-devora-muted">
                        {repo.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-devora-muted shrink-0 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {repo.starsCount || 0}
                      </span>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 hover:text-devora-brand transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Building Intent & Looking For */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspectingCandidate.buildingProject && (
              <div className="p-4 bg-devora-surface-strong/50 border border-devora-border rounded-button space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-devora-brand" />
                  <span className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Lagi Bangun Proyek:
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-devora-ink">
                      {inspectingCandidate.buildingProject.title}
                    </span>
                    <Badge variant="brand" className="text-[10px] py-0 px-1.5">
                      {inspectingCandidate.buildingProject.stage}
                    </Badge>
                  </div>
                  <p className="text-xs text-devora-muted leading-relaxed">
                    {inspectingCandidate.buildingProject.description}
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 bg-devora-surface-strong/50 border border-devora-border rounded-button space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-devora-brand" />
                <span className="text-xs font-mono uppercase font-semibold text-devora-muted">
                  Kebutuhan Kolaborasi:
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {(inspectingCandidate.lookingFor?.roles && inspectingCandidate.lookingFor.roles.length > 0
                    ? inspectingCandidate.lookingFor.roles
                    : inspectingCandidate.tags.slice(0, 3)
                  ).map((r, i) => (
                    <Badge key={`${r}-${i}`} variant="default" className="text-xs">
                      {r}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-devora-muted">
                  Komitmen Waktu:{" "}
                  {inspectingCandidate.lookingFor?.commitment ||
                    `${inspectingCandidate.availabilityHrs} jam/mgg (${inspectingCandidate.workStyle})`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-devora-border bg-devora-surface-strong flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setInspectingCandidate(null)}
          >
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            {isAlreadyMatched ? (
              <Button
                size="md"
                className="gap-2 bg-devora-ink text-white hover:bg-devora-ink-soft font-bold"
                onClick={() => {
                  setInspectingCandidate(null);
                  window.location.href = "/messages";
                }}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Sapa & Mulai Chat</span>
              </Button>
            ) : (
              <Button
                size="md"
                className="gap-2 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold shadow-md"
                onClick={handleConnect}
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Ajak Kolaborasi (Match)</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
