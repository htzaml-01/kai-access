// KAI Data Store & Commuter Line Route Database

let isLoggedIn = false;
let currentUser = null;

const RAILPOIN_DATA = {
    balance: 0,
    tier: "Belum Login",
    userName: "Tamu",
    history: []
};

// User's Booked Tickets Array (Empty when logged out)
let USER_BOOKED_TICKETS = [];

// Intercity Major Cities Dataset (Top Destinations with 2 Stations each)
const INTERCITY_CITIES = [
    {
        cityName: "Jakarta",
        code: "JKT",
        stations: [
            { code: "GMR", name: "Gambir", fullName: "Stasiun Gambir (GMR)", city: "Jakarta" },
            { code: "PSE", name: "Pasar Senen", fullName: "Stasiun Pasar Senen (PSE)", city: "Jakarta" }
        ]
    },
    {
        cityName: "Bandung",
        code: "BDG",
        stations: [
            { code: "BD", name: "Bandung", fullName: "Stasiun Bandung (BD)", city: "Bandung" },
            { code: "KAC", name: "Kiaracondong", fullName: "Stasiun Kiaracondong (KAC)", city: "Bandung" }
        ]
    },
    {
        cityName: "Yogyakarta",
        code: "YGK",
        stations: [
            { code: "YK", name: "Yogyakarta / Tugu", fullName: "Stasiun Yogyakarta / Tugu (YK)", city: "Yogyakarta" },
            { code: "LPN", name: "Lempuyangan", fullName: "Stasiun Lempuyangan (LPN)", city: "Yogyakarta" }
        ]
    },
    {
        cityName: "Surabaya",
        code: "SUB",
        stations: [
            { code: "SGU", name: "Surabaya Gubeng", fullName: "Stasiun Surabaya Gubeng (SGU)", city: "Surabaya" },
            { code: "SBI", name: "Surabaya Pasarturi", fullName: "Stasiun Surabaya Pasarturi (SBI)", city: "Surabaya" }
        ]
    },
    {
        cityName: "Semarang",
        code: "SMG",
        stations: [
            { code: "SMT", name: "Semarang Tawang", fullName: "Stasiun Semarang Tawang (SMT)", city: "Semarang" },
            { code: "SMC", name: "Semarang Poncol", fullName: "Stasiun Semarang Poncol (SMC)", city: "Semarang" }
        ]
    }
];

