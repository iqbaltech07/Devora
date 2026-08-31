export interface GeoLocationGroup {
  provinceOrRegion: string;
  country: string;
  cities: string[];
}

export const COMPLETE_INDONESIA_REGIONS: GeoLocationGroup[] = [
  {
    provinceOrRegion: "DKI Jakarta",
    country: "Indonesia",
    cities: [
      "Jakarta",
      "Jakarta Pusat",
      "Jakarta Selatan",
      "Jakarta Barat",
      "Jakarta Timur",
      "Jakarta Utara",
      "Kepulauan Seribu",
    ],
  },
  {
    provinceOrRegion: "Jawa Barat",
    country: "Indonesia",
    cities: [
      "Bandung",
      "Kota Bandung",
      "Kabupaten Bandung",
      "Bandung Barat",
      "Bekasi",
      "Kota Bekasi",
      "Kabupaten Bekasi",
      "Bogor",
      "Kota Bogor",
      "Kabupaten Bogor",
      "Depok",
      "Cimahi",
      "Cirebon",
      "Kota Cirebon",
      "Kabupaten Cirebon",
      "Sukabumi",
      "Tasikmalaya",
      "Garut",
      "Karawang",
      "Purwakarta",
      "Subang",
      "Sumedang",
      "Indramayu",
      "Majalengka",
      "Kuningan",
      "Cianjur",
      "Ciamis",
      "Pangandaran",
      "Banjar",
    ],
  },
  {
    provinceOrRegion: "Banten",
    country: "Indonesia",
    cities: [
      "Tangerang",
      "Kota Tangerang",
      "Tangerang Selatan (Tangsel)",
      "Kabupaten Tangerang",
      "Serang",
      "Kota Serang",
      "Kabupaten Serang",
      "Cilegon",
      "Pandeglang",
      "Lebak",
    ],
  },
  {
    provinceOrRegion: "Jawa Tengah",
    country: "Indonesia",
    cities: [
      "Semarang",
      "Kota Semarang",
      "Kabupaten Semarang",
      "Surakarta (Solo)",
      "Salatiga",
      "Magelang",
      "Pekalongan",
      "Tegal",
      "Banyumas / Purwokerto",
      "Cilacap",
      "Kudus",
      "Jepara",
      "Pati",
      "Klaten",
      "Sukoharjo",
      "Boyolali",
      "Karanganyar",
      "Sragen",
      "Wonogiri",
      "Purworejo",
      "Kebumen",
      "Wonosobo",
      "Temanggung",
      "Kendal",
      "Batang",
      "Pemalang",
      "Brebes",
      "Blora",
      "Rembang",
      "Grobogan",
      "Purbalingga",
      "Banjarnegara",
    ],
  },
  {
    provinceOrRegion: "DI Yogyakarta",
    country: "Indonesia",
    cities: [
      "Yogyakarta (Kota)",
      "Sleman",
      "Bantul",
      "Kulon Progo",
      "Gunungkidul",
    ],
  },
  {
    provinceOrRegion: "Jawa Timur",
    country: "Indonesia",
    cities: [
      "Surabaya",
      "Malang",
      "Kota Malang",
      "Kabupaten Malang",
      "Batu",
      "Sidoarjo",
      "Gresik",
      "Kediri",
      "Madiun",
      "Mojokerto",
      "Pasuruan",
      "Probolinggo",
      "Blitar",
      "Jember",
      "Banyuwangi",
      "Tuban",
      "Lamongan",
      "Bojonegoro",
      "Ngawi",
      "Magetan",
      "Ponorogo",
      "Pacitan",
      "Trenggalek",
      "Tulungagung",
      "Nganjuk",
      "Jombang",
      "Lumajang",
      "Bondowoso",
      "Situbondo",
      "Bangkalan",
      "Sampang",
      "Pamekasan",
      "Sumenep",
    ],
  },
  {
    provinceOrRegion: "Bali",
    country: "Indonesia",
    cities: [
      "Bali / Denpasar",
      "Badung (Canggu/Kuta/Seminyak)",
      "Gianyar (Ubud)",
      "Tabanan",
      "Buleleng (Singaraja)",
      "Karangasem",
      "Klungkung",
      "Bangli",
      "Jembrana",
    ],
  },
  {
    provinceOrRegion: "Nusa Tenggara Barat & Timur",
    country: "Indonesia",
    cities: [
      "Mataram (Lombok)",
      "Lombok Barat",
      "Lombok Tengah",
      "Lombok Timur",
      "Lombok Utara",
      "Sumbawa",
      "Bima",
      "Kupang",
      "Labuan Bajo / Manggarai Barat",
      "Ende",
      "Sikka / Maumere",
      "Sumba Timur",
    ],
  },
  {
    provinceOrRegion: "Sumatera Utara & Aceh",
    country: "Indonesia",
    cities: [
      "Medan",
      "Binjai",
      "Pematangsiantar",
      "Deli Serdang",
      "Karo / Berastagi",
      "Toba / Balige",
      "Asahan",
      "Tebing Tinggi",
      "Banda Aceh",
      "Lhokseumawe",
      "Langsa",
      "Sabang",
      "Aceh Besar",
    ],
  },
  {
    provinceOrRegion: "Sumatera Barat, Riau & Kepulauan Riau",
    country: "Indonesia",
    cities: [
      "Padang",
      "Bukittinggi",
      "Payakumbuh",
      "Solok",
      "Pariaman",
      "Pekanbaru",
      "Dumai",
      "Kampar",
      "Siak",
      "Batam",
      "Tanjungpinang",
      "Bintan",
      "Karimun",
      "Natuna",
    ],
  },
  {
    provinceOrRegion: "Sumatera Selatan, Jambi, Bengkulu, Lampung, Bangka Belitung",
    country: "Indonesia",
    cities: [
      "Palembang",
      "Prabumulih",
      "Lubuklinggau",
      "Jambi",
      "Bengkulu",
      "Bandar Lampung",
      "Metro",
      "Lampung Selatan",
      "Pangkalpinang (Bangka)",
      "Tanjung Pandan (Belitung)",
    ],
  },
  {
    provinceOrRegion: "Kalimantan",
    country: "Indonesia",
    cities: [
      "Balikpapan",
      "Samarinda",
      "IKN (Nusantara) / Penajam Paser Utara",
      "Bontang",
      "Kutai Kartanegara",
      "Pontianak",
      "Singkawang",
      "Kubu Raya",
      "Banjarmasin",
      "Banjarbaru",
      "Palangka Raya",
      "Tarakan",
      "Tanjung Selor",
    ],
  },
  {
    provinceOrRegion: "Sulawesi",
    country: "Indonesia",
    cities: [
      "Makassar",
      "Gowa",
      "Maros",
      "Parepare",
      "Palopo",
      "Manado",
      "Bitung",
      "Tomohon",
      "Minahasa",
      "Palu",
      "Kendari",
      "Gorontalo",
      "Mamuju",
    ],
  },
  {
    provinceOrRegion: "Maluku & Papua",
    country: "Indonesia",
    cities: [
      "Ambon",
      "Ternate",
      "Tidore",
      "Jayapura",
      "Kota Jayapura",
      "Sorong",
      "Manokwari",
      "Merauke",
      "Timika / Mimika",
      "Nabire",
      "Wamena / Jayawijaya",
      "Biak Numfor",
    ],
  },
  {
    provinceOrRegion: "Global Tech Hubs & Remote",
    country: "International",
    cities: [
      "Full Remote (Anywhere)",
      "Singapore",
      "Kuala Lumpur, Malaysia",
      "Penang, Malaysia",
      "Bangkok, Thailand",
      "Ho Chi Minh City, Vietnam",
      "Manila, Philippines",
      "Tokyo, Japan",
      "Seoul, South Korea",
      "Taipei, Taiwan",
      "Bengaluru (Bangalore), India",
      "Sydney, Australia",
      "Melbourne, Australia",
      "London, United Kingdom",
      "Berlin, Germany",
      "Amsterdam, Netherlands",
      "Paris, France",
      "Zurich, Switzerland",
      "Stockholm, Sweden",
      "Tallinn, Estonia",
      "San Francisco / Bay Area, US",
      "Seattle, US",
      "New York, US",
      "Austin, US",
      "Toronto, Canada",
      "Vancouver, Canada",
      "Dubai, UAE",
    ],
  },
];

