import { ITabGroup } from '@src/types/Extension'

export default function onOmniboxInput({ getState }) {
  return function onOmniboxInputListener(omniInput, suggest): void {
    const relevantGroups: ITabGroup[] = getState().tabGroups.filter((group: ITabGroup) =>
      group.name.includes(omniInput)
    )

    if (relevantGroups.length > 0) {
      suggest(
        relevantGroups.map((group) => ({
          content: group.id,
          description: `Open tab group: ${group.name}`,
        }))
      )
    }
  }
}
