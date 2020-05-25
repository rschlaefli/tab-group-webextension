import React from 'react'
import { Input as MuiInput } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

interface IProps {
  fullWidth?: boolean
  value: string
  onChange?: (newValue: any) => void
}

const useStyles = makeStyles({
  root: {
    border: 'none',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
  },
})

function Input({ fullWidth, value, onChange }: IProps): React.ReactElement {
  const classes = useStyles()
  return (
    <MuiInput
      classes={classes}
      disabled={!onChange}
      fullWidth={fullWidth}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
        onChange && onChange(e.target.value)
      }
    />
  )
}

export default Input
