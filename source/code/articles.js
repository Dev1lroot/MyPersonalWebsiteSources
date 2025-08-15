const fs = require('fs');
const path = require('path');

function hasArticle(language, article) {
  const filePath = path.join(__dirname, '..', '_data', 'articles', language, `${article}.html`);
  return fs.existsSync(filePath);
}

function getArticle(language, article) {
  const localizedPath = path.join(__dirname,'..', '_data', 'articles', language, `${article}.html`);
  const fallbackPath = path.join(__dirname, '..', '_data', 'articles', 'en-GB', `${article}.html`);

  if (fs.existsSync(localizedPath)) {
    return fs.readFileSync(localizedPath, 'utf-8');
  } else if (fs.existsSync(fallbackPath)) {
    return fs.readFileSync(fallbackPath, 'utf-8');
  } else {
    return localizedPath;
  }
}

module.exports = { hasArticle, getArticle };
