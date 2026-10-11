---
name: React version alignment
description: Why React and ReactDOM versions should stay aligned across workspace artifacts.
---

Keep React and ReactDOM exact versions aligned across artifacts served or built by Vite in this workspace.

**Why:** Vite deduplication can resolve React and ReactDOM from different artifacts. A patch-version mismatch caused the storefront auth shell to fail at runtime until the workspace versions were aligned.

**How to apply:** Before changing React or ReactDOM in one artifact, check the other artifact manifests and align both packages to the same exact patch where they share the workspace resolver.