// Mode Station Datasets strictly adhering to route and geographic limits:
// 1. Local: ONLY East Java (Surabaya & Malang), exactly 5 stations per city.
// 2. Commuter: Commuter Line East Java (Penataran / Dhoho loop - Surabaya to Blitar via Malang / Kertosono).
// 3. LRT: ONLY Jakarta / Jabodebek LRT stations.
// 4. Whoosh: ONLY Jakarta (Halim) <-> Bandung (Padalarang, Tegalluar).
// 5. Airport: Jakarta (BNI City <-> Soekarno-Hatta) & Yogyakarta (Tugu <-> YIA).
const MODE_STATIONS_DATA = {
    Local: [
        {
            cityName: "Surabaya",
            code: "SUB_LOC",
            stations: [
                { code: "SGU", name: "Surabaya Gubeng", fullName: "Stasiun Surabaya Gubeng (SGU)", city: "Surabaya" },
                { code: "SBI", name: "Surabaya Pasarturi", fullName: "Stasiun Surabaya Pasarturi (SBI)", city: "Surabaya" },
                { code: "SB", name: "Surabaya Kota", fullName: "Stasiun Surabaya Kota (SB)", city: "Surabaya" },
                { code: "WO", name: "Wonokromo", fullName: "Stasiun Wonokromo (WO)", city: "Surabaya" },
                { code: "SPJ", name: "Sepanjang", fullName: "Stasiun Sepanjang (SPJ)", city: "Surabaya" }
            ]
        },
        {
            cityName: "Malang",
            code: "MLG_LOC",
            stations: [
                { code: "ML", name: "Malang", fullName: "Stasiun Malang (ML)", city: "Malang" },
                { code: "MLK", name: "Malang Kotalama", fullName: "Stasiun Malang Kotalama (MLK)", city: "Malang" },
                { code: "AMG", name: "Blimbing", fullName: "Stasiun Blimbing (AMG)", city: "Malang" },
                { code: "LW", name: "Lawang", fullName: "Stasiun Lawang (LW)", city: "Malang" },
                { code: "KPN", name: "Kepanjen", fullName: "Stasiun Kepanjen (KPN)", city: "Malang" }
            ]
        }
    ],

    Commuter: [
        {
            cityName: "Commuter Line Jawa Timur (Penataran / Dhoho)",
            code: "CL_JATIM",
            stations: [
                { code: "SGU", name: "Surabaya Gubeng", fullName: "Stasiun Surabaya Gubeng (SGU)", city: "Surabaya" },
                { code: "WO", name: "Wonokromo", fullName: "Stasiun Wonokromo (WO)", city: "Surabaya" },
                { code: "SDA", name: "Sidoarjo", fullName: "Stasiun Sidoarjo (SDA)", city: "Sidoarjo" },
                { code: "BG", name: "Bangil", fullName: "Stasiun Bangil (BG)", city: "Pasuruan" },
                { code: "LW", name: "Lawang", fullName: "Stasiun Lawang (LW)", city: "Malang" },
                { code: "ML", name: "Malang", fullName: "Stasiun Malang (ML)", city: "Malang" },
                { code: "KPN", name: "Kepanjen", fullName: "Stasiun Kepanjen (KPN)", city: "Malang" },
                { code: "BL", name: "Blitar", fullName: "Stasiun Blitar (BL)", city: "Blitar" },
                { code: "TA", name: "Tulungagung", fullName: "Stasiun Tulungagung (TA)", city: "Tulungagung" },
                { code: "KD", name: "Kediri", fullName: "Stasiun Kediri (KD)", city: "Kediri" },
                { code: "KTS", name: "Kertosono", fullName: "Stasiun Kertosono (KTS)", city: "Nganjuk" },
                { code: "JG", name: "Jombang", fullName: "Stasiun Jombang (JG)", city: "Jombang" },
                { code: "MR", name: "Mojokerto", fullName: "Stasiun Mojokerto (MR)", city: "Mojokerto" }
            ]
        }
    ],

    LRT: [
        {
            cityName: "LRT Jabodebek (Jakarta)",
            code: "LRT_JKT",
            stations: [
                { code: "DKA", name: "Dukuh Atas LRT", fullName: "Stasiun Dukuh Atas LRT (DKA)", city: "Jakarta" },
                { code: "RSS", name: "Rasuna Said LRT", fullName: "Stasiun Rasuna Said LRT (RSS)", city: "Jakarta" },
                { code: "PCR", name: "Pancoran LRT", fullName: "Stasiun Pancoran LRT (PCR)", city: "Jakarta" },
                { code: "CWG", name: "Cawang LRT", fullName: "Stasiun Cawang LRT (CWG)", city: "Jakarta" },
                { code: "TMI", name: "TMII LRT", fullName: "Stasiun TMII LRT (TMI)", city: "Jakarta" },
                { code: "HJM", name: "Harjamukti LRT", fullName: "Stasiun Harjamukti LRT (HJM)", city: "Depok" },
                { code: "BKB", name: "Bekasi Barat LRT", fullName: "Stasiun Bekasi Barat LRT (BKB)", city: "Bekasi" },
                { code: "JTM", name: "Jati Mulya LRT", fullName: "Stasiun Jati Mulya LRT (JTM)", city: "Bekasi" }
            ]
        }
    ],

    Whoosh: [
        {
            cityName: "Jakarta & Bandung",
            code: "WHOOSH_ST",
            stations: [
                { code: "HLM", name: "Halim (Whoosh)", fullName: "Stasiun Halim Whoosh (HLM)", city: "Jakarta" },
                { code: "PAD", name: "Padalarang (Whoosh)", fullName: "Stasiun Padalarang Whoosh (PAD)", city: "Bandung" },
                { code: "TGL", name: "Tegalluar (Whoosh)", fullName: "Stasiun Tegalluar Whoosh (TGL)", city: "Bandung" }
            ]
        }
    ],

    Airport: [
        {
            cityName: "KA Bandara Jakarta & Jogja",
            code: "AIRPORT_ST",
            stations: [
                { code: "BST", name: "BNI City (Sudirman)", fullName: "Stasiun BNI City (BST)", city: "Jakarta" },
                { code: "BSTH", name: "Soekarno-Hatta Airport", fullName: "Stasiun Bandara Soekarno-Hatta (BSTH)", city: "Jakarta" },
                { code: "YK", name: "Yogyakarta / Tugu", fullName: "Stasiun Yogyakarta (YK)", city: "Yogyakarta" },
                { code: "YIA", name: "Yogyakarta Intl Airport", fullName: "Stasiun Bandara YIA (YIA)", city: "Yogyakarta" }
            ]
        }
    ],

    Intercity: INTERCITY_CITIES
};

// Helper to map station code to city
function getCityByStationCode(stationCode) {
    for (const c of INTERCITY_CITIES) {
        if (c.stations.some(s => s.code === stationCode)) {
            return c.cityName;
        }
    }
    return "Unknown";
}

