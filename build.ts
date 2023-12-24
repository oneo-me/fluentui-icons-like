import * as path from "path";
import * as fs from "fs";

interface IIcon {
  Key: string;
  Size: number;
  GetData(): string;
}

class PathIcon implements IIcon {
  constructor(public Key: string, public Size: number, public Data: string) {}

  GetData(): string {
    return this.Data;
  }
}

class SvgIcon implements IIcon {
  Key: string;
  Type: string;
  Size: number;
  File: string;

  constructor(file: string) {
    this.File = file;

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

  GetData(): string {
    const svgText = fs.readFileSync(this.File, "utf8");
    return SvgIcon.SvgText2Data(svgText);
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

const project = path.resolve(__dirname);
const assets = path.join(project, "submodules/fluentui-system-icons/assets");
const icons: IIcon[] = [];

// add custom Icons
icons.push(
  new PathIcon(
    "Github_Filled",
    24,
    "M12 2C6.475 2 2 6.475 2 12C2 16.425 4.8625 20.1625 8.8375 21.4875C9.3375 21.575 9.525 21.275 9.525 21.0125C9.525 20.775 9.5125 19.9875 9.5125 19.15C7 19.6125 6.35 18.5375 6.15 17.975C6.0375 17.6875 5.55 16.8 5.125 16.5625C4.775 16.375 4.275 15.9125 5.1125 15.9C5.9 15.8875 6.4625 16.625 6.65 16.925C7.55 18.4375 8.9875 18.0125 9.5625 17.75C9.65 17.1 9.9125 16.6625 10.2 16.4125C7.975 16.1625 5.65 15.3 5.65 11.475C5.65 10.3875 6.0375 9.4875 6.675 8.7875C6.575 8.5375 6.225 7.5125 6.775 6.1375C6.775 6.1375 7.6125 5.875 9.525 7.1625C10.325 6.9375 11.175 6.825 12.025 6.825C12.875 6.825 13.725 6.9375 14.525 7.1625C16.4375 5.8625 17.275 6.1375 17.275 6.1375C17.825 7.5125 17.475 8.5375 17.375 8.7875C18.0125 9.4875 18.4 10.375 18.4 11.475C18.4 15.3125 16.0625 16.1625 13.8375 16.4125C14.2 16.725 14.5125 17.325 14.5125 18.2625C14.5125 19.6 14.5 20.675 14.5 21.0125C14.5 21.275 14.6875 21.5875 15.1875 21.4875C17.1727 20.8173 18.8977 19.5415 20.1198 17.8395C21.3419 16.1376 21.9995 14.0953 22 12C22 6.475 17.525 2 12 2Z"
  )
);

// add all icons from assets
fs.readdirSync(assets).forEach((iconFolder: string) => {
  const svgIcons: SvgIcon[] = [];
  const folderPath = path.join(assets, iconFolder, "SVG");
  const files = fs.readdirSync(folderPath);
  files.forEach((file: string) => {
    if (file.endsWith(".svg")) {
      const filePath = path.join(folderPath, file);
      svgIcons.push(new SvgIcon(filePath));
    }
  });

  const groupedIcons: { [key: string]: SvgIcon[] } = {};
  svgIcons.forEach((icon) => {
    if (!groupedIcons[icon.Type]) {
      groupedIcons[icon.Type] = [];
    }
    groupedIcons[icon.Type].push(icon);
  });

  Object.keys(groupedIcons).forEach((type) => {
    let closestSizeIcon: SvgIcon | undefined;
    let closestSizeDiff = Infinity;
    groupedIcons[type].forEach((icon) => {
      const sizeDiff = Math.abs(icon.Size - 20);
      if (sizeDiff < closestSizeDiff) {
        closestSizeIcon = icon;
        closestSizeDiff = sizeDiff;
      }
    });
    if (closestSizeIcon) {
      icons.push(closestSizeIcon);
    }
  });
});

// sort icons
icons.sort((a, b) => {
  if (a.Key < b.Key) {
    return -1;
  }
  if (a.Key > b.Key) {
    return 1;
  }
  return 0;
});

// write icons to file
icons.forEach((icon, index) => {
  console.log(`${index + 1} ${icon.Key}`);
});
