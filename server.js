//main import
import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';


//custom import
import {internalServerError, pageNotFound} from './middlewares/errorHandler.js'
import staticFiles from "./config/staticFiles.js"
import hbs from "./config/settings.js"
import removeTrailingSlash  from './middlewares/normalizer.js';
import db from './models/index.cjs'
import { createRequire } from 'module';
const require = createRequire

import adminSeeder  from './seeders/admin-seeder.cjs'; 

//route import
import adminRouter from './routers/admin/adminRouter.js';
import rootRouter from './routers/rootRouter.js';
import productRouter from './routers/productRouter.js'
import collectionRouter from './routers/collectionRouter.js'
import cartRouter from './routers/cartRouter.js'
//import apiRouter from './routers/api/router.js';


dotenv.config()

// Derive the equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
app.use(removeTrailingSlash );

//settings
app.engine('html', hbs.engine);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON bodies
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//staticfiles
app.use(staticFiles);


app.use('/', rootRouter);
app.use('/admin/', adminRouter);
//app.use('/api/', apiRouter);
app.use('/product/', productRouter);
app.use('/collection/', collectionRouter);
app.use('/checkout', cartRouter);


//middlewares\
app.use(pageNotFound);
app.use(internalServerError);


async function initializeAdmin() {
  try {
    // Ensure admin user is seeded
    await adminSeeder.seedAdmin(db.sequelize.getQueryInterface(), db.Sequelize);
  } catch (error) {
    console.error('Error while initializing admin user:', error);
  }
}

// Sync database and run seeder if necessary
//initializeAdmin(); // Ensure the admin seeder runs

  // Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});