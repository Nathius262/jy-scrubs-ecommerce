const fs = require('fs');
const path = require('path');

// Define directories to rename files in
const directories = ['models', 'migrations', 'seeders'];

directories.forEach((dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const filePath = path.join(dir, file);

      // Check if file has a .js extension
      if (path.extname(file) === '.js') {
        const newFilePath = filePath.replace('.js', '.cjs');

        // Rename the file
        fs.rename(filePath, newFilePath, (err) => {
          if (err) throw err;
          console.log(`Renamed: ${file} -> ${path.basename(newFilePath)}`);
        });
      }
    });
  });
});
