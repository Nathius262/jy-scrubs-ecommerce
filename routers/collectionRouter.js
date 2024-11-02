import * as collectionController from '../controllers/collectionController.js'
import { Router } from 'express'

const router = Router()

router.get('/', collectionController.getAllProducts);
router.get('/:category/:slug', collectionController.getFilteredProductsBySlug);

export default router