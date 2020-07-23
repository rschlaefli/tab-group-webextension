import { ITabGroup, ITab } from '@src/types/Extension'

export default function onOmniboxInput({ getState }) {
  return function onOmniboxInputListener(omniInput, suggest): void {
    const groups = getState().tabGroups

    const relevantGroups: ITabGroup[] = groups.filter((group: ITabGroup) =>
      group.name.toLowerCase().includes(omniInput)
    )

    const relevantTabs: ITab[] = groups
      .flatMap((group: ITabGroup) => group.tabs)
      .filter(
        (tab: ITab) =>
          tab.title.toLowerCase().includes(omniInput) ||
          tab.displayTitle?.toLowerCase().includes(omniInput)
      )

    suggest([
      ...relevantGroups.map((group) => ({
        content: `group-open-${group.id}`,
        description: `Open group: ${group.name}`,
      })),
      ...relevantTabs.map((tab) => ({
        content: `tab-open-${tab.url}`,
        description: `Open tab: ${tab.displayTitle || tab.title}`,
      })),
    ])
  }
}
