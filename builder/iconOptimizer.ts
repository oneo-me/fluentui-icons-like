import { Icon } from "./icon";
import svgo from "svgo";
import fs from "fs";

function optimizeIcons(icons: Icon[]): void {
  for (const icon of icons) {
    const svgText = fs.readFileSync(icon.file, "utf8");
    const optimizedData = svgo.optimize(svgText).data;
    icon.data = getSvgData(optimizedData);
  }
}

function getSvgData(svgText: string): string {
  const regex = /d="([^"]+)"/g;
  const matches = svgText.matchAll(regex);
  const result: string[] = [];
  for (const match of matches) {
    result.push(match[1]);
  }
  return result.join(" ");
}

export { optimizeIcons };
