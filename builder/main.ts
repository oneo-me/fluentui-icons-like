import { Icon } from "./icon";
import { Options } from "./options";
import { loadFromCustomIcons, loadFromFulentIcons } from "./iconLoader";
import { optimizeIcons } from "./iconOptimizer";

function Main(options: Options) {
  const icons: Icon[] = [];

  loadFromCustomIcons(icons, options.icons);
  // loadFromFulentIcons(icons, options.assets);

  optimizeIcons(icons);

  icons.sort((a, b) => {
    if (a.key < b.key) {
      return -1;
    }
    if (a.key > b.key) {
      return 1;
    }
    return 0;
  });

  console.log(icons.length);

  // write icons to svelte package

  // write icons to avalonia package

  // write icons to wpf package
}

export { Main };
