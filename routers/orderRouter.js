import express, { Router } from "express";
import {checkout, exchangeRate, verifyPaystackTransaction, trackOrder, trackOrderPage} from '../controllers/orderController.js';


const router = Router();

router.get('/api/convert-currency', exchangeRate);
router.get('/api/verify-payment', verifyPaystackTransaction);
router.get('/api/track-order', trackOrder);
router.get('/track-order', trackOrderPage);

router.get('/', checkout);

export default router;