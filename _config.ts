import lume from "lume/mod.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";

const site = lume({
  location: new URL("https://red-swan.github.io/eip-712-is-ambiguous/"),
});

site.use(codeHighlight());

site.copy("styles.css");
site.copy("highlight.css");

export default site;
