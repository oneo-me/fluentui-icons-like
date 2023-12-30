import { Icon } from "./icon.js";
import { Options } from "./options.js";
import { loadFromCustomIcons, loadFromFulentIcons } from "./iconLoader.js";
import { optimizeIcons } from "./iconOptimizer.js";

/**
 * @param {Options} options
 */
function Main(options) {
  /**
   * @type {Icon[]}
   */
  const icons = [];

  // add icons from custom icons
  loadFromCustomIcons(icons, options.icons);

  // add icons from assets
  loadFromFulentIcons(icons, options.assets);

  // optimize icons
  optimizeIcons(icons);

  // sort icons
  icons.sort((a, b) => {
    if (a.key < b.key) {
      return -1;
    }
    if (a.key > b.key) {
      return 1;
    }
    return 0;
  });

  // write icons to svelte package

  // write icons to avalonia package

  // write icons to wpf package
}

export { Main };
