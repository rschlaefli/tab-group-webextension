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
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'

import Layout from '@src/components/common/Layout'

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: csvData,
  })

  return (
    <Layout>
      <div className="p-4">
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
                    <TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
                  ))}
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
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Layout>
  )
}

export default Data
