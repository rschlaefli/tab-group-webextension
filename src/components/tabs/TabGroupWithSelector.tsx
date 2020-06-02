import React from 'react'
import { useSelector } from 'react-redux'

import TabGroup from './TabGroup'
import { RootState } from '@src/state/configureStore'
import { ITabGroup } from '@src/types/Extension'

interface IProps {
  selector: (state: RootState) => ITabGroup
}

function TabGroupWithSelector({ selector }): React.ReactElement {
  const { id, name, tabs, collapsed, readOnly } = useSelector(selector)

  // TODO: spread props from selector
  return <TabGroup />
}

export default TabGroupWithSelector
