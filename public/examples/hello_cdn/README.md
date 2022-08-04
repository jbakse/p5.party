# hello_cdn

This example shows how to connect to a party server, load a shared data object, and read and write to it.

- **click** to move the dot

This example is the same as `hello_party` but loads p5.party from a CDN instead of a local file.

CDN stands for Content Delivery Network. A CDN hosts commonly accessed content like js libraries.

Loading p5.party from a CDN introduces an external dependency; if the CDN removes the file, your app won't be able to load it.

Using a CDN is good for quick sketching, and also lets you always load the latest version of the library rather than a spcific version which is sometimes useful.

Loading the latest version from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js"></script>
```

Loading a specific version from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/p5.party@0.8.0/dist/p5.party.js"></script>
```

Try [this example on the p5 web editor.](https://editor.p5js.org/jbakse/sketches/O3hvfPac2)

> Try this example in two browser windows at once!