// Intercity & Regional Train Schedules Dataset
const TRAIN_SCHEDULES_DATA = [
    // --- JAKARTA <-> BANDUNG ---
    {
        id: "sch-jb-1",
        trainName: "Argo Parahyangan",
        trainCode: "KA 44",
        category: "Intercity",
        availableSeats: 32,
        originCode: "GMR",
        originName: "Gambir",
        originCity: "Jakarta",
        originTime: "08:15 WIB",
        destCode: "BD",
        destName: "Bandung",
        destCity: "Bandung",
        destTime: "11:00 WIB",
        duration: "2j 45m",
        classType: "Eksekutif",
        price: 150000
    },
    {
        id: "sch-jb-2",
        trainName: "Argo Parahyangan",
        trainCode: "KA 46",
        category: "Intercity",
        availableSeats: 20,
        originCode: "GMR",
        originName: "Gambir",
        originCity: "Jakarta",
        originTime: "15:30 WIB",
        destCode: "BD",
        destName: "Bandung",
        destCity: "Bandung",
        destTime: "18:15 WIB",
        duration: "2j 45m",
        classType: "Eksekutif Luxury",
        price: 250000
    },
    {
        id: "sch-jb-3",
        trainName: "Cikuray",
        trainCode: "KA 7048",
        category: "Intercity",
        availableSeats: 48,
        originCode: "PSE",
        originName: "Pasar Senen",
        originCity: "Jakarta",
        originTime: "07:05 WIB",
        destCode: "KAC",
        destName: "Kiaracondong",
        destCity: "Bandung",
        destTime: "10:30 WIB",
        duration: "3j 25m",
        classType: "Ekonomi",
        price: 45000
    },
    {
        id: "sch-jb-4",
        trainName: "Argo Parahyangan",
        trainCode: "KA 45",
        category: "Intercity",
        availableSeats: 28,
        originCode: "BD",
        originName: "Bandung",
        originCity: "Bandung",
        originTime: "06:00 WIB",
        destCode: "GMR",
        destName: "Gambir",
        destCity: "Jakarta",
        destTime: "08:45 WIB",
        duration: "2j 45m",
        classType: "Eksekutif",
        price: 150000
    },
    {
        id: "sch-jb-5",
        trainName: "Malabar",
        trainCode: "KA 122",
        category: "Intercity",
        availableSeats: 16,
        originCode: "KAC",
        originName: "Kiaracondong",
        originCity: "Bandung",
        originTime: "17:20 WIB",
        destCode: "PSE",
        destName: "Pasar Senen",
        destCity: "Jakarta",
        destTime: "20:45 WIB",
        duration: "3j 25m",
        classType: "Eksekutif & Ekonomi",
        price: 160000
    },

    // --- JAKARTA <-> YOGYAKARTA ---
    {
        id: "sch-jy-1",
        trainName: "Taksaka",
        trainCode: "KA 68",
        category: "Intercity",
        availableSeats: 42,
        originCode: "GMR",
        originName: "Gambir",
        originCity: "Jakarta",
        originTime: "09:20 WIB",
        destCode: "YK",
        destName: "Yogyakarta / Tugu",
        destCity: "Yogyakarta",
        destTime: "15:30 WIB",
        duration: "6j 10m",
        classType: "Eksekutif",
        price: 380000
    },
    {
        id: "sch-jy-2",
        trainName: "Argo Lawu",
        trainCode: "KA 8",
        category: "Intercity",
        availableSeats: 12,
        originCode: "GMR",
        originName: "Gambir",
        originCity: "Jakarta",
        originTime: "20:45 WIB",
        destCode: "YK",
        destName: "Yogyakarta / Tugu",
        destCity: "Yogyakarta",
        destTime: "02:50 WIB",
        duration: "6j 05m",
        classType: "Eksekutif Luxury",
        price: 520000
    },
    {
        id: "sch-jy-3",
        trainName: "Progo",
        trainCode: "KA 248",
        category: "Intercity",
        availableSeats: 60,
        originCode: "PSE",
        originName: "Pasar Senen",
        originCity: "Jakarta",
        originTime: "22:30 WIB",
        destCode: "LPN",
        destName: "Lempuyangan",
        destCity: "Yogyakarta",
        destTime: "05:40 WIB",
        duration: "7j 10m",
        classType: "Ekonomi",
        price: 180000
    },
    {
        id: "sch-jy-4",
        trainName: "Taksaka",
        trainCode: "KA 67",
        category: "Intercity",
        availableSeats: 35,
        originCode: "YK",
        originName: "Yogyakarta / Tugu",
        originCity: "Yogyakarta",
        originTime: "08:45 WIB",
        destCode: "GMR",
        destName: "Gambir",
        destCity: "Jakarta",
        destTime: "14:55 WIB",
        duration: "6j 10m",
        classType: "Eksekutif",
        price: 380000
    },
    {
        id: "sch-jy-5",
        trainName: "Bogowonto",
        trainCode: "KA 137",
        category: "Intercity",
        availableSeats: 25,
        originCode: "LPN",
        originName: "Lempuyangan",
        originCity: "Yogyakarta",
        originTime: "09:50 WIB",
        destCode: "PSE",
        destName: "Pasar Senen",
        destCity: "Jakarta",
        destTime: "17:10 WIB",
        duration: "7j 20m",
        classType: "Eksekutif & Ekonomi",
        price: 270000
    },

    // --- JAKARTA <-> SURABAYA ---
    {
        id: "sch-js-1",
        trainName: "Argo Bromo Anggrek",
        trainCode: "KA 2",
        category: "Intercity",
        availableSeats: 18,
        originCode: "GMR",
        originName: "Gambir",
        originCity: "Jakarta",
        originTime: "08:20 WIB",
        destCode: "SBI",
        destName: "Surabaya Pasarturi",
        destCity: "Surabaya",
        destTime: "16:30 WIB",
        duration: "8j 10m",
        classType: "Eksekutif Luxury",
        price: 650000
    },
    {
        id: "sch-js-2",
        trainName: "Gaya Baru Malam Selatan",
        trainCode: "KA 106",
        category: "Intercity",
        availableSeats: 40,
        originCode: "PSE",
        originName: "Pasar Senen",
        originCity: "Jakarta",
        originTime: "11:00 WIB",
        destCode: "SGU",
        destName: "Surabaya Gubeng",
        destCity: "Surabaya",
        destTime: "22:40 WIB",
        duration: "11j 40m",
        classType: "Eksekutif & Ekonomi",
        price: 310000
    },
    {
        id: "sch-js-3",
        trainName: "Sembrani",
        trainCode: "KA 62",
        category: "Intercity",
        availableSeats: 22,
        originCode: "GMR",
        originName: "Gambir",
        originCity: "Jakarta",
        originTime: "19:30 WIB",
        destCode: "SBI",
        destName: "Surabaya Pasarturi",
        destCity: "Surabaya",
        destTime: "04:00 WIB",
        duration: "8j 30m",
        classType: "Eksekutif",
        price: 520000
    },
    {
        id: "sch-js-4",
        trainName: "Argo Bromo Anggrek",
        trainCode: "KA 1",
        category: "Intercity",
        availableSeats: 15,
        originCode: "SBI",
        originName: "Surabaya Pasarturi",
        originCity: "Surabaya",
        originTime: "09:10 WIB",
        destCode: "GMR",
        destName: "Gambir",
        destCity: "Jakarta",
        destTime: "17:20 WIB",
        duration: "8j 10m",
        classType: "Eksekutif",
        price: 650000
    },

    // --- JAKARTA <-> SEMARANG ---
    {
        id: "sch-jsm-1",
        trainName: "Argo Muria",
        trainCode: "KA 14",
        category: "Intercity",
        availableSeats: 30,
        originCode: "GMR",
        originName: "Gambir",
        originCity: "Jakarta",
        originTime: "07:00 WIB",
        destCode: "SMT",
        destName: "Semarang Tawang",
        destCity: "Semarang",
        destTime: "12:10 WIB",
        duration: "5j 10m",
        classType: "Eksekutif",
        price: 340000
    },
    {
        id: "sch-jsm-2",
        trainName: "Matarmaja",
        trainCode: "KA 234",
        category: "Intercity",
        availableSeats: 55,
        originCode: "PSE",
        originName: "Pasar Senen",
        originCity: "Jakarta",
        originTime: "10:30 WIB",
        destCode: "SMC",
        destName: "Semarang Poncol",
        destCity: "Semarang",
        destTime: "17:15 WIB",
        duration: "6j 45m",
        classType: "Ekonomi",
        price: 150000
    },
    {
        id: "sch-jsm-3",
        trainName: "Argo Sindoro",
        trainCode: "KA 11",
        category: "Intercity",
        availableSeats: 26,
        originCode: "SMT",
        originName: "Semarang Tawang",
        originCity: "Semarang",
        originTime: "06:15 WIB",
        destCode: "GMR",
        destName: "Gambir",
        destCity: "Jakarta",
        destTime: "11:25 WIB",
        duration: "5j 10m",
        classType: "Eksekutif",
        price: 340000
    },

    // --- BANDUNG <-> YOGYAKARTA ---
    {
        id: "sch-by-1",
        trainName: "Argo Wilis",
        trainCode: "KA 6",
        category: "Intercity",
        availableSeats: 14,
        originCode: "BD",
        originName: "Bandung",
        originCity: "Bandung",
        originTime: "07:40 WIB",
        destCode: "YK",
        destName: "Yogyakarta / Tugu",
        destCity: "Yogyakarta",
        destTime: "14:15 WIB",
        duration: "6j 35m",
        classType: "Eksekutif",
        price: 330000
    },
    {
        id: "sch-by-2",
        trainName: "Lodaya",
        trainCode: "KA 92",
        category: "Intercity",
        availableSeats: 38,
        originCode: "BD",
        originName: "Bandung",
        originCity: "Bandung",
        originTime: "06:55 WIB",
        destCode: "YK",
        destName: "Yogyakarta / Tugu",
        destCity: "Yogyakarta",
        destTime: "13:40 WIB",
        duration: "6j 45m",
        classType: "Eksekutif & Ekonomi",
        price: 240000
    },
    {
        id: "sch-by-3",
        trainName: "Kahuripan",
        trainCode: "KA 238",
        category: "Intercity",
        availableSeats: 50,
        originCode: "KAC",
        originName: "Kiaracondong",
        originCity: "Bandung",
        originTime: "22:40 WIB",
        destCode: "LPN",
        destName: "Lempuyangan",
        destCity: "Yogyakarta",
        destTime: "05:20 WIB",
        duration: "6j 40m",
        classType: "Ekonomi",
        price: 80000
    },

    // --- BANDUNG <-> SURABAYA ---
    {
        id: "sch-bs-1",
        trainName: "Turangga",
        trainCode: "KA 66",
        category: "Intercity",
        availableSeats: 25,
        originCode: "BD",
        originName: "Bandung",
        originCity: "Bandung",
        originTime: "18:10 WIB",
        destCode: "SGU",
        destName: "Surabaya Gubeng",
        destCity: "Surabaya",
        destTime: "04:20 WIB",
        duration: "10j 10m",
        classType: "Eksekutif",
        price: 460000
    },
    {
        id: "sch-bs-2",
        trainName: "Pasundan",
        trainCode: "KA 240",
        category: "Intercity",
        availableSeats: 44,
        originCode: "KAC",
        originName: "Kiaracondong",
        originCity: "Bandung",
        originTime: "10:15 WIB",
        destCode: "SGU",
        destName: "Surabaya Gubeng",
        destCity: "Surabaya",
        destTime: "21:35 WIB",
        duration: "11j 20m",
        classType: "Ekonomi",
        price: 190000
    },

    // --- BANDUNG <-> SEMARANG ---
    {
        id: "sch-bsm-1",
        trainName: "Harina",
        trainCode: "KA 126",
        category: "Intercity",
        availableSeats: 32,
        originCode: "BD",
        originName: "Bandung",
        originCity: "Bandung",
        originTime: "20:25 WIB",
        destCode: "SMT",
        destName: "Semarang Tawang",
        destCity: "Semarang",
        destTime: "03:45 WIB",
        duration: "7j 20m",
        classType: "Eksekutif & Ekonomi",
        price: 290000
    },

    // --- YOGYAKARTA <-> SURABAYA ---
    {
        id: "sch-ys-1",
        trainName: "Sancaka",
        trainCode: "KA 96",
        category: "Intercity",
        availableSeats: 45,
        originCode: "YK",
        originName: "Yogyakarta / Tugu",
        originCity: "Yogyakarta",
        originTime: "06:45 WIB",
        destCode: "SGU",
        destName: "Surabaya Gubeng",
        destCity: "Surabaya",
        destTime: "10:45 WIB",
        duration: "4j 00m",
        classType: "Eksekutif",
        price: 230000
    },
    {
        id: "sch-ys-2",
        trainName: "Sri Tanjung",
        trainCode: "KA 242",
        category: "Intercity",
        availableSeats: 52,
        originCode: "LPN",
        originName: "Lempuyangan",
        originCity: "Yogyakarta",
        originTime: "07:00 WIB",
        destCode: "SGU",
        destName: "Surabaya Gubeng",
        destCity: "Surabaya",
        destTime: "12:40 WIB",
        duration: "5j 40m",
        classType: "Ekonomi",
        price: 88000
    },

    // --- SEMARANG <-> SURABAYA ---
    {
        id: "sch-sms-1",
        trainName: "Ambarawa Ekspres",
        trainCode: "KA 230",
        category: "Intercity",
        availableSeats: 65,
        originCode: "SMC",
        originName: "Semarang Poncol",
        originCity: "Semarang",
        originTime: "08:40 WIB",
        destCode: "SBI",
        destName: "Surabaya Pasarturi",
        destCity: "Surabaya",
        destTime: "13:05 WIB",
        duration: "4j 25m",
        classType: "Ekonomi Premium",
        price: 95000
    },

    // --- NON-INTERCITY MODES (Local, Commuter, LRT, Whoosh, Airport) ---
    // 1. LOCAL (Surabaya <-> Malang 5 stations each)
    {
        id: "sch-loc-1",
        trainName: "Commuter Line Penataran (Lokal)",
        trainCode: "KA 431",
        category: "Local",
        availableSeats: 40,
        originCode: "SGU",
        originName: "Surabaya Gubeng",
        originCity: "Surabaya",
        originTime: "07:30 WIB",
        destCode: "ML",
        destName: "Malang",
        destCity: "Malang",
        destTime: "09:45 WIB",
        duration: "2j 15m",
        classType: "Lokal Ekonomi",
        price: 12000
    },
    {
        id: "sch-loc-2",
        trainName: "Commuter Line Tumapel (Lokal)",
        trainCode: "KA 435",
        category: "Local",
        availableSeats: 55,
        originCode: "SBI",
        originName: "Surabaya Pasarturi",
        originCity: "Surabaya",
        originTime: "11:15 WIB",
        destCode: "KPN",
        destName: "Kepanjen",
        destCity: "Malang",
        destTime: "13:40 WIB",
        duration: "2j 25m",
        classType: "Lokal Ekonomi",
        price: 15000
    },
    {
        id: "sch-loc-3",
        trainName: "Commuter Line Penataran (Lokal)",
        trainCode: "KA 432",
        category: "Local",
        availableSeats: 48,
        originCode: "ML",
        originName: "Malang",
        originCity: "Malang",
        originTime: "14:20 WIB",
        destCode: "SGU",
        destName: "Surabaya Gubeng",
        destCity: "Surabaya",
        destTime: "16:35 WIB",
        duration: "2j 15m",
        classType: "Lokal Ekonomi",
        price: 12000
    },
    {
        id: "sch-loc-4",
        trainName: "Commuter Line Arjuno (Lokal)",
        trainCode: "KA 438",
        category: "Local",
        availableSeats: 60,
        originCode: "LW",
        originName: "Lawang",
        originCity: "Malang",
        originTime: "17:00 WIB",
        destCode: "WO",
        destName: "Wonokromo",
        destCity: "Surabaya",
        destTime: "18:50 WIB",
        duration: "1j 50m",
        classType: "Lokal Ekonomi",
        price: 10000
    },

    // 2. COMMUTER LINE JAWATIMUR (Penataran & Dhoho loop - Surabaya to Blitar via Malang/Kertosono)
    {
        id: "sch-clj-1",
        trainName: "Commuter Line Penataran",
        trainCode: "KA 421",
        category: "Commuter",
        availableSeats: 65,
        originCode: "SGU",
        originName: "Surabaya Gubeng",
        originCity: "Surabaya",
        originTime: "05:00 WIB",
        destCode: "BL",
        destName: "Blitar",
        destCity: "Blitar",
        destTime: "10:15 WIB",
        duration: "5j 15m",
        classType: "Commuter Line Jatim",
        price: 18000
    },
    {
        id: "sch-clj-2",
        trainName: "Commuter Line Dhoho",
        trainCode: "KA 423",
        category: "Commuter",
        availableSeats: 70,
        originCode: "SGU",
        originName: "Surabaya Gubeng",
        originCity: "Surabaya",
        originTime: "09:30 WIB",
        destCode: "KTS",
        destName: "Kertosono",
        destCity: "Nganjuk",
        destTime: "12:15 WIB",
        duration: "2j 45m",
        classType: "Commuter Line Jatim",
        price: 15000
    },
    {
        id: "sch-clj-3",
        trainName: "Commuter Line Dhoho",
        trainCode: "KA 425",
        category: "Commuter",
        availableSeats: 50,
        originCode: "BL",
        originName: "Blitar",
        originCity: "Blitar",
        originTime: "13:00 WIB",
        destCode: "SGU",
        destName: "Surabaya Gubeng",
        destCity: "Surabaya",
        destTime: "18:30 WIB",
        duration: "5j 30m",
        classType: "Commuter Line Jatim",
        price: 18000
    },

    // 3. LRT JABODEBEK (Jakarta)
    {
        id: "sch-lrt-1",
        trainName: "LRT Jabodebek Line Harjamukti",
        trainCode: "LRT 01",
        category: "LRT",
        availableSeats: 120,
        originCode: "DKA",
        originName: "Dukuh Atas LRT",
        originCity: "Jakarta",
        originTime: "08:15 WIB",
        destCode: "HJM",
        destName: "Harjamukti LRT",
        destCity: "Depok",
        destTime: "09:05 WIB",
        duration: "50m",
        classType: "LRT Standard",
        price: 10000
    },
    {
        id: "sch-lrt-2",
        trainName: "LRT Jabodebek Line Jati Mulya",
        trainCode: "LRT 05",
        category: "LRT",
        availableSeats: 110,
        originCode: "DKA",
        originName: "Dukuh Atas LRT",
        originCity: "Jakarta",
        originTime: "12:30 WIB",
        destCode: "JTM",
        destName: "Jati Mulya LRT",
        destCity: "Bekasi",
        destTime: "13:25 WIB",
        duration: "55m",
        classType: "LRT Standard",
        price: 12000
    },

    // 4. WHOOSH (Jakarta <-> Bandung)
    {
        id: "sch-wh-1",
        trainName: "Whoosh Fast Train",
        trainCode: "G1001",
        category: "Whoosh",
        availableSeats: 88,
        originCode: "HLM",
        originName: "Halim (Whoosh)",
        originCity: "Jakarta",
        originTime: "08:00 WIB",
        destCode: "PAD",
        destName: "Padalarang (Whoosh)",
        destCity: "Bandung",
        destTime: "08:30 WIB",
        duration: "30m",
        classType: "Premium Economy",
        price: 225000
    },
    {
        id: "sch-wh-2",
        trainName: "Whoosh Fast Train",
        trainCode: "G1003",
        category: "Whoosh",
        availableSeats: 75,
        originCode: "HLM",
        originName: "Halim (Whoosh)",
        originCity: "Jakarta",
        originTime: "10:15 WIB",
        destCode: "TGL",
        destName: "Tegalluar (Whoosh)",
        destCity: "Bandung",
        destTime: "11:00 WIB",
        duration: "45m",
        classType: "Business Class",
        price: 350000
    },
    {
        id: "sch-wh-3",
        trainName: "Whoosh Fast Train",
        trainCode: "G1002",
        category: "Whoosh",
        availableSeats: 90,
        originCode: "PAD",
        originName: "Padalarang (Whoosh)",
        originCity: "Bandung",
        originTime: "14:00 WIB",
        destCode: "HLM",
        destName: "Halim (Whoosh)",
        destCity: "Jakarta",
        destTime: "14:30 WIB",
        duration: "30m",
        classType: "Premium Economy",
        price: 225000
    },

    // 5. AIRPORT (KA Bandara Jakarta & Jogja)
    {
        id: "sch-ap-1",
        trainName: "KA Bandara Soekarno-Hatta",
        trainCode: "A12",
        category: "Airport",
        availableSeats: 50,
        originCode: "BST",
        originName: "BNI City",
        originCity: "Jakarta",
        originTime: "10:15 WIB",
        destCode: "BSTH",
        destName: "Bandara Soekarno-Hatta",
        destCity: "Jakarta",
        destTime: "11:00 WIB",
        duration: "45m",
        classType: "Eksekutif Bandara",
        price: 50000
    },
    {
        id: "sch-ap-2",
        trainName: "KA Bandara YIA Yogyakarta",
        trainCode: "YIA08",
        category: "Airport",
        availableSeats: 60,
        originCode: "YK",
        originName: "Yogyakarta / Tugu",
        originCity: "Yogyakarta",
        originTime: "06:30 WIB",
        destCode: "YIA",
        destName: "Bandara YIA",
        destCity: "Yogyakarta",
        destTime: "07:09 WIB",
        duration: "39m",
        classType: "Eksekutif Bandara",
        price: 20000
    }
];

