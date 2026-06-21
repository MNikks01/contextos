---
description: Publish ContextOS artifacts
---

Packages are currently `private`. To publish an engine to npm, give it a public name + version, remove `"private": true`, and `npm publish --access public`.
> Only publish what's intended to be public; never publish secrets or `.env`.
