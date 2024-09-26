
// middlewares/removeTrailingSlash.js
const removeTrailingSlash = (req, res, next) => {
    // Ignore paths that are allowed to have trailing slashes
    const allowTrailingSlash = [
      '/admin/', '/admin/cart/', '/admin/user/', '/admin/role/',
      '/admin/product/', '/admin/order/',
    ];
  
    if (req.path !== '/' && req.path.endsWith('/') && !allowTrailingSlash.includes(req.path)) {
      const query = req.url.slice(req.path.length);
      res.redirect(301, req.path.slice(0, -1) + query);
    } else {
      next();
    }
};
  
export default removeTrailingSlash;
