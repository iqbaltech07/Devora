"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Globe, Calendar, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

const TIMEZONES = [
  { value: "Asia/Jakarta (UTC+7)", label: "Jakarta, Indonesia (UTC+7)", region: "Southeast Asia", offset: 7 },
  { value: "Asia/Singapore (UTC+8)", label: "Singapore / Kuala Lumpur (UTC+8)", region: "Southeast Asia", offset: 8 },
  { value: "Asia/Tokyo (UTC+9)", label: "Tokyo, Japan (UTC+9)", region: "East Asia", offset: 9 },
  { value: "Europe/London (UTC+0)", label: "London, UK (UTC+0)", region: "Europe", offset: 0 },
  { value: "Europe/Berlin (UTC+1)", label: "Berlin / Amsterdam (UTC+1)", region: "Europe", offset: 1 },
  { value: "America/New_York (UTC-5)", label: "New York, US East (UTC-5)", region: "Americas", offset: -5 },
  { value: "America/Los_Angeles (UTC-8)", label: "San Francisco, US West (UTC-8)", region: "Americas", offset: -8 },
];

const WORKING_RHYTHMS = [
  { id: "Weekday Evenings (Async-first)", label: "Weekday Evenings", desc: "Builds after main work hours. Prefers GitHub PRs & async notes." },
  { id: "Weekend Sprints", label: "Weekend Sprints", desc: "Focused 4-6 hour deep build sessions on Saturdays/Sundays." },
  { id: "Daily Active Sync", label: "Daily Active Sync", desc: "Available for real-time Slack/Discord discussions and pair sessions." },
  { id: "Full-Time Co-Building", label: "Full-Time Builder", desc: "Dedicated full bandwidth for rapid MVP commercialization." },
];

const HOUR_PRESETS = [6, 10, 15, 20, 30];

export function AvailabilitySettings() {
  const { currentUser, updateAvailability, updateTimezone, updateWorkingRhythm } = useUserStore();

  const [hours, setHours] = useState(currentUser.availabilityHrs || 12);
  const [selectedTz, setSelectedTz] = useState(currentUser.timezone || "Asia/Jakarta (UTC+7)");
  const [activeRhythm, setActiveRhythm] = useState(
    currentUser.workingRhythm || "Weekday Evenings (Async-first)"
  );
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  // Update clock preview
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleHoursChange = (val: number) => {
    setHours(val);
    updateAvailability(val);
  };

  const handleTimezoneChange = (tzVal: string) => {
    setSelectedTz(tzVal);
    const matched = TIMEZONES.find((t) => t.value === tzVal);
    updateTimezone(tzVal, matched ? matched.label.split("(")[0].trim() : "Custom Location");
  };

  const handleRhythmSelect = (rhythmId: string) => {
    setActiveRhythm(rhythmId);
    updateWorkingRhythm(rhythmId);
  };

  // Get commitment label
  const getCommitmentDescription = (h: number) => {
    if (h <= 8) return "Side Project (Light weekly bandwidth)";
    if (h <= 16) return "Serious Collaborator (Active evening/weekend contributor)";
    if (h <= 25) return "Substantial Builder (Part-time dedication)";
    return "Full-Time Co-Founder (Dedicated project owner)";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
              Availability & Collaboration Rhythm
            </h2>
            <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
              {hours} hrs / week
            </span>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Transparent schedule expectations prevent ghosting and align developer partner matches
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-mono">
          Human + Technical (design.md §02.4)
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Hours Slider Card */}
        <Card elevated className="p-6 space-y-5 bg-devora-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-devora-brand" />
              <span className="text-sm font-semibold text-devora-ink">
                Weekly Available Hours
              </span>
            </div>
            <span className="font-mono text-xl font-bold text-devora-brand">
              {hours} <span className="text-xs font-normal text-devora-muted">hrs/wk</span>
            </span>
          </div>

          {/* Stepped Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={4}
              max={40}
              step={1}
              value={hours}
              onChange={(e) => handleHoursChange(Number(e.target.value))}
              className="w-full h-2 bg-devora-surface-strong rounded-pill appearance-none cursor-pointer accent-devora-brand"
            />
            <div className="flex justify-between text-[11px] font-mono text-devora-muted">
              <span>4h (Casual)</span>
              <span>15h (Serious)</span>
              <span>40h (Full-time)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-[11px] font-mono text-devora-muted">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {HOUR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleHoursChange(preset)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded-button border transition-colors select-none",
                    hours === preset
                      ? "bg-devora-brand text-white border-devora-brand font-medium"
                      : "bg-devora-surface-strong text-devora-ink border-devora-border hover:border-devora-brand/40"
                  )}
                >
                  {preset} hrs/wk
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Bandwidth Feedback */}
          <div className="p-3.5 bg-devora-surface-strong rounded-button border border-devora-border text-xs space-y-1">
            <span className="block font-semibold text-devora-ink">
              Commitment Tier:
            </span>
            <p className="text-devora-muted leading-relaxed">
              {getCommitmentDescription(hours)}
            </p>
          </div>
        </Card>

        {/* Timezone & Real-Time Offset Card */}
        <Card elevated className="p-6 space-y-5 bg-devora-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-devora-brand" />
              <span className="text-sm font-semibold text-devora-ink">
                Timezone & Schedule Overlap
              </span>
            </div>
            {currentTimeStr && (
              <span className="font-mono text-xs font-medium text-devora-muted bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
                Local: {currentTimeStr}
              </span>
            )}
          </div>

          {/* Timezone Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-devora-muted">
              Primary Working Region / Base:
            </label>
            <select
              value={selectedTz}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full h-11 rounded-input border border-devora-border bg-devora-background px-3.5 text-xs sm:text-sm text-devora-ink focus-visible:outline-none focus-visible:border-devora-brand"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.region})
                </option>
              ))}
            </select>
          </div>

          {/* Timezone Overlap Insight */}
          <div className="p-3.5 bg-devora-surface-strong rounded-button border border-devora-border text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-devora-ink font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-devora-success" />
              <span>Overlap Window:</span>
            </div>
            <p className="text-devora-muted leading-relaxed">
              Based on {selectedTz.split("(")[0]}, you have high collaboration overlap with Southeast Asia, East Asia, and European evening contributors.
            </p>
          </div>
        </Card>
      </div>

      {/* Collaboration Working Rhythm Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-devora-brand" />
          <span className="text-sm font-semibold text-devora-ink">
            Preferred Collaboration Cadence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WORKING_RHYTHMS.map((rhythm) => {
            const isSelected = activeRhythm === rhythm.id;

            return (
              <div
                key={rhythm.id}
                onClick={() => handleRhythmSelect(rhythm.id)}
                className={cn(
                  "p-4 rounded-card border cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-2 select-none",
                  isSelected
                    ? "bg-devora-surface border-devora-brand shadow-card"
                    : "bg-devora-surface-strong/60 border-devora-border hover:border-devora-border-strong"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-devora-ink">
                      {rhythm.label}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-devora-brand" />
                    )}
                  </div>
                  <p className="text-xs text-devora-muted leading-relaxed">
                    {rhythm.desc}
                  </p>
                </div>

                <Badge
                  variant={isSelected ? "brand" : "surface"}
                  className="self-start text-[10px] mt-1"
                >
                  {isSelected ? "Active Cadence" : "Select"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
