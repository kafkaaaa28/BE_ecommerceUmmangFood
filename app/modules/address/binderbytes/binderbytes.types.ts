export interface BinderbytesProvince {
  id: number;
  name: string;
  code?: string;
}

export interface BinderbytesCity {
  id: string | number;
  id_provinsi: string | number;
  name: string;
  type?: string;
}

export interface BinderbytesDistrict {
  id: string | number;
  id_kabupaten: string | number;
  name: string;
}

export interface BinderbytesSubdistrict {
  id: string | number;
  id_kecamatan: string | number;
  name: string;
  zip_code?: string;
}

export interface BinderbytesErrorResponse {
  success: boolean;
  message: string;
}
