# Automated Tab Organization - WebExtension

This repository contains the WebExtension and Heuristics Frontend for my master thesis on `Automated Tab Grouping` at the `University of Zurich` (in its early stages).

While the extension is thought to provide useful manual grouping features on its own, additional features will be available by installing a separately distributed heuristics engine. More specifically, installing the Scala-based heuristics engine on the local machine will allow for data exchange through `Native Messaging` and will enable the **local** computation of automated tab groups (based on tab switches and further heuristics). For privacy-purposes, everything is computed and persisted locally with no data sent to any cloud whatsoever.

The following will **not** work in a "standalone" installation with default settings:

- No data about tab interactions will be collected and it will not be possible to derive any statistics
- No automated grouping suggestions will be computed
- Therefore, participation in experiments will not be possible

However, it is still possible to use the core feature-set (manually):

- Create and use tab groups (in New Tab and sidebar views)
- Synchronize groups across devices

As it is planned to conduct a user study and write an accompanying scientific report, this code shall remain closed-source and manually distributed until said publication is finished. After publication, it is planned to further develop the extension as an open-source project and distribute it over official channels (i.e. Firefox AMO and Chrome Web Stores).

For feature requests, bug reports, and feedback of any kind, please refer to the following form:
<https://docs.google.com/forms/d/1pLqMgDVgzzf7yAmn6JLd0jJbrn3QlFZNVaYlKWVie78/edit>

## Requirements

NodeJS 12.x or later

## Development

Install all dependencies:

> `npm install`

Run the extension in development mode:

> `npm run dev`

Package the extension for deployment:

> `npm run package`
