import { NextResponse } from "next/server";
import { COMPLETE_INDONESIA_REGIONS, getAllFlatCities } from "@/lib/geo-data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase().trim();

    if (!query) {
      return NextResponse.json({
        groups: COMPLETE_INDONESIA_REGIONS,
        totalCities: getAllFlatCities().length,
      });
    }

    // Filter cities matching search query
    const filteredGroups = COMPLETE_INDONESIA_REGIONS.map((group) => {
      const matchingCities = group.cities.filter((city) =>
        city.toLowerCase().includes(query)
      );
      return {
        ...group,
        cities: matchingCities,
      };
    }).filter((group) => group.cities.length > 0);

    return NextResponse.json({
      groups: filteredGroups,
      totalCities: filteredGroups.reduce((acc, g) => acc + g.cities.length, 0),
    });
  } catch (error) {
    console.error("GET /api/geo/locations error:", error);
    return NextResponse.json(
      { error: "Failed to load locations" },
      { status: 500 }
    );
  }
}
