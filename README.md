<div align="center">

![p5.party logo](assets/p5_party_logo.png)

<!-- ![Netlify](https://img.shields.io/netlify/8ab7413c-e95d-42b8-8988-5d930954a3f1) -->

<!-- ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jbakse/p5.party) -->

<!-- ![GitHub contributors](https://img.shields.io/github/contributors/jbakse/p5.party) -->

<!-- ![GitHub all releases](https://img.shields.io/github/downloads/jbakse/p5.party/total) -->

![NPM](https://img.shields.io/npm/l/p5.party)
![GitHub package.json version](https://img.shields.io/github/package-json/v/jbakse/p5.party)

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/jbakse/p5.party)
![jsDelivr hits (npm)](https://img.shields.io/jsdelivr/npm/hy/p5.party)
[![Website](https://img.shields.io/website?down_message=offline&label=documentation&up_message=online&url=https%3A%2F%2Fwww.notion.so%2Fp5-party-Documentation-887564cad8ec455e9bee994362322f2e)](https://www.notion.so/p5-party-Documentation-887564cad8ec455e9bee994362322f2e)
[![Website](https://img.shields.io/website?down_message=offline&label=examples&up_message=online&url=https%3A%2F%2Fp5party.netlify.app%2F)](http://p5party.netlify.app)

Test Coverage:

![Statements](https://img.shields.io/badge/statements-97.95%25-brightgreen.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-92.03%25-brightgreen.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-94.91%25-brightgreen.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-97.78%25-brightgreen.svg?style=flat)

</div>

## Multi-player Games with p5.js

p5.party is a library for easily prototyping online multi-user sketches with p5.js. With p5.party you can quickly test ideas for multiplayer games, realtime multi-user apps, and multi-computer art projects.

[p5.party Website](https://p5party.org)

[Documentation](https://www.notion.so/p5-party-Documentation-887564cad8ec455e9bee994362322f2e)

[Demos + Examples](https://p5party.org/examples)

[Discussion](https://github.com/jbakse/p5.party/discussions)

## What is it good for?

**Prototyping + Sketching**

[p5.party](https://p5party.org/) provides a simple, imperative interface for working with shared data inspired by the programming conventions used by the [p5.js](https://p5js.org/) api. p5.party let's you try ideas quickly without writing server code or setting up a front-end/back-end stack.

**Workshops + Classes**

p5.party uses a [deepstream.io](http://deepstream.io) server which is easy to set up and cheap—or free—to run. Many sketches and projects can connect to the same p5.party server, so students can focus on sketching instead of setting up servers.

<!-- **Turn Based Games and Apps**

Quickly get people connected and playing together. Try out ideas using many of your existing skills in p5.js. -->

## What is it not good for?

**Production**

p5.party is designed for prototypes. As your project grows, you'll need to look into other libraries and backends that suit your project's needs.

**Security**

Sketches built with p5.party are insecure. p5.party has no method to authenticate or authorize users. Multiple apps share a server and can read, write, and delete each other's data.

<!-- **Fast-Action Games**

Fast-action multiplayer games are inherently complex. Compensating for network latency requires [prediction and reconciliation](https://www.gabrielgambetta.com/client-server-game-architecture.html) strategies which are somewhat application specific and outside the scope of p5.party. -->

## Features

**Shared Data Objects**

With p5.party you can easily create a shared data object that is automatically synchronized between instances of your sketch. You can assign and read properties on these objects just like a plain old local javascript object.

**Multiple Apps and Rooms**

A single p5.party server can support many apps and each app can group users into rooms. p5.party keeps track of which clients are in each room and shares the data to the right clients.

**Client-side Hosting**

p5.party automatically designates one (and only one) guest in each room as the host. Your code can easily check if it is the host and take care of running the party. This lets you avoid writing server-side code and makes prototyping faster.

## Show Me Some Code!

<img src="assets/hello_p5party_opt.gif" align="right"/>

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js"></script>
```

```javascript
let shared;

function preload() {
  // connect to the server
  partyConnect("wss://demoserver.p5party.org", "hello_party");

  // load a shared data object, with starting values
  shared = partyLoadShared("shared", { x: 200, y: 200 });
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  fill("red");
}

function mousePressed() {
  // write shared data
  shared.x = mouseX;
  shared.y = mouseY;
}

function draw() {
  background("white");
  // read shared data
  ellipse(shared.x, shared.y, 100, 100);
}
```

### p5.js 2

p5.js 2 doesn't have `preload()`. Make `setup()` async and `await` loading. With p5.js 2, `partyConnect()`, `partyLoadShared()`, and `partyLoadMyShared()` return Promises.

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2/lib/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js"></script>
```

```javascript
let shared;

async function setup() {
  createCanvas(400, 400);
  noStroke();
  fill("red");

  await partyConnect("wss://demoserver.p5party.org", "hello_party");
  shared = await partyLoadShared("shared", { x: 200, y: 200 });
}

function mousePressed() {
  // mousePressed() can be called before setup() finishes loading
  if (!shared) return;
  shared.x = mouseX;
  shared.y = mouseY;
}

function draw() {
  background("white");
  ellipse(shared.x, shared.y, 100, 100);
}
```

p5.party detects the p5.js version when it loads. If you use the [p5.js-compatibility](https://github.com/processing/p5.js-compatibility) preload add-on with p5.js 2, the p5.js 1 version above works too.

### Without p5.js

p5.party also works without p5.js. Use the `p5party` namespace: `p5party.connect()`, `p5party.loadShared()`, `p5party.isHost()`, and so on. The loading functions return Promises.

```html
<canvas id="canvas" width="400" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js"></script>
<script type="module">
  await p5party.connect("wss://demoserver.p5party.org", "hello_party");
  const shared = await p5party.loadShared("shared", { x: 200, y: 200 });

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.addEventListener("pointerdown", (e) => {
    shared.x = e.offsetX;
    shared.y = e.offsetY;
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(shared.x, shared.y, 50, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    requestAnimationFrame(draw);
  }
  draw();
</script>
```

See the [hello_party_v2](https://p5party.org/examples/hello_party_v2/), [hello_party_vanilla](https://p5party.org/examples/hello_party_vanilla/), and [hello_party_vanilla_dom](https://p5party.org/examples/hello_party_vanilla_dom/) examples.

### npm, bundlers, and TypeScript

Using the `<script>` tag? You can skip this section.

If you build your project with a bundler like Vite, install p5.party from npm and import it:

```bash
npm install p5.party
```

```ts
import { p5party } from "p5.party";

type Player = { x: number; y: number };

async function main() {
  await p5party.connect("wss://demoserver.p5party.org", "my_app");
  const me = await p5party.loadMyShared<Player>({ x: 0, y: 0 });
  me.x = 100;

  for (const guest of p5party.loadGuestShareds<Player>()) {
    if (typeof guest.x !== "number") continue; // see below
    console.log(guest.x, guest.y);
  }
}
main();
```

p5.party includes TypeScript types. A type like `Player` describes your shared data, but p5.party doesn't check it: starting values are only used if the room is empty, and other clients (or an older version of your sketch) may have written different data. Check a guest's data before you use it.

**Importing p5.js too?** p5.party adds `partyConnect()` and the other p5 functions automatically when p5.js is loaded with a `<script>` tag. If you `import p5 from "p5"` instead, call `p5party.installP5(p5)` before you create your sketch:

```js
import p5 from "p5";
import { p5party } from "p5.party";

p5party.installP5(p5);

new p5((p) => {
  let shared;
  p.setup = async () => {
    p.createCanvas(400, 400);
    await p.partyConnect("wss://demoserver.p5party.org", "my_app");
    shared = await p.partyLoadShared("shared", { x: 200, y: 200 });
  };
  p.draw = () => {
    p.background(220);
    p.ellipse(shared.x, shared.y, 100, 100);
  };
});
```

(In TypeScript, p5's own types don't include the `partyXyz()` functions on the sketch object yet.)

## Installation and Quickstart

The quickest way to get started with p5.party is to load it from a [CDN](https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js) or download the latest [release](https://github.com/jbakse/p5.party/releases) .

Visit the [p5.js Web Editor Quick Start Guide (p5.js 1)](https://justinbakse.notion.site/p5-js-Web-Editor-Quick-Start-Guide-p5-js-1-5cc4a197886a4bda89573f5879e47c78), [VS Code Quick Start Guide (p5.js 1)](https://justinbakse.notion.site/VS-Code-Quick-Start-Guide-p5-js-1-c4c0f94127c1408e9d6dd51f91ac8414), or [p5.js 2 Quick Start Guide](https://justinbakse.notion.site/p5-js-2-Quick-Start-Guide-3fcb1bb21cec8151a1c9e642605dc22f) to get started!

Looking for every function? See the [API reference](docs/api.md).

Not using p5.js? See [Using p5.party without p5.js](https://justinbakse.notion.site/Using-p5-party-without-p5-js-3fcb1bb21cec81869935fc26321e6d1e).

## Server Installation

You can set up a server in a few minutes using Heroku and a clone of the p5.party repo.

[Server Setup](https://www.notion.so/Server-Setup-d039a4be3a044878bd5ad0931f1c93bd)

## Contributing

We welcome new contibuters. Please feel free to start a [discusion](https://github.com/jbakse/p5.party/discussions), [post issues](https://github.com/jbakse/p5.party/issues), or [request features](https://github.com/jbakse/p5.party/issues). If you want to help with writing code or documentation, you can start by indicating your interest on an open issue or by creating your own.

## License

Distributed under the MIT License. See `license` for more information.

## Acknowledgements

p5.party builds on [deepstream.io](http://deepstream.io) and [sindresorhus/on-change](https://github.com/sindresorhus/on-change). Deepstream is a realtime data-sync server that can be easily self hosted on services like [heroku](heroku.com) or [aws](https://aws.amazon.com/free). on-change uses javascript [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to make a fully observable object. p5.party uses on-change to watch for changes to shared data objects and then communicates these changes to deepstream. p5.party also depends on a number of other great [packages](package.json).

- [deepstream.io](http://deepstream.io)
- [sindresorhus/on-change](https://github.com/sindresorhus/on-change)

## Contributors

p5.party was created by Justin Bakse, Munro Hoberman, and Isabel Anguera.

Contributions by Tanvi Mishra, Apurv Rayate, Hyacinth Weng,
MJ Gomez-Saavedra, Shayla Lee

## Thanks To

Jessie Han, An Kong, Kevin Lin, Malin Mabika, Tanvi Mishra, Brittany Price, Apurv Rayate, Beatriz Ribeiro Dos Santos, Tong Shao, Hyacinth Weng, Winnie Yuxiang Zhai, Joan Jingwen Zhang, Jasmine Chen, Joshua Davison, Caitlin Keating, Simone Liu, Zhuoran Ma, Rand Rivera, Runzhe Sha, Haotian Wang, Ziyi Wang
