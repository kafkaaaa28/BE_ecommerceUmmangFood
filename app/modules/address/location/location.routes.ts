import { Router } from 'express';
import { searchCitiesHandler, getProvincesHandler, getCitiesByProvinceHandler, getDistrictsByCityHandler, getSubdistrictsByDistrictHandler } from '../../address/location/location.controller.js';

const router = Router();

/**
 * Public endpoints untuk lokasi (tidak memerlukan auth)
 */

// Search cities by keyword
router.get('/search-cities', searchCitiesHandler);

// Get all provinces
router.get('/provinces', getProvincesHandler);

// Get cities by province
router.get('/cities', getCitiesByProvinceHandler);

// Get districts by city
router.get('/districts', getDistrictsByCityHandler);

// Get subdistricts by district
router.get('/subdistricts', getSubdistrictsByDistrictHandler);

export default router;
