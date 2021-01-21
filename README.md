# Automated Tab Organization - WebExtension

This repository contains the WebExtension and Heuristics Frontend for my master thesis (`msc_thesis.pdf`) on `Automated Tab Grouping` at the `University of Zurich`.

While the extension is thought to provide useful manual grouping features on its own, additional features are available by installing a separately distributed heuristics engine. More specifically, installing the Scala-based heuristics engine on the local machine allows for data exchange through `Native Messaging` and enables the **local** computation of automated tab groups (based on tab switches and further heuristics). For privacy-purposes, everything is computed and persisted locally with no data sent to any cloud whatsoever.

The following will **not** work in a "standalone" installation with default settings:

- No data about tab interactions will be collected and it will not be possible to derive any statistics
- No automated grouping suggestions will be computed
- Therefore, participation in experiments will not be possible

However, it is still possible to use the core feature-set (manually):

- Create and use tab groups (in New Tab and sidebar views)
- Synchronize groups across devices

It is planned to further develop the extension as an open-source project (https://github.com/rschlaefli/tabai) and distribute it over official channels (i.e. Firefox AMO and Chrome Web Stores).

## Requirements

NodeJS 12.x or later

## Development

Install all dependencies:

> `npm install`

Run the extension in development mode (installation using developer/debug mode):

> `npm run dev`

Package the extension for deployment (creates `.zip` and `.xpi` files):

> `npm run deploy`
