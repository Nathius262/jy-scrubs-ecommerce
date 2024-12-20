import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';


// Derive the equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set Handlebars as the template engine with .html extension
const app = express();

// Serve static files (CSS, JS, images)
app.use('', express.static(path.join(__dirname, '..', 'public')));

//admin
app.use('/admin/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/user/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/role/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/product/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/scurb/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/size/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/color/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/category/', express.static(path.join(__dirname, '..', 'public')));
app.use('/admin/collection/', express.static(path.join(__dirname, '..', 'public')));

//main
app.use('/product/', express.static(path.join(__dirname, '..', 'public')));

//collections 
app.use('/collection/', express.static(path.join(__dirname, '..', 'public')));
app.use('/collection/scrub/', express.static(path.join(__dirname, '..', 'public')));
app.use('/collection/size/', express.static(path.join(__dirname, '..', 'public')));
app.use('/collection/color/', express.static(path.join(__dirname, '..', 'public')));
app.use('/collection/category/', express.static(path.join(__dirname, '..', 'public')));
app.use('/collection/collection/', express.static(path.join(__dirname, '..', 'public')));

//checkout
app.use('/checkout/', express.static(path.join(__dirname, '..', 'public')));



export default app;