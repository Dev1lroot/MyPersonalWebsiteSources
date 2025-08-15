
const { getArticle, hasArticle } = require("./source/code/articles.js");

const projects = require("./source/_data/projects.json");
const languages = require("./source/_data/languages.json");
const articles = require("./source/_data/articles.json");

const processedArticles = [];
for (let l of languages) {
  for (let a of articles) {
    if(a.url.hasOwnProperty(l.code))
    {
      processedArticles.push({
        language: l,
        article: a
      });
    }
  }
}
const processedProjects = [];
for (let l of languages) {
  for (let p of projects) {
    processedProjects.push({
      language: l,
      project: p
    });
  }
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addNunjucksFilter("getArticle", getArticle);
  eleventyConfig.addNunjucksFilter("hasArticle", hasArticle);
  eleventyConfig.addPassthroughCopy("apps");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy("downloads");
  eleventyConfig.addCollection("processedProjects", function() {
    return processedProjects;
  });
  eleventyConfig.addCollection("processedArticles", function() {
    return processedArticles;
  })
  eleventyConfig.addNunjucksFilter("includes", function(haystack, needle) {
    if (typeof haystack !== "string") return false;
    return haystack.includes(needle);
  });
  return {
    dir: {
      input: "source", 
      includes: "layouts",  
      output: "build" 
    },
    templateFormats: ["njk", "html", "md", "11ty.js", "xml.njk"]
  };
};