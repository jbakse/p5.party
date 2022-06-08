import { marked } from "https://cdnjs.cloudflare.com/ajax/libs/marked/4.0.16/lib/marked.esm.js";

/* global hljs */

function onFetch(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

const escapeHtml = (unsafe) => {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export function showReadme() {
  return fetch(`./README.md`)
    .then(onFetch)
    .then((r) => r.text())
    .then((t) => {
      const div = document.getElementById("readme");
      div.innerHTML = marked(t);
    })
    .catch((e) => {});
}

export function showJS() {
  // show example source
  return fetch(`./index.js`)
    .then(onFetch)
    .then((r) => r.text())
    .then((t) => {
      const div = document.getElementById("source-javascript");
      div.innerHTML = `<pre><code class="lang-javascript">${t}</code></pre>`;
      // hljs.initHighlighting();
    })
    .catch((e) => {});
}

export function showHTML() {
  return fetch(`./index.html`)
    .then(onFetch)
    .then((r) => r.text())
    .then((t) => {
      // replace substring in t

      const stripped_t = t.replaceAll(
        /<!-- Code injected by live-server -->\n<script[\s\S]*<\/script>/gi,
        ""
      );
      const escaped_t = escapeHtml(stripped_t);

      const div = document.getElementById("source-html");
      div.innerHTML = `<pre><code class="language-html">${escaped_t}</code></pre>`;
    })
    .catch((e) => {});
}

showReadme();
const js = showJS();
const html = showHTML();

Promise.all([js, html]).then(() => {
  hljs.initHighlighting();
});