export function getAllFlatCities(): string[] {
  const set = new Set<string>();
  COMPLETE_INDONESIA_REGIONS.forEach((group) => {
    group.cities.forEach((city) => set.add(city));
  });
  return Array.from(set);
}

export function guessTimezoneFromCity(city: string): string {
  const lower = city.toLowerCase();

  // WIT (UTC+9)
  if (
    lower.includes("jayapura") ||
    lower.includes("papua") ||
    lower.includes("sorong") ||
    lower.includes("ambon") ||
    lower.includes("maluku") ||
    lower.includes("ternate") ||
    lower.includes("tidore") ||
    lower.includes("manokwari") ||
    lower.includes("merauke") ||
    lower.includes("timika") ||
    lower.includes("nabire") ||
    lower.includes("wamena") ||
    lower.includes("biak")
  ) {
    return "Asia/Jayapura (UTC+9)";
  }

  // WITA (UTC+8)
  if (
    lower.includes("bali") ||
    lower.includes("denpasar") ||
    lower.includes("badung") ||
    lower.includes("canggu") ||
    lower.includes("ubud") ||
    lower.includes("gianyar") ||
    lower.includes("makassar") ||
    lower.includes("manado") ||
    lower.includes("palu") ||
    lower.includes("kendari") ||
    lower.includes("gorontalo") ||
    lower.includes("mamuju") ||
    lower.includes("sulawesi") ||
    lower.includes("mataram") ||
    lower.includes("lombok") ||
    lower.includes("kupang") ||
    lower.includes("labuan bajo") ||
    lower.includes("balikpapan") ||
    lower.includes("samarinda") ||
    lower.includes("bontang") ||
    lower.includes("tarakan") ||
    lower.includes("kaltim") ||
    lower.includes("kalsel") ||
    lower.includes("banjarmasin") ||
    lower.includes("banjarbaru")
  ) {
    return "Asia/Makassar (UTC+8)";
  }

  // International Specifics
  if (lower.includes("singapore") || lower.includes("malaysia") || lower.includes("kuala lumpur") || lower.includes("penang")) {
    return "Asia/Singapore (UTC+8)";
  }
  if (lower.includes("tokyo") || lower.includes("seoul") || lower.includes("japan") || lower.includes("korea")) {
    return "Asia/Tokyo (UTC+9)";
  }
  if (lower.includes("sydney") || lower.includes("melbourne") || lower.includes("australia")) {
    return "Australia/Sydney (UTC+10)";
  }
  if (lower.includes("london") || lower.includes("united kingdom") || lower.includes("uk")) {
    return "Europe/London (UTC+0)";
  }
  if (lower.includes("berlin") || lower.includes("amsterdam") || lower.includes("paris") || lower.includes("zurich") || lower.includes("stockholm") || lower.includes("eropa")) {
    return "Europe/Berlin (UTC+1)";
  }
  if (lower.includes("san francisco") || lower.includes("seattle") || lower.includes("california") || lower.includes("vancouver") || lower.includes("bay area")) {
    return "America/Los_Angeles (UTC-8)";
  }
  if (lower.includes("new york") || lower.includes("toronto") || lower.includes("boston")) {
    return "America/New_York (UTC-5)";
  }
  if (lower.includes("bangalore") || lower.includes("bengaluru") || lower.includes("india")) {
    return "Asia/Kolkata (UTC+5:30)";
  }
  if (lower.includes("dubai") || lower.includes("uae")) {
    return "Asia/Dubai (UTC+4)";
  }

  // Default Indonesia WIB (UTC+7)
  return "Asia/Jakarta (UTC+7)";
}