// Popular Destinations Dataset (Top Destinations)
const POPULAR_DESTINATIONS_DATA = [
    {
        code: "BD",
        cityName: "Bandung",
        image: "assets/bandung.jpg"
    },
    {
        code: "YK",
        cityName: "Yogyakarta",
        image: "assets/jogjakarta.jpg"
    },
    {
        code: "SGU",
        cityName: "Surabaya",
        image: "assets/surabaya.jpg"
    },
    {
        code: "SMT",
        cityName: "Semarang",
        image: "assets/semarang.jpg"
    }
];

// Commuter Stations Dataset
const COMMUTER_STATIONS = [
    { id: "st-1", name: "Jakarta Kota", line: "Bogor Line", distanceKm: 0.0 },
    { id: "st-2", name: "Manggarai", line: "Bogor / Cikarang Line (Transit)", distanceKm: 9.8 },
    { id: "st-3", name: "Tebet", line: "Bogor Line", distanceKm: 12.4 },
    { id: "st-4", name: "Pancasila", line: "Bogor Line", distanceKm: 18.2 },
    { id: "st-5", name: "Depok", line: "Bogor Line", distanceKm: 33.1 },
    { id: "st-6", name: "Bogor", line: "Bogor Line", distanceKm: 54.8 },
    { id: "st-7", name: "Tanah Abang", line: "Cikarang Line (Transit)", distanceKm: 14.2 },
    { id: "st-8", name: "Bekasi", line: "Cikarang Line", distanceKm: 26.5 },
    { id: "st-9", name: "Cikarang", line: "Cikarang Line", distanceKm: 43.0 }
];

