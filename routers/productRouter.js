import * as productController from '../controllers/productController.js'
import { Router } from 'express'

const router = Router()

router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

export default router