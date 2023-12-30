import App from "./App.svelte";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