// Commuter Fare Calculation Function
function calculateCommuterFare(distanceKm) {
    if (distanceKm <= 25) return 3000;
    const extraKm = distanceKm - 25;
    const extraUnits = Math.ceil(extraKm / 10);
    return 3000 + (extraUnits * 1000);
}

// KAI Promotions Data
const PROMOTIONS_DATA = [
    {
        id: "promo-1",
        title: "Diskon 20% Tiket Intercity",
        discountTag: "Diskon 20%",
        trainMode: "Intercity",
        discountPercent: 20,
        trainModeIcon: "fa-train",
        bgGradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        code: "KAI20INTERCITY",
        validUntil: "30 September 2026",
        minTransaction: "Rp 50.000",
        minAmount: 50000,
        description: "Dapatkan potongan harga 20% hingga Rp 50.000 untuk seluruh pemesanan tiket Kereta Antarkota (Intercity).",
        terms: [
            "Berlaku untuk pemesanan melalui aplikasi Access by KAI.",
            "Berlaku untuk seluruh rute Kereta Api Antarkota di Pulau Jawa & Sumatra.",
            "Kuota terbatas setiap hari."
        ]
    },
    {
        id: "promo-2",
        title: "Diskon 30% Commuter Line",
        discountTag: "Diskon 30%",
        trainMode: "Commuter",
        discountPercent: 30,
        trainModeIcon: "fa-train-tram",
        bgGradient: "linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)",
        code: "KRLCOMMUTER30",
        validUntil: "15 Oktober 2026",
        minTransaction: "Tanpa Min. Transaksi",
        minAmount: 0,
        description: "Potongan harga 30% untuk pemesanan tiket Commuter Line Jawa Timur (Penataran/Dhoho).",
        terms: [
            "Berlaku khusus untuk pemesanan tiket Commuter Line.",
            "Maksimal diskon Rp 10.000 per transaksi.",
            "Berlaku untuk 3x transaksi per pengguna."
        ]
    },
    {
        id: "promo-3",
        title: "Promo Spesial Whoosh 25%",
        discountTag: "Diskon 25%",
        trainMode: "Whoosh",
        discountPercent: 25,
        trainModeIcon: "fa-bolt",
        bgGradient: "linear-gradient(135deg, #9f1239 0%, #e11d48 100%)",
        code: "WHOOSH25FAST",
        validUntil: "31 Oktober 2026",
        minTransaction: "Rp 100.000",
        minAmount: 100000,
        description: "Diskon 25% perjalanan Kereta Cepat Whoosh rute Halim - Padalarang - Tegalluar.",
        terms: [
            "Berlaku untuk tiket Premium Economy dan Business Class.",
            "Tidak dapat digabung dengan promo lain.",
            "Pembatalan mengikuti ketentuan tarif standar."
        ]
    },
    {
        id: "promo-4",
        title: "Hemat 15% Tiket KAI Bandara",
        discountTag: "Hemat 15%",
        trainMode: "Airport",
        discountPercent: 15,
        trainModeIcon: "fa-plane-departure",
        bgGradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
        code: "KAIBANDARA15",
        validUntil: "20 Oktober 2026",
        minTransaction: "Rp 20.000",
        minAmount: 20000,
        description: "Nikmati potongan harga 15% untuk tiket KA Bandara Soekarno-Hatta & YIA Yogyakarta.",
        terms: [
            "Berlaku untuk keberangkatan semua stasiun KA Bandara.",
            "Dapat digunakan untuk tiket pergi-pulang (PP)."
        ]
    },
    {
        id: "promo-5",
        title: "Diskon 20% Kereta Lokal Jatim",
        discountTag: "Diskon 20%",
        trainMode: "Local",
        discountPercent: 20,
        trainModeIcon: "fa-train-subway",
        bgGradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
        code: "LOCAL20JT",
        validUntil: "31 Oktober 2026",
        minTransaction: "Tanpa Min. Transaksi",
        minAmount: 0,
        description: "Diskon 20% khusus perjalanan Kereta Lokal daerah Surabaya dan Malang.",
        terms: [
            "Berlaku khusus stasiun di daerah Surabaya & Malang.",
            "Berlaku untuk seluruh rangkaian Kereta Lokal Jatim."
        ]
    },
    {
        id: "promo-6",
        title: "Hemat 15% Tiket LRT Jabodebek",
        discountTag: "Hemat 15%",
        trainMode: "LRT",
        discountPercent: 15,
        trainModeIcon: "fa-subway",
        bgGradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
        code: "LRTJABODEBEK15",
        validUntil: "15 November 2026",
        minTransaction: "Tanpa Min. Transaksi",
        minAmount: 0,
        description: "Potongan harga 15% untuk seluruh stasiun LRT Jabodebek.",
        terms: [
            "Khusus pemesanan tiket LRT Jabodebek.",
            "Dapat digunakan setiap hari."
        ]
    }
];

