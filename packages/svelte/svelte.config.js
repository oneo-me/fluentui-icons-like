const config = {
  compilerOptions: {
    /** @param {{ filename: string }} options */
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
  },
};

export default config;
