import { Router } from 'express';
import { searchSubdistricts, createAddress, getAddressByUserId, updateAddress, deleteAddress } from './address.controller.js';
import { requireAccessToken } from '../../middleware/requireInternalToken.js';

const router = Router();
router.get('/search-subdistricts', requireAccessToken, searchSubdistricts);
router.post('/create', requireAccessToken, createAddress);
router.get('/user', requireAccessToken, getAddressByUserId);
router.put('/:addressId', requireAccessToken, updateAddress);
router.delete('/:addressId', requireAccessToken, deleteAddress);
export default router;
