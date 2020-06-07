fetch("./index.js")
  .then((r) => r.text())
  .then((t) => {
    const div = document.getElementById("source");
    div.innerHTML = `<pre><code>${t}</code></pre>`;
    hljs.initHighlighting();
  });
