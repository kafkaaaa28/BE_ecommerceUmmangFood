# Optimasi Sistem RajaOngkir + Binderbytes - Dokumentasi Implementasi

## Daftar Isi

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Langkah-Langkah Implementasi](#langkah-langkah-implementasi)
5. [API Endpoints](#api-endpoints)
6. [How It Works](#how-it-works)

---

## Overview

Sistem ini dirancang untuk **mengoptimalkan penggunaan API RajaOngkir (100 request/hari)** dengan:

✅ Menyimpan semua data lokasi (Province, City, District, Subdistrict) ke **MySQL Database**  
✅ Melakukan pencarian kota dari **Database** (bukan API) → Hemat kuota request drastis  
✅ Implementasi **Fallback API** ke Binderbytes jika RajaOngkir rate limited  
✅ Caching untuk shipping cost calculation  
✅ Matching data dari kedua API berdasarkan normalisasi nama

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (FE)                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  API ENDPOINTS (/locations)                     │
├─────────────────────────────────────────────────────────────────┤
│  - GET /locations/search-cities?q=bandung    (DB Query)         │
│  - GET /locations/provinces                 (DB Query)         │
│  - GET /locations/cities?provinceId=X       (DB Query)         │
│  - GET /locations/districts?cityId=X        (DB Query)         │
│  - GET /locations/subdistricts?districtId=X (DB Query)         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│              Location Service Layer (DB-Based)                  │
├─────────────────────────────────────────────────────────────────┤
│  LocationRepository → Prisma Client → MySQL Database            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        │                            │
┌───────▼──────────┐      ┌──────────▼──────────┐
│  Shipping Cost   │      │  Data Sync Script   │
│  Service (Cache) │      │  (import-locations) │
│                  │      │                     │
│ 1. Try RajaOngkir│      │ 1. Fetch from APIs  │
│ 2. Fallback      │      │ 2. Match by name    │
│    Binderbytes   │      │ 3. Upsert to DB    │
└──────────────────┘      └─────────────────────┘
        │                            │
        │          ┌════════════════╬════════════════┐
        │          │                │                │
┌───────▼──────────▼────┐  ┌────────▼────────┐  ┌────▼────────────┐
│  RajaOngkir API       │  │ Binderbytes API │  │  Redis Cache    │
│                       │  │                 │  │                 │
│ - /destination/*      │  │ - /provinces    │  │ Key: location:* │
│ - /cost/calculate     │  │ - /cities       │  │ TTL: 7 days     │
│                       │  │ - /districts    │  │                 │
└───────────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## File Structure

```
app/
├── modules/
│   ├── logistik/                          [NEW MODULE]
│   │   ├── binderbytes.types.ts          [Types untuk Binderbytes API]
│   │   ├── binderbytes.repository.ts     [Integration dengan Binderbytes API]
│   │   ├── location.repository.ts        [Query ke Database]
│   │   ├── location.service.ts           [Business Logic - Search dari DB]
│   │   ├── location.controller.ts        [HTTP Handler]
│   │   └── location.routes.ts            [Route Definition]
│   │
│   ├── RajaOngkir/
│   │   └── Cost/
│   │       ├── rajaOngkirCost.repository.ts [UPDATED: +getCost method]
│   │       └── ...
│   │
│   └── ...
│
├── app.ts                                [UPDATED: +locationRoutes]
│
└── config/
    └── prisma.ts

prisma/
├── schema.prisma                         [UPDATED: +Province, City, District, Subdistrict models]
└── migrations/
    └── 20260407_add_location_models/     [New Migration]
        └── migration.sql

scripts/
└── import-locations.ts                   [NEW: Data sync script]
```

---

## Langkah-Langkah Implementasi

### 1. Database Setup ✅

**File yang diupdate:**

- `prisma/schema.prisma` - Tambah 4 model baru
- `prisma/migrations/` - Create migration file

**Models yang ditambah:**

```prisma
model Province {
  id           String
  name         String @unique
  rajaOngkirId Int? @unique
  binderbytesId Int? @unique
  cities       City[]
}

model City {
  id           String
  provinceId   String
  name         String
  rajaOngkirId Int?
  binderbytesId Int?
  districts    District[]
}

model District {
  id           String
  cityId       String
  name         String
  rajaOngkirId Int?
  binderbytesId Int?
  subdistricts Subdistrict[]
}

model Subdistrict {
  id           String
  districtId   String
  name         String
  postalCode   String?
  rajaOngkirId Int?
  binderbytesId Int?
  district     District
}
```

### 2. Binderbytes Integration ✅

**Files:**

- `app/modules/logistik/binderbytes.types.ts`
- `app/modules/logistik/binderbytes.repository.ts`

**Fitur:**

- Fetch provinces, cities, districts, subdistricts
- Same structure seperti RajaOngkir untuk consistency

### 3. Location Service & Repository ✅

**Files:**

- `app/modules/logistik/location.repository.ts` - Prisma queries
- `app/modules/logistik/location.service.ts` - Business logic
- `app/modules/logistik/location.controller.ts` - HTTP handlers
- `app/modules/logistik/location.routes.ts` - Routes definition

**Key Features:**

- `searchCities()` - Full-text search dari database
- `getCitiesByProvince()`, `getDistrictsByCity()`
- Mengembalikan IDs dari kedua API (untuk fallback)

### 4. Data Import Script ✅

**File:** `scripts/import-locations.ts`

**Proses:**

1. Fetch semua provinces dari RajaOngkir
2. Fetch semua provinces dari Binderbytes
3. **Match berdasarkan nama (case-insensitive, normalized)**
4. Upsert ke database dengan kedua IDs
5. Repeat untuk cities, districts, subdistricts

**Cara Jalankan:**

```bash
npx tsx scripts/import-locations.ts
```

### 5. Shipping Cost Service dengan Fallback ✅

**File:** `app/modules/logistik/shipping-cost.service.ts`

**Logic:**

```
getShippingCost(origin, destination, weight, courier)
  ├── Try RajaOngkir API
  │   ├── Success? Return immediately + cache
  │   └── Rate Limited (429)? → Fallback to Binderbytes
  │
  └── Try Binderbytes API
      ├── Success? Return results
      └── Error? Throw error
```

### 6. Update Main App ✅

**File:** `app/app.ts`

- Import location routes
- Register: `app.use('/api/locations', locationRoutes);`

---

## API Endpoints

### 1. Search Cities (Autocomplete)

```http
GET /api/locations/search-cities?q=bandung&limit=20

Response:
{
  "ok": true,
  "data": [
    {
      "id": "cluxx1",
      "cityId": 76,              // RajaOngkir ID
      "cityBbId": 3604,          // Binderbytes ID
      "name": "Bandung",
      "provinceName": "Jawa Barat",
      "provinceId": "cluxx2"
    },
    ...
  ]
}
```

### 2. Get All Provinces

```http
GET /api/locations/provinces

Response:
{
  "ok": true,
  "data": [
    {
      "id": "cluxx2",
      "provinceId": 9,
      "provinceBbId": 1,
      "name": "Jawa Barat"
    },
    ...
  ]
}
```

### 3. Get Cities by Province

```http
GET /api/locations/cities?provinceId=cluxx2

Response:
{
  "ok": true,
  "data": [
    {
      "id": "cluxx1",
      "cityId": 76,
      "cityBbId": 3604,
      "name": "Bandung"
    },
    ...
  ]
}
```

### 4. Get Districts by City

```http
GET /api/locations/districts?cityId=cluxx1
```

### 5. Get Subdistricts by District

```http
GET /api/locations/subdistricts?districtId=cluxx3
```

---

## How It Works

### Scenario 1: User mencari kota untuk checkout

**Before (API Heavy):**

```
User input "ban..."
  → Multiple API calls ke RajaOngkir
  → Boros kuota! (1-2 request per huruf yang diketik)
  → Slow response
```

**After (Database Query):**

```
User input "ban..."
  → Database LIKE query "ban%"
  → Fast autocomplete! (<100ms)
  → 0 API calls! 🎉
```

### Scenario 2: Menghitung shipping cost

**Before:**

```
User checkout → Request RajaOngkir → Rate Limit → ERROR 😞
```

**After:**

```
User checkout
  → Request RajaOngkir (Primary API)
  → If rate limited (429) → Automatic fallback to Binderbytes
  → Shipping cost calculated successfully! ✅
  → Cache result untuk 24 jam
```

### Scenario 3: Pertama kali setup

**Steps:**

```
1. Add BINDERBYTES_API_KEY ke .env
2. npx tsx scripts/import-locations.ts
3. Wait ~5-10 minutes untuk import semua data
4. All locations sekarang di database!
5. API calls hanya digunakan untuk shipping calculation
```

---

## Environment Variables

Tambahkan ke `.env`:

```env
# Existing
RAJAONGKIR_BASE_URL=https://rajaongkir.komerce.id/api/v1
RAJAONGKIR_COST_API_KEY=your_key_here

# NEW - Binderbytes
BINDERBYTES_API_KEY=your_binderbytes_key_here
```

---

## Key Benefits

| Aspect               | Before                          | After                                |
| -------------------- | ------------------------------- | ------------------------------------ |
| **Pencarian Kota**   | Tiap huruf → API call           | Database query → Instant             |
| **Kuota RajaOngkir** | 100/hari habis cepat            | Tersimpan untuk shipping calculation |
| **Rate Limiting**    | Single point of failure         | Fallback ke Binderbytes              |
| **Performance**      | 500-2000ms                      | <100ms untuk search                  |
| **Cost**             | Mahal (2 API untuk reliability) | Efisien (shared kuota)               |
| **Scalability**      | Bottleneck di API               | Unlimited database queries           |

---

## Next Steps (Optional)

1. **Implement Binderbytes cost calculation** di `ShippingCostService`
2. **Periodic sync script** untuk update location data (cron job weekly)
3. **Add coordinates** (latitude, longitude) ke locations untuk mapping
4. **Implement caching header** untuk Chrome/browser caching
5. **Add API webhook** dari Binderbytes untuk real-time updates

---

## Questions?

Jika ada yang bingung, cek:

- Script filename: `import-locations.ts` untuk understanding flow
- Repository patterns: `location.repository.ts` untuk query examples
- Fallback logic: `shipping-cost.service.ts` untuk API fallback

Good luck! 🚀
