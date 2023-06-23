import React, { Component } from 'react';
import './table.css'
import {useState, useEffect} from 'react';
import axios from 'axios';
// @ts-ignore
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import TextBox from './TextBox';
import HeaderRow from './HeaderRow';
import EditRow from './EditRow';
import InsertRow from './InsertRow';
import TableRow from './TableRow';
import { createImportSpecifier, ObjectFlags } from 'typescript';

/* This component is used to retreive, visualize, and modify the table data 
@author Bumjin Joo
@params dbName: name of the database to which we should connect
@params tableName: name of the table which we should access
@params tableSel: boolean describing whether a table has been selected from the drop down or not
@params tbData: an array of JavaScript objects that describe each row in the table
@params setTBData: a react hook used to set the tb data
@params headers: a string array of the headers of the table
@params setheaders: a react hook used to set the array of headers
@params sort: a boolean describing whether the table data should be sorted or not
@params setSort: a react hook used to set sort
*/
function DisplayTable(dbName : string, tableName : string, tableSel : boolean,
  tbData: {}[], setTBData: React.Dispatch<React.SetStateAction<{}[]>>, 
  headers: string[], setHeaders: React.Dispatch<React.SetStateAction<string[]>>,
  sort: boolean, setSort: React.Dispatch<React.SetStateAction<boolean>>, clear: () => void){

  //update the headers once tabledata changes
  useEffect(() => {
    if (tbData && tbData[0]) {setHeaders(Object.keys(tbData[0]))}
  }, [tbData])

  //asynchronous post request to get the table data from the get_table endpoint 
  const loadTable = async (dbName : string, tbName : string, tableSel : boolean) => {
    if (tableSel) {
      //build the json to send to the endpoint
      const toSend = {
        "db_path": 'data/' + dbName,
        "tb_name": tbName
      };

      let config = {
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      }

      //await the response of retreiving the table
      await axios.post('http://localhost:4567/get_table', toSend, config)
      .then(response => {
        //update table data
        setTBData(response.data);
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  return (
    <div id='table-and-buttons'>
      {/* Create buttons to load and clear table */}
      <div id='buttons'><AwesomeButton type="primary" onPress = {() => loadTable(dbName, tableName, tableSel)} >Load Table</AwesomeButton><AwesomeButton type="primary" onPress = {() => clear()} >Clear Table</AwesomeButton></div>
      {/* Create table! */}
      <div id='table-data'>{Table(tbData, dbName, tableName, tableSel, headers, loadTable, sort, setSort)} </div>
    </div>
  )
}

/* 
This class represents the visualized table
@params tableData: an array of JavaScript objects that describe each row in the table
@params dbName: name of the database to which we should connect
@params tableName: name of the table which we should access
@params tableSel: boolean describing whether a table has been selected from the drop down or not
@params headers: a string array of the headers of the table
@params loadTable: a const used to fetch table data
@params sort: a boolean describing whether the table data should be sorted or not
@params setSort: a react hook used to set sort
*/
function Table(tableData : {}[], dbName : string, tbName : string, tableSel : boolean,
  headers : string[], 
  loadTable : (dbName: string, tbName: string, tableSel : boolean) => void, 
  sort : boolean, setSort :  React.Dispatch<React.SetStateAction<boolean>>) {

    const [editRow, setEditRow] = useState(-1)
    const [oldRow, setOldRow] = useState({})
    const newRow = new Map()
    const [ascend, setAscend] = useState(false) 
    const [sortHeader, setSortHeader] = useState('')

    const storedTableData = tableData

    const sortTable = (header : string, ascend : boolean) => {
      storedTableData.sort((a,b) => 
        {
          {/* @ts-ignore */}
          if (isNaN(Number(a[header])) || isNaN(Number(b[header]))) {
          {if (!ascend) {
            {/* @ts-ignore */}
            return b[header].localeCompare(a[header])
          } else {
            {/* @ts-ignore */}
            return a[header].localeCompare(b[header])
          }}
        } else {
          if (ascend) {
            {/* @ts-ignore */}
            return Number(a[header]) - Number(b[header])
          } else {
            {/* @ts-ignore */}
          return Number(b[header]) - Number(a[header])}
        }}
      )
    }

    return (
      <div id="display-table">
        <table>
          <thead>
            {storedTableData && storedTableData[0] && HeaderRow(storedTableData[0], sort, setSort, ascend, setAscend, sortHeader, setSortHeader, sortTable)}
          </thead>
          <tbody>
          {storedTableData.map((row, rowInd) =>  ((editRow === rowInd) ? (EditRow(dbName, tbName, tableSel, row, headers, loadTable, setEditRow, rowInd, newRow, oldRow, setOldRow)) : (TableRow(dbName, tbName, tableSel, row, headers, loadTable, editRow, setEditRow, rowInd, newRow, setOldRow))))}
          {storedTableData && storedTableData[0] && (editRow === -1) && InsertRow(dbName, tbName, tableSel, headers, loadTable, newRow)}
          </tbody>
        </table>
      </div>
    )
}

export default DisplayTable;