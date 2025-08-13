const projects = require("./source/_data/projects.json");
const languages = require("./source/_data/languages.json");

// Generating project pages per language
const processedProjects = [];
for (let l of languages) {
  for (let p of projects) {
    processedProjects.push({
      language: l,
      project: p,
      url: `/${l.lang}/projects/${p.id}/index.html`
    });
  }
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("apps");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy("downloads");
  eleventyConfig.addCollection("processedProjects", function() {
    return processedProjects;
  });
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