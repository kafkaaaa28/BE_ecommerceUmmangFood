export interface CreateAddressInput {
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string | null;
  districtId: string | null;
  subdistrictId: string | null;

  label: string;
  recipientName: string;
  phone: string;
  provinceId: string | null;
  cityId: string | null;
  jalan: string;
  detail?: string | null;
}
export interface UpdateAddressInput {
  label?: string;
  recipientName?: string;
  phone?: string;
  jalan?: string;
  detail?: string | null;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  kodePos?: string | null;
  districtId?: string | null;
  subdistrictId?: string | null;
  provinceId?: string | null;
  cityId?: string | null;
}

export interface ResponseAddressByUserId {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  jalan: string;
  detail: string | null;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string | null;
  origin: string | null;
}
