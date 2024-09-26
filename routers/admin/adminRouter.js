import { Router } from 'express';

import { adminAuthMiddleware } from '../../middlewares/authMiddleware.js';

import {loginAdmin, renderloginAdmin} from '../../controllers/authController.js'

import {getUserById, getAllUsers, createUser, updateUser, deleteUser} from "../../controllers/admin/userController.js"
import {getAllRoles, getRoleById, createRole, updateRole, deleteRole} from "../../controllers/admin/roleController.js"
import {getProductById, createProduct, updateProduct, deleteProduct, getAllProducts} from '../../controllers/admin/productController.js'
import {getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory} from '../../controllers/admin/categoryController.js'
import {getAllCarts, getCartById, createCart, updateCart, deleteCart} from '../../controllers/admin/cartController.js'
import {getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder} from '../../controllers/admin/orderController.js'

const router = Router()

//////////////////////
//////////////////////
//// USER ROUTER /////
//////////////////////
//////////////////////

router.route('/login')
    .get(renderloginAdmin)
    .post(loginAdmin);

router.use(adminAuthMiddleware)


//////////////////////
//////////////////////
//// USER ROUTER /////
//////////////////////
//////////////////////

router.route('/user')
    .get(getAllUsers)
    .post(createUser);

router.route('/user/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

//////////////////////
//////////////////////
//// ROLE ROUTER /////
//////////////////////
//////////////////////
router.route('/role')
    .get(getAllRoles)
    .post(createRole);

router.route('/role/:id')
    .get(getRoleById)
    .put(updateRole)
    .delete(deleteRole);


//////////////////////
//////////////////////
//// PRODUCT ROUTER //
//////////////////////
//////////////////////

router.route('/product')
    .get(getAllProducts)
    .post(createProduct);

router.route('/product/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

//////////////////////
//////////////////////
/// CATEGORY ROUTER //
//////////////////////
//////////////////////
router.route('/category')
    .get(getAllCategories)
    .post(createCategory);

router.route('/category/:id')
    .get(getCategoryById)
    .put(updateCategory)
    .delete(deleteCategory);

//////////////////////
//////////////////////
/// ORDER ROUTER /////
//////////////////////
//////////////////////
router.route('/order')
    .get(getAllOrders)
    .post(createOrder);

router.route('/order/:id')
    .get(getOrderById)
    .put(updateOrder)
    .delete(deleteOrder);


//////////////////////
//////////////////////
/// Cart ROUTER //////
//////////////////////
//////////////////////
router.route('/cart')
    .get(getAllCarts)
    .post(createCart);

router.route('/cart/:id')
    .get(getCartById)
    .put(updateCart)
    .delete(deleteCart);


export default router;
