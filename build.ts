import path from "path";
import { Main, MainOptions } from "./builder/main";

const project = path.resolve(__dirname);
const assets = path.join(project, "submodules/fluentui-system-icons/assets");

Main(new MainOptions(project, assets));
