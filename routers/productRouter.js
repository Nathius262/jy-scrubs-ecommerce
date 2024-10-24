import * as productController from '../controllers/productController.js'
import { Router } from 'express'

const router = Router()

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

export default router