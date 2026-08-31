import { NextResponse } from "next/server";

export interface TimezoneItem {
  value: string;
  label: string;
  offset: string;
  region: string;
  isIndonesia?: boolean;
}

const CURATED_TIMEZONES: TimezoneItem[] = [
  // Indonesia (WIB, WITA, WIT)
  {
    value: "Asia/Jakarta (UTC+7)",
    label: "WIB (UTC+7) - Jakarta, Bandung, Surabaya, Medan, Sumatera, Jawa, Kalbar",
    offset: "+07:00",
    region: "Indonesia (WIB)",
    isIndonesia: true,
  },
  {
    value: "Asia/Pontianak (UTC+7)",
    label: "WIB (UTC+7) - Pontianak, Kalimantan Barat",
    offset: "+07:00",
    region: "Indonesia (WIB)",
    isIndonesia: true,
  },
  {
    value: "Asia/Makassar (UTC+8)",
    label: "WITA (UTC+8) - Bali, Makassar, Balikpapan, Manado, NTB, NTT, Kaltim",
    offset: "+08:00",
    region: "Indonesia (WITA)",
    isIndonesia: true,
  },
  {
    value: "Asia/Jayapura (UTC+9)",
    label: "WIT (UTC+9) - Jayapura, Ambon, Sorong, Maluku, Papua",
    offset: "+09:00",
    region: "Indonesia (WIT)",
    isIndonesia: true,
  },

  // Asia & Oceania
  {
    value: "Asia/Singapore (UTC+8)",
    label: "SGT (UTC+8) - Singapore, Kuala Lumpur, Manila",
    offset: "+08:00",
    region: "Asia Pacific",
  },
  {
    value: "Asia/Bangkok (UTC+7)",
    label: "ICT (UTC+7) - Bangkok, Hanoi, Phnom Penh",
    offset: "+07:00",
    region: "Asia Pacific",
  },
  {
    value: "Asia/Tokyo (UTC+9)",
    label: "JST (UTC+9) - Tokyo, Osaka, Kyoto",
    offset: "+09:00",
    region: "East Asia",
  },
  {
    value: "Asia/Seoul (UTC+9)",
    label: "KST (UTC+9) - Seoul, South Korea",
    offset: "+09:00",
    region: "East Asia",
  },
  {
    value: "Asia/Taipei (UTC+8)",
    label: "CST (UTC+8) - Taipei, Taiwan",
    offset: "+08:00",
    region: "East Asia",
  },
  {
    value: "Asia/Hong_Kong (UTC+8)",
    label: "HKT (UTC+8) - Hong Kong",
    offset: "+08:00",
    region: "East Asia",
  },
  {
    value: "Asia/Kolkata (UTC+5:30)",
    label: "IST (UTC+5:30) - Bengaluru, Mumbai, New Delhi",
    offset: "+05:30",
    region: "South Asia",
  },
  {
    value: "Asia/Dubai (UTC+4)",
    label: "GST (UTC+4) - Dubai, Abu Dhabi",
    offset: "+04:00",
    region: "Middle East",
  },
  {
    value: "Australia/Sydney (UTC+10)",
    label: "AEST (UTC+10) - Sydney, Melbourne, Brisbane",
    offset: "+10:00",
    region: "Australia & NZ",
  },
  {
    value: "Australia/Perth (UTC+8)",
    label: "AWST (UTC+8) - Perth, Western Australia",
    offset: "+08:00",
    region: "Australia & NZ",
  },
  {
    value: "Pacific/Auckland (UTC+12)",
    label: "NZST (UTC+12) - Auckland, Wellington",
    offset: "+12:00",
    region: "Australia & NZ",
  },

  // Europe & Africa
  {
    value: "Europe/London (UTC+0)",
    label: "GMT/BST (UTC+0/+1) - London, Dublin, Edinburgh",
    offset: "+00:00",
    region: "Europe",
  },
  {
    value: "Europe/Berlin (UTC+1)",
    label: "CET (UTC+1) - Berlin, Amsterdam, Paris, Zurich, Frankfurt",
    offset: "+01:00",
    region: "Europe",
  },
  {
    value: "Europe/Stockholm (UTC+1)",
    label: "CET (UTC+1) - Stockholm, Oslo, Copenhagen",
    offset: "+01:00",
    region: "Europe",
  },
  {
    value: "Europe/Tallinn (UTC+2)",
    label: "EET (UTC+2) - Tallinn, Helsinki, Vilnius",
    offset: "+02:00",
    region: "Europe",
  },

  // Americas
  {
    value: "America/New_York (UTC-5)",
    label: "EST/EDT (UTC-5/-4) - New York, Boston, Toronto, Miami",
    offset: "-05:00",
    region: "Americas",
  },
  {
    value: "America/Chicago (UTC-6)",
    label: "CST/CDT (UTC-6/-5) - Chicago, Austin, Dallas",
    offset: "-06:00",
    region: "Americas",
  },
  {
    value: "America/Denver (UTC-7)",
    label: "MST/MDT (UTC-7/-6) - Denver, Salt Lake City",
    offset: "-07:00",
    region: "Americas",
  },
  {
    value: "America/Los_Angeles (UTC-8)",
    label: "PST/PDT (UTC-8/-7) - San Francisco, Seattle, Los Angeles, Vancouver",
    offset: "-08:00",
    region: "Americas",
  },
  {
    value: "America/Sao_Paulo (UTC-3)",
    label: "BRT (UTC-3) - Sao Paulo, Rio de Janeiro",
    offset: "-03:00",
    region: "Americas",
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      timezones: CURATED_TIMEZONES,
      total: CURATED_TIMEZONES.length,
    });
  } catch (error) {
    console.error("GET /api/geo/timezones error:", error);
    return NextResponse.json(
      { error: "Failed to load timezones" },
      { status: 500 }
    );
  }
}
