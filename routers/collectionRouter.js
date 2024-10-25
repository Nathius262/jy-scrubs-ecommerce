import * as collectionController from '../controllers/collectionController.js'
import { Router } from 'express'

const router = Router()

router.get('/', collectionController.getAllProducts);

export default router