# Feature Overview

- [Feature Overview](#feature-overview)
  - [Pause & Resume](#pause--resume)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Omnibox](#omnibox)
  - [Manual Grouping](#manual-grouping)
    - [Current Tabs](#current-tabs)
    - [Curated Groups](#curated-groups)
      - [Focus Mode](#focus-mode)
      - [Edit Tab](#edit-tab)
  - [Sidebar](#sidebar)
  - [Suggestions](#suggestions)

To start using the manual and automated grouping features of the extension, please enter the activation key you have received upon conclusion of phase one.

You will be presented with an overview of your manually curated groups (empty), as well as some suggestions that have been computed from initial data collection. The remainder of this documentation goes into all of the features that are available to you during phase two.

## Pause & Resume

You can pause and resume tracking of your behavior by clicking on the (pause/green) circle as shown below:

![Tracking States](tracking_states.png)

## Keyboard Shortcuts

- `Ctrl+Shift+Q`: Open the extension sidebar on any page
- `Ctrl+Shift+S`: Open the extension overview in a new tab

You can customize these shortcuts in the Browser extension settings (Chrome: <chrome://extensions/shortcuts>, Firefox: <https://support.mozilla.org/en-US/kb/manage-extension-shortcuts-firefox>).

## Omnibox

You can quickly open curated groups or tabs in curated groups using the Omnibox (“URL bar”).
To do so, enter `grp` and a space and start typing the name of the curated group or tab that you would like to open.
We will provide you with a list of matching suggestions that you can select to open an entire group or single tab.

## Manual Grouping

### Current Tabs

![Current Tabs](current_tabs.png)

The list of current tabs allows you to close any currently open tab (click on the `x`).

Additionally, tabs that have been open but unused for more than an hour will be marked as stale. You can close all of these tabs by clicking on the cleanup button in the top right.

You can drag and drop tabs to any other curated group that you might already have, as well as to the plus to create a new group.

### Curated Groups

![Curated Group](curated_group.png)

You can open and close an entire group (i.e., all of its tabs) with the buttons in the top right. Grouped tabs that are currently open will be marked and can be closed by clicking on the respective `x`. Opening the context menu of a grouped tab (right-click on the tab) will further allow you to remove the tab from the group and to open it in a new tab.

The context menu of a group (right-click on the header) additionally allows you to delete the group, close all tabs **except** the ones in that group, as well as to open that group in a new window.

#### Focus Mode

![Focus Mode](focus_mode.png)

We have implemented a `Focus Mode` to improve your workflow if you regularly switch groups/tasks. Once focus mode is activated and you open a tab group (as described above), all other tab groups that are currently open will be closed. This allows you to switch tasks while cleaning up unneeded tabs simultaneously.

#### Edit Tab

![Edit Tab](edit_tab.png)

You can edit the title of a tab using the pencil icon on the respective tab. The URL cannot be changed; instead, open a tab with the other URL and drag it to that group.

## Sidebar

![Sidebar](sidebar.png)

In addition to the view you can open with the extension button in your browser bar, we also offer a sidebar view that you can open on any webpage you are on. To do so, click on the sidebar trigger button in the bottom left of your page. You can also use the keyboard shortcut `Ctrl+Shift+Q` (or `Cmd+Shift+Q` on MacOS) to directly open the sidebar.

The sidebar allows you all of the same interactions that you know from the other extension view, while bringing these interactions closer to where you are browsing.

## Suggestions

Once the grouping heuristics have collected enough data, you will be presented with suggestions for groups that you might want to add to your curated groups. Such a suggestion might look as follows:

![Suggested Group](suggested_group.png)

When you want to persist that suggestion in your curated list, click the save button in the top right. If the suggestion is not helpful, you can discard it using the trash icon. You can also discard single tabs within that suggestion and, after doing so, persist only what remains. Additionally, you can freely drag and drop from suggested groups to your curated groups.

When a significant overlap is detected, the heuristics might also suggest additions to existing curated groups. These could look as pictures below:

![Suggested Additions](additions.png)

You can accept these additions by dragging the additional tab into your curated group, or discard them by clicking the trash icon. When you discard a group, you will be asked for a reason so that we can learn more about the performance of our grouping heuristics.

![Discard Reasons](discard_reasons.png)

When you rate the suggestion from 1 to 5, please give your subjective judgement on how good the group was independent of whether it was useful to you at that time. The reasons will allow you to state that the group was incorrect and should never be shown again (i.e., the tabs in the group have no significant relationship) or that the group is not useful at this time, but could be shown in the future if you use the constituent tabs again.
