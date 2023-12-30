/**
 * @class
 */
class Icon {
  /**
   * @param {string} file
   * @param {string} key
   * @param {number} size
   */
  constructor(file, key, size) {
    this.file = file;
    this.key = key;
    this.size = size;

    /**
     * @type {string }
     */
    this.data = "";
  }
}

export { Icon };
