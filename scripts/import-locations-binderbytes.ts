/**
 * IMPORT SCRIPT: Sync semua lokasi dari Binderbytes ke MySQL Database
 *
 * Endpoint calls:
 * - getProvinces → 1 request
 * - getCities(provinceId) → 34 request
 * - getDistricts(cityId) → 514 request
 * - getSubdistricts(districtId) → 7.000 request
 *
 * Total ±7.500 request → masih aman di 50.000/hari limit Binderbytes
 *
 * Jalankan dengan: npx tsx scripts/import-locations-binderbytes.ts
 */

import 'dotenv/config';
import { prisma } from '../app/config/prisma.js';
import { BinderbytesRepository } from '../app/modules/address/binderbytes/binderbytes.repository.js';

/* ======================
   UTIL
====================== */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let requestCount = 0;

async function safe<T>(fn: () => Promise<T>, label: string, throwError: boolean = true): Promise<T | null> {
  try {
    requestCount++;
    console.log(`🌐 API CALL #${requestCount} → ${label}`);

    await delay(300); // 300ms delay untuk hindari rate limit
    return await fn();
  } catch (err: any) {
    const errorMsg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error(`❌ ERROR ${label}:`, errorMsg);

    if (throwError) {
      throw err;
    }

    // Graceful fallback - return null jika throwError=false
    console.warn(`⚠️  ${label} error - akan skip untuk sekarang`);
    return null;
  }
}

/* ======================
   MAIN
====================== */
// ... bagian atas sama seperti skripmu

/* ======================
   MAIN
===================== */
async function run() {
  console.log('🚀 IMPORT LOCATIONS FROM BINDERBYTES\n');
  const bb = new BinderbytesRepository();

  try {
    const existingCities = await prisma.city.count();
    if (existingCities > 0) {
      console.log('⚠️  Data city sudah ada, import dibatalkan!');
      return;
    }

    /* 1. PROVINCES */
    const provinces = await safe(() => bb.getProvinces(), 'BB Provinces', false);
    if (!provinces || provinces.length === 0) throw new Error('Gagal fetch provinces dari Binderbytes API');

    for (const p of provinces) {
      await prisma.province.upsert({
        where: { id_provinsi: String(p.id) },
        create: { name: p.name, id_provinsi: String(p.id) },
        update: { name: p.name },
      });
    }

    console.log(`✅ Imported ${provinces.length} provinces\n`);

    /* 2. CITIES, DISTRICTS, SUBDISTRICTS */
    const dbProvinces = await prisma.province.findMany();
    let totalCities = 0,
      totalDistricts = 0,
      totalSubdistricts = 0;

    for (const province of dbProvinces) {
      console.log(`🏙️  ${province.name}`);
      const cities = await safe(() => bb.getCities(province.id_provinsi), `BB Cities (${province.name})`, false);
      if (!cities || cities.length === 0) continue;

      // Cities upsert
      const cityData = cities.map((city) => ({
        id_kabupaten: String(city.id),
        name: city.name,
        id_provinsi: String(city.id_provinsi),
      }));
      for (const c of cityData) {
        await prisma.city.upsert({
          where: { id_kabupaten: c.id_kabupaten },
          create: c,
          update: { name: c.name, id_provinsi: c.id_provinsi },
        });
        totalCities++;
      }

      // Districts per city
      for (const city of cityData) {
        const districts = await safe(() => bb.getDistricts(city.id_kabupaten), `BB Districts (${city.name})`, false);
        if (!districts || districts.length === 0) continue;

        // Batch insert districts
        const districtData = districts.map((d) => ({
          id_kecamatan: String(d.id),
          name: d.name,
          id_kabupaten: city.id_kabupaten,
        }));
        await prisma.district.createMany({ data: districtData, skipDuplicates: true });
        totalDistricts += districtData.length;

        // Subdistricts per district
        for (const d of districtData) {
          const subdistricts = await safe(() => bb.getSubdistricts(d.id_kecamatan), `BB Subdistricts (${d.name})`, false);
          if (!subdistricts || subdistricts.length === 0) continue;

          const subdistrictData = subdistricts.map((sd) => ({
            id_kelurahan: String(sd.id),
            name: sd.name,
            id_kecamatan: d.id_kecamatan,
          }));
          await prisma.subdistrict.createMany({ data: subdistrictData, skipDuplicates: true });
          totalSubdistricts += subdistrictData.length;
        }
      }

      console.log(`   ✔ ${cities.length} cities with districts & subdistricts`);
    }

    console.log(`\n🎉 IMPORT COMPLETED!`);
    console.log(`   - Provinces: ${provinces.length}`);
    console.log(`   - Cities: ${totalCities}`);
    console.log(`   - Districts: ${totalDistricts}`);
    console.log(`   - Subdistricts: ${totalSubdistricts}`);
    console.log(`🌐 API Calls Used: ${requestCount} / 50.000`);
  } catch (err) {
    console.error('❌ FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
