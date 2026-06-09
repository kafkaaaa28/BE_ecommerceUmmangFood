import { Router } from 'express';
import { searchSubdistricts, createAddress, getAddressByUserId, updateAddress, deleteAddress, createAddressSeller, getAddressSeller } from './address.controller.js';
import { requireAccessToken, requireSeller } from '../../middleware/requireInternalToken.js';

const router = Router();
router.get('/search-subdistricts', requireAccessToken, searchSubdistricts);
router.post('/', requireAccessToken, createAddress);
router.get('/', requireAccessToken, getAddressByUserId);
router.put('/:addressId', requireAccessToken, updateAddress);
router.delete('/:addressId', requireAccessToken, deleteAddress);
router.post('/seller', requireAccessToken, requireSeller, createAddressSeller);
router.get('/seller', requireAccessToken, requireSeller, getAddressSeller);
export default router;
