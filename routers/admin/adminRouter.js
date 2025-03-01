import { Router } from 'express';
import upload from '../../config/multer.js';
import setSection from "../../middlewares/uploadLocation.js";


import { adminAuthMiddleware } from '../../middlewares/authMiddleware.js';
import {renderloginAdmin, loginAdmin} from '../../controllers/authController.js'
import {renderAdminDashboard} from '../../controllers/admin/rootController.js';
import  * as user from '../../controllers/admin/userController.js';
import * as role from '../../controllers/admin/roleController.js';
import * as product from "../../controllers/admin/productController.js";
import * as collection from '../../controllers/admin/collectionController.js';
import * as category from '../../controllers/admin/categoryController.js';
import * as size from '../../controllers/admin/sizeController.js';
import * as color from '../../controllers/admin/colorController.js';
import * as scurb from '../../controllers/admin/scurbsController.js';

import * as order from '../../controllers/admin/orderController.js';


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
//ROOT ADMIN ROUTER //
//////////////////////
//////////////////////
router.get('/', renderAdminDashboard)


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
    .post(upload.array('images', 5), product.createProduct);

router.get('/product/create', product.renderCreateProductForm);


router.route('/product/:id')
    .get(product.getProductById)
    .put(upload.array('images', 5), product.updateProduct
    )
    .delete(product.deleteProduct);

router.post('/upload/:productId', upload.array('images', 5), product.uploadImages);
router.delete('/product/delete-image/:id', product.deleteImage)


//////////////////////
//////////////////////
/// CATEGORY ROUTER //
//////////////////////
//////////////////////
router.route('/category')
    .get(category.getAllCategories)
    .post(category.createCategoryController);
router.get('/category/create', category.renderCategoryForm);

router.route('/collection')
    .get(collection.getAllCollections)
    .post(collection.createCollectionController);
router.get('/collection/create', collection.renderCollectionForm);

//COLOR ROUTE
router.route('/color')
    .get(color.getAllColors)
    .post(setSection('product_color'), upload.fields([
        {name: 'image_url', maxCount:1}
    ]),color.createColorController);

router.get('/color/create', color.renderColorForm);

router.route('/color/:id')
    .get(color.renderColorUpdateForm)
    .put(setSection('product_color'), upload.fields([
        {name: 'image_url', maxCount:1}
    ]),color.updateColor)
    .delete(color.deleteColor);
    

router.route('/size')
    .get(size.getAllSize)
    .post(size.createSizeController);
router.get('/size/create', size.renderSizeForm);

router.route('/scurb')
    .get(scurb.getAllScurbs)
    .post(scurb.createScrubController);
router.get('/scurb/create', scurb.renderScurbForm);

//////////////////////
//////////////////////
/// ORDER ROUTER /////
//////////////////////
//////////////////////
router.route('/order')
    .get(order.getAllOrders);
    //.post(createOrder);

router.route('/order/:id')
    .get(order.getOrderById)
    .put(order.updateOrder)
    .delete(order.deleteOrder);
/*

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
