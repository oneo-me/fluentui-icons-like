import { fileURLToPath } from "url";
import { resolve, join, dirname } from "path";
import { Main } from "./builder/main.js";
import { Options } from "./builder/options.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const project = resolve(__dirname);
const assets = join(project, "submodules/fluentui-system-icons/assets");
const icons = join(project, "icons");

const options = new Options(project, assets, icons);

Main(options);
