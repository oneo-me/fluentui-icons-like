import { Icon, SvgIcon } from "./icon";
import fs from "fs";
import path from "path";

function loadFromCustomIcons(icons: Icon[], folder: string) {
  const fileNames = fs.readdirSync(folder);
  const size = 32;
  for (const fileName of fileNames) {
    const file = path.join(folder, fileName);
    const key = path.basename(fileName, path.extname(fileName));
    icons.push(new Icon(file, key, size));
  }
}

function loadFromFulentIcons(icons: Icon[], folder: string) {
  const fileNames = fs.readdirSync(folder);
  for (const fileName of fileNames) {
    const svgFolder = path.join(folder, fileName, "SVG");
    if (fs.existsSync(svgFolder) === false) {
      continue;
    }
    icons.push(...loadFromFulentIconFolder(svgFolder));
  }
}

function loadFromFulentIconFolder(folder: string): Icon[] {
  const icons: Icon[] = [];
  const svgs: SvgIcon[] = [];

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

  const grouped: { [key: string]: SvgIcon[] } = {};
  for (const svg of svgs) {
    if (grouped[svg.type] === undefined) {
      grouped[svg.type] = [];
    }
    grouped[svg.type].push(svg);
  }

  for (const key of Object.keys(grouped)) {
    let closestSizeIcon: SvgIcon | undefined = undefined;
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

function GetSvgType(fileName: string): { type: string; name: string } {
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
