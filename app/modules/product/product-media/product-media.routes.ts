import { Router } from 'express';
import { createProductMedia, deleteProductMedia, getProductMediaById, listProductMediaByProductId, updateProductMedia, uploadProductMedia } from './product-media.controller.js';
import { productMediaUpload } from '../../../middleware/product-media.upload.js';

const productMediaRoutes = Router();
const productNestedMediaRoutes = Router({ mergeParams: true });

productMediaRoutes.get('/:mediaId', getProductMediaById);
productMediaRoutes.put('/:mediaId', updateProductMedia);
productMediaRoutes.delete('/:mediaId', deleteProductMedia);

productNestedMediaRoutes.post('/upload', productMediaUpload.single('file'), uploadProductMedia);
productNestedMediaRoutes.post('/', createProductMedia);
productNestedMediaRoutes.get('/', listProductMediaByProductId);

export { productMediaRoutes, productNestedMediaRoutes };
export default productMediaRoutes;
