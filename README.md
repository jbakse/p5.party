<!-- PROJECT LOGO -->
<!--
<p align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Best-README-Template</h3>

  <p align="center">
    An awesome README template to jumpstart your projects!
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template">View Demo</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Report Bug</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Request Feature</a>
  </p>
</p> -->

## About p5.party!

p5.party is a library for easily creating multiuser sketches with p5.js. With p5.party you can quickly prototype ideas for multiplayer games, realtime multiuser apps, and multi-computer art projects.

[p5.party Documentation](https://www.notion.so/p5-party-Documentation-887564cad8ec455e9bee994362322f2e)

[p5.party Demos](https://p5party.netlify.app/)

## What is it good for?

**Prototyping + Sketching**

[p5.party](http://p5.party) provides a simple, imperative interface for working with shared data inspired by the programming conventions used by the [p5.js](https://p5js.org/) api. p5.party let's you try ideas quickly without writing server code or setting up a front-end/back-end stack.

**Workshops + Classes**

p5.party uses a [deepstream.io](http://deepstream.io) server which is easy to set up and cheap—or free—to run. Multiple sketches and projects can connect to the same p5.party server, so students can focus on sketching instead of setting up servers.

**Turn Based Games and Apps**

Quickly get people connected and playing together. Try out ideas using many of your existing skills in p5.js.

## What is it not good for?

**Production**

p5.party is designed for prototypes. As your project grows, you'll need to look into other libraries and backends that suit your project's needs.

**Security**

Sketches built with p5.party are insecure. p5.party has no method to authenticate or authorize users. Multiple apps share a server and can read, write, and delete each other's data.

**Fast-Action**

Fast-action multiplayer games are inherently complex. Compensating for network latency requires [prediction and reconciliation](https://www.gabrielgambetta.com/client-server-game-architecture.html) strategies which are somewhat application specific and outside the scope of p5.party.

## Features

**Shared Data Objects**

With p5.party you can easily create a shared data object that is automatically synchronized between instances of your sketch. You can write to and read from these objects just like local variables.

**Multiple Apps and Rooms**

A single p5.party server can support many apps and each app can group users into rooms. p5.party keeps track of which clients are in each room and shares the data to the right clients.

**Client-side Hosting**

p5.party automatically designates one (and only one) guest in each room as the host. Your code can easily check if it is the host and take care of running the party. This lets you avoid writing server-side code and makes prototyping faster.

## How does it work?

[p5.party](http://p5.party) builds on [deepstream.io](http://deepstream.io) and [sindresorhus/on-change](https://github.com/sindresorhus/on-change). Deepstream is a realtime data-sync server that can be easily self hosted on services like [heroku](heroku.com) or [aws](https://aws.amazon.com/free). p5.party uses Deepstream to communicate between connected clients. on-change uses javascript [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to make a fully observable object. p5.party uses on-change to watch for changes to shared data objects and then communicates these changes to deepstream.

## Installation and Quickstart

Download the latest build of p5.party and the example apps from the [releases page on Github](https://github.com/jbakse/p5.party/releases). For details getting started see the Hello, p5.party! tutorial.

[Hello, p5.party!](https://www.notion.so/Hello-p5-party-c4c0f94127c1408e9d6dd51f91ac8414)

## Server Installation

You can set up a server in a few minutes using Heroku and a clone of the p5.party repo.

[Server Setup](https://www.notion.so/Server-Setup-d039a4be3a044878bd5ad0931f1c93bd)

<!--
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request -->

## License

Distributed under the MIT License. See `license` for more information.

## Acknowledgements

- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
- [deepstream.io](http://deepstream.io)
- [sindresorhus/on-change](https://github.com/sindresorhus/on-change)

## Contributors

p5.party was created by Justin Bakse, Munro Hoberman, and Isabel Anguera.
