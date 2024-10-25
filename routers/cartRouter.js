import express, { Router } from "express";
import {checkout} from '../controllers/cartController.js';


const router = Router();

router.get('/', checkout);

export default router;