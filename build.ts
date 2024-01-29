import path from "path";
import { Options } from "./builder/options";
import { Main } from "./builder/main";

const project = path.resolve(__dirname);

const assets = path.join(project, "submodules/fluentui-system-icons/assets");
const icons = path.join(project, "icons");

const options = new Options(project, assets, icons);

Main(options);
