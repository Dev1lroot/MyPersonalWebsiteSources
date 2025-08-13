import fg from 'fast-glob';
import { SitemapStream, streamToPromise } from 'sitemap';
import fs from 'fs';
import path from 'path';

const rootDir = './build'; 
const baseUrl = 'https://dev1lroot.com'; 

async function generateSitemap() {
 
  const files = await fg('**/*.html', { cwd: rootDir });

  const sitemap = new SitemapStream({ hostname: baseUrl });

 
  const writeStream = fs.createWriteStream(path.join(rootDir, '/sitemap.xml'));
  sitemap.pipe(writeStream);

 
  for (const file of files) {
    sitemap.write({ url: `/${file}` });
  }

  sitemap.end();

  await streamToPromise(sitemap);
  console.log('Sitemap generated at', path.join(rootDir, '/sitemap.xml'));
}

generateSitemap().catch(console.error);