import handlebars from 'express-handlebars';
import { fileURLToPath } from 'url';
import path from 'path';
import { notEqual } from 'assert';


// Derive the equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbs = handlebars.create({
  extname: '.html',
  defaultLayout: 'main', // Default layout
  layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
  partialsDir: path.join(__dirname, '..', 'views', 'partials'),
  helpers: {
    truncate: (text, wordCount) => {
      if (typeof text !== 'string') return '';
      const words = text.split(' ');
      return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
    },
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    range: (start, end) => {
      let result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },
    eq: (a, b) => a === b,
    notEqual: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    hasRoleByName: function (roles, roleName, options) {
      if (roles && roles.some(role => role.role_name === roleName)) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
    has: function(set, value) {
      return set.has(value);
    }}
});



export default hbs;