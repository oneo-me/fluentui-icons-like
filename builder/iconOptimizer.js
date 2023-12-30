import { Icon } from "./icon.js";
import svgo from "svgo";
import fs from "fs";

/**
 * @param {Icon[]} icons
 */
function optimizeIcons(icons) {
  for (const icon of icons) {
    const svgText = fs.readFileSync(icon.file, "utf8");
    const optimizedData = svgo.optimize(svgText).data;
    icon.data = getSvgData(optimizedData);
  }
}

/**
 * @param {string} svgText
 * @returns {string}
 */
function getSvgData(svgText) {
  const regex = /d="([^"]+)"/g;
  const matches = svgText.matchAll(regex);
  /**
   * @type {string[]}
   */
  const result = [];
  for (const match of matches) {
    result.push(match[1]);
  }
  return result.join(" ");
}

export { optimizeIcons };
