import { Router } from 'express';
import upload from '../../config/multer.js';

import { adminAuthMiddleware } from '../../middlewares/authMiddleware.js';
import {renderloginAdmin, loginAdmin} from '../../controllers/authController.js'
import {renderAdminDashboard} from '../../controllers/admin/rootController.js';
import  * as user from '../../controllers/admin/userController.js';
import * as role from '../../controllers/admin/roleController.js';
import * as product from "../../controllers/admin/productController.js";


const router = Router()

//////////////////////
//////////////////////
//ROOT ADMIN ROUTER //
//////////////////////
//////////////////////
router.get('/', renderAdminDashboard)


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
    .get(user.getAllUsers)
    .post(user.createUser);

router.route('/user/:id')
    .get(user.getUserById)
    .put(user.updateUserById)
    .delete(user.deleteUser);

//////////////////////
//////////////////////
//// ROLE ROUTER /////
//////////////////////
//////////////////////

router.route('/role')
    .get(role.getAllRoles)
    .post(role.createRole);

router.get('/role/create', role.renderRoleForm);
    
router.route('/role/:id')
    .get(role.getRoleById)
    .put(role.updateRole)
    .delete(role.deleteRole);
//////////////////////
//////////////////////
//// PRODUCT ROUTER //
//////////////////////
//////////////////////

router.route('/product')
    .get(product.getAllProducts)
    .post(upload.fields([
            {name: 'images', maxCount:100}
        ]), product.createProduct
    );

router.get('/product/create', product.renderCreateProductForm);


router.route('/product/id')
    .get(product.getProductById)
    .put(upload.fields([
            {name: 'images', maxCount:100}
        ]), product.updateProduct
    )
    .delete(product.deleteProduct);
/*

//////////////////////
//////////////////////
/// CATEGORY ROUTER //
//////////////////////
//////////////////////
router.route('/category')
    .get(getAllCategories)
    .post(createCategory);


//////////////////////
//////////////////////
/// ORDER ROUTER /////
//////////////////////
//////////////////////
router.route('/order')
    .get(getAllOrders)
    .post(createOrder);


//////////////////////
//////////////////////
/// Cart ROUTER //////
//////////////////////
//////////////////////
router.route('/cart')
    .get(getAllCarts)
    .post(createCart);

*/
export default router;
