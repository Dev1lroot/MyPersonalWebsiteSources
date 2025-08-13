const fs = require('fs');
const path = require('path');

module.exports = () => {
  const articlesDir = path.join(__dirname, 'articles');
  const files = fs.readdirSync(articlesDir);

  let articlesHtml = {};

  files.forEach(file => {
    if (file.endsWith('.html')) {
      const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
      articlesHtml[file] = content;
    }
  });

  return articlesHtml;
};