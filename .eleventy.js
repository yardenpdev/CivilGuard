module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    "html",
    "md",
    "njk"
  ]);
eleventyConfig.addPassthroughCopy("client/scripts");
eleventyConfig.addPassthroughCopy("client/styles");
eleventyConfig.addPassthroughCopy("client/images");
};