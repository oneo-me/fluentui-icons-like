import * as fs from "fs";
import * as path from "path";
import { IIcon } from "./IIcon";

export class SvgIcon implements IIcon {
  Key: string;
  Type: string;
  Size: number;
  File: string;
  Data: string;

  constructor(file: string) {
    this.File = file;
    this.Data = "";

    const fileName = path.basename(file, path.extname(file));
    const fileTypeResult = SvgIcon.GetFileType(fileName);
    this.Type = fileTypeResult[0];
    this.Key = `${path
      .basename(path.dirname(path.dirname(file)))
      .replace(/\s/g, "")}_${this.Type}`;
    this.Size = parseInt(
      fileTypeResult[1].slice(fileTypeResult[1].lastIndexOf("_") + 1)
    );
  }

  static SvgText2Data(svgText: string): string {
    const regex = /d="([^"]+)"/g;
    const matches = svgText.matchAll(regex);
    const result: string[] = [];

    for (const match of matches) {
      result.push(match[1]);
    }

    return result.join(" ");
  }

  static GetFileType(fileName: string): [string, string] {
    if (fileName.endsWith("_filled")) {
      return ["Filled", fileName.slice(0, -"_filled".length)];
    }

    if (fileName.endsWith("_regular")) {
      return ["Regular", fileName.slice(0, -"_regular".length)];
    }

    if (fileName.endsWith("_filled_ltr")) {
      return ["FilledLTR", fileName.slice(0, -"_filled_ltr".length)];
    }

    if (fileName.endsWith("_filled_rtl")) {
      return ["FilledRTL", fileName.slice(0, -"_filled_rtl".length)];
    }

    if (fileName.endsWith("_regular_ltr")) {
      return ["RegularLTR", fileName.slice(0, -"_regular_ltr".length)];
    }

    if (fileName.endsWith("_regular_rtl")) {
      return ["RegularRTL", fileName.slice(0, -"_regular_rtl".length)];
    }

    if (fileName.endsWith("_regular")) {
      return ["Regular", fileName.slice(0, -"_regular".length)];
    }

    throw new Error(`Unable to get known type from ${fileName}`);
  }
}
