/* eslint-disable react/jsx-key */

import React, { useMemo, useCallback, useState } from 'react'
import { useTable } from 'react-table'
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'

import Layout from '@src/components/common/Layout'
import { Delete } from '@material-ui/icons'

const STEPS = ['Introduction', 'Data Import (Statistics)', 'Data Import (Tab Events)', 'Submission']

const useStyles = makeStyles({
  container: {
    height: 600,
  },
  tableBody: {
    overflowY: 'scroll',
  },
})

function Data(): React.ReactElement {
  const styles = useStyles()

  const columns = useMemo(
    () => [
      {
        Header: 'Timestamp (TS)',
        accessor: 'timestamp', // accessor is the "key" in the data
      },
      {
        Header: 'Window TS',
        accessor: 'window_ts',
      },
      {
        Header: 'Current Tabs (Avg)',
        accessor: 'tabs_open',
      },
      {
        Header: 'Current Tabs (Avg, Grouped)',
        accessor: 'tabs_grouped',
      },
      {
        Header: 'Current Tabs (Avg, Ungrouped)',
        accessor: 'tabs_ungrouped',
      },
      {
        Header: 'Tab Switches (Within Groups)',
        accessor: 'switches_within',
      },
      {
        Header: 'Tab Switches (Between Groups)',
        accessor: 'switches_between',
      },
      {
        Header: 'Tab Switches (From Group)',
        accessor: 'switches_from',
      },
      {
        Header: 'Tab Switches (To Group)',
        accessor: 'switches_to',
      },
      {
        Header: 'Tab Switches (Outside Groups)',
        accessor: 'switches_outside',
      },
    ],
    []
  )

  const [activeStep, setActiveStep] = useState(0)
  const [csvData, setCsvData] = useState<any[]>([])

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file: File) => {
      Papa.parse(file, {
        delimiter: ';',
        worker: true,
        header: true,
        complete(result) {
          setCsvData(result.data)
        },
      })
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: csvData,
  })

  return (
    <Layout>
      <div className="p-4">
        {activeStep === 0 && (
          <>
            <ul>
              <li>Some intro...</li>
              <li>Choose level of data submission (BASIC/COMPLETE)?</li>
              <li>Basic: only show next step for aggregate stats upload?</li>
              <li>Complete: show step for tab events upload with censoring capabilities?</li>
            </ul>
          </>
        )}

        {activeStep === 1 && (
          <>
            <div className="mb-1 border border-gray-100" {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drop some files here, or click to select files</p>
              )}
            </div>
            <TableContainer className={styles.container} component={Paper}>
              <Table size="small" {...getTableProps}>
                <TableHead>
                  {headerGroups.map((headerGroup) => (
                    <TableRow {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <TableCell {...column.getHeaderProps()}>
                          {column.render('Header')}
                        </TableCell>
                      ))}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody className={styles.tableBody} {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row)
                    return (
                      <TableRow {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                        ))}
                        <TableCell>
                          <Button>
                            <Delete />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {activeStep === 2 && (
          <>(Optional) Upload of the more critical tab events data (switches etc.) </>
        )}

        {activeStep === 3 && <>Verify files and allow submission/upload/zip download, ...</>}

        <Stepper activeStep={activeStep}>
          {STEPS.map((label, ix) => (
            <Step key={label} onClick={() => setActiveStep(ix)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    </Layout>
  )
}

export default Data