// KAI Information Dataset
const KAI_INFORMATION_DATA = [
    {
        id: "info-1",
        title: "BANTU KAMI TINGKATKAN PELAYANAN KAI",
        category: "Survei Pelayanan",
        date: "14 Sep 2026",
        image: "assets/cover.jpeg",
        summary: "Isi survei kepuasan pelanggan KAI untuk membantu kami meningkatkan kualitas fasilitas stasiun & pelayanan pelayanan kereta api.",
        content: `PT Kereta Api Indonesia (Persero) berkomitmen untuk terus meningkatkan kualitas fasilitas dan pelayanan di seluruh stasiun serta rangkaian kereta api. Berikan masukan dan saran Anda melalui survei resmi KAI Access untuk pengalaman perjalanan yang semakin nyaman dan aman.`
    },
    {
        id: "info-2",
        title: "Nikmati Berbagai Keuntungan Dengan Railpoin",
        category: "Loyalty Program",
        date: "10 Sep 2026",
        image: "assets/info_railpoin.jpg",
        summary: "Access to Our Exclusive Benefits - Nikmati berbagai keuntungan dengan bergabung dalam program loyalty di Access by KAI.",
        content: `Kumpulkan Railpoin dari setiap transaksi pembelian tiket kereta api antarkota maupun KRL Commuter. Poin yang Anda kumpulkan dapat ditukarkan dengan diskon tiket perjalanan berikutnya, voucher makanan RailFood, serta berbagai penawaran menarik dari partner merchant resmi KAI.`
    },
    {
        id: "info-3",
        title: "Layanan Contact Center KAI Melalui WA KAI121",
        category: "Layanan Bantuan",
        date: "05 Sep 2026",
        image: "assets/info_contact.jpg",
        summary: "Nomor Baru WhatsApp Contact Center KAI121 (0811-2223-3121) Melayani dengan Lebih Baik 24 Jam Setiap Hari.",
        content: `KAI menghadirkan nomor resmi baru WhatsApp Contact Center KAI121 di 0811-2223-3121 (bercentang biru) untuk membantu berbagai kebutuhan pelanggan seperti informasi tiket, pemesanan, pembatalan, laporan barang tertinggal, serta keluhan dan saran selama 24 jam nonstop.`
    }
];

const KAI_ARTICLES = KAI_INFORMATION_DATA;
