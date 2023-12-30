import { writable } from "svelte/store";
import source from "./icons.js";

function createIcons() {
  const { subscribe, set } = writable(source);

  return {
    subscribe,

    /**
     * @param {string} keyword
     */
    search: (keyword) => {
      let filterBy = keyword.toLowerCase();
      if (filterBy === "") set(source);
      else set(source.filter((icon) => icon.key.toLowerCase().includes(filterBy)));
    },
  };
}

export const icons = createIcons();
