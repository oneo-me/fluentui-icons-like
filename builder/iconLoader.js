import { Icon } from "./icon.js";
import fs from "fs";
import path from "path";

/**
 * @param {Icon[]} icons
 * @param {string} folder
 */
function loadFromCustomIcons(icons, folder) {
  const fileNames = fs.readdirSync(folder);
  const size = 32; // custom icons are 32x32
  for (const fileName of fileNames) {
    const file = path.join(folder, fileName);
    const key = path.basename(fileName, path.extname(fileName));
    icons.push(new Icon(file, key, size));
  }
}

/**
 * @param {Icon[]} icons
 * @param {string} folder
 */
function loadFromFulentIcons(icons, folder) {
  const fileNames = fs.readdirSync(folder);
  for (const fileName of fileNames) {
    const svgFolder = path.join(folder, fileName, "SVG");
    if (fs.existsSync(svgFolder) === false) {
      continue;
    }
    icons.push(...loadFromFulentIconFolder(svgFolder));
  }
}
/**
 * @param {string} folder
 * @returns {Icon[]}
 */
function loadFromFulentIconFolder(folder) {
  /**
   * @type {Icon[]}
   */
  const icons = [];

  /**
   * @type {{file: string, type: string, key: string, size: number}[]}
   */
  const svgs = [];

  const folderName = path.basename(path.dirname(folder));
  const fileNames = fs.readdirSync(folder);
  for (const fileName of fileNames) {
    if (path.extname(fileName) !== ".svg") {
      continue;
    }

    const svgType = GetSvgType(fileName);
    const key = `${folderName.replace(/\s/g, "")}_${svgType.type}`;
    const size = parseInt(svgType.name.slice(svgType.name.lastIndexOf("_") + 1));

    svgs.push({
      file: path.join(folder, fileName),
      type: svgType.type,
      key: key,
      size: size,
    });
  }

  const grouped = {};
  for (const svg of svgs) {
    if (grouped[svg.type] === undefined) {
      grouped[svg.type] = [];
    }
    grouped[svg.type].push(svg);
  }

  for (const key of Object.keys(grouped)) {
    let closestSizeIcon = undefined;
    let closestSizeDiff = Infinity;
    for (const svg of grouped[key]) {
      const diff = Math.abs(svg.size - 20);
      if (diff < closestSizeDiff) {
        closestSizeIcon = svg;
        closestSizeDiff = diff;
      }
    }
    if (closestSizeIcon === undefined) {
      continue;
    }

    icons.push(new Icon(closestSizeIcon.file, closestSizeIcon.key, closestSizeIcon.size));
  }

  return icons;
}

/**
 * @param {string} fileName
 * @returns {{type: string, name: string}}}
 */
function GetSvgType(fileName) {
  if (fileName.endsWith("_filled_ltr.svg")) {
    return { type: "FilledLTR", name: fileName.slice(0, -"_filled_ltr.svg".length) };
  }
  if (fileName.endsWith("_filled_rtl.svg")) {
    return { type: "FilledRTL", name: fileName.slice(0, -"_filled_rtl.svg".length) };
  }
  if (fileName.endsWith("_regular_ltr.svg")) {
    return { type: "RegularLTR", name: fileName.slice(0, -"_regular_ltr.svg".length) };
  }
  if (fileName.endsWith("_regular_rtl.svg")) {
    return { type: "RegularRTL", name: fileName.slice(0, -"_regular_rtl.svg".length) };
  }
  if (fileName.endsWith("_filled.svg")) {
    return { type: "Filled", name: fileName.slice(0, -"_filled.svg".length) };
  }
  if (fileName.endsWith("_regular.svg")) {
    return { type: "Regular", name: fileName.slice(0, -"_regular.svg".length) };
  }

  throw new Error(`Unable to get known type from ${fileName}`);
}

export { loadFromCustomIcons, loadFromFulentIcons };
