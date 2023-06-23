import React, { Component } from 'react';
import './table.css'
import {useState, useEffect} from 'react';
import axios from 'axios';
// @ts-ignore
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import { createImportSpecifier, ObjectFlags } from 'typescript';

/*
This class represents a singular, visualized row in the table 
@params dbName: name of the database to which we should connect
@params tbName: name of the table which we should access
@params tableSel: boolean describing whether a table has been selected from the drop down or not
@params row: the JavaScript object which maps headers to the row's entry / data
@params headers: a string array of the headers of the table
@params loadTable: a const used to fetch table data
@params editRow: the index of the row which is being edited
@params setEdit: a react hook used to set the varible which describes the index of the row that is currently being edited
@params rowNum: a number which describes the index of the current row with respect to the table from the database
@params newRow: a Map used to associate the new data for the purposes of editing. Looks like a partial row JavaScript object.
@params setOldRow: a React Hook used to set the value of oldRow 
*/
function TableRow(dbName : string, tbName : string, tableSel : boolean,
  row : {}, headers : string[], 
  loadTable : (dbName: string, tbName: string, tableSel : boolean) => void, 
  editRow : number, setEdit : React.Dispatch<React.SetStateAction<number>>, 
  rowNum : number, newRow : Map<string, string>, setOldRow : React.Dispatch<React.SetStateAction<{}>>) {
  const rowIndex = rowNum

  // this deletes a row from the table in the database file and then refreshes the table data
  const deleteRow = async (dbName : string, tbName : string, row : {}, headers : string[]) => {
    const toSend = {
        "db_path": 'data/' + dbName,
        "tb_name": tbName,
        "row": row,
        "headers": headers
    };

    let config = {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    }

    await axios.post('http://localhost:4567/delete', toSend, config)
    .then(response => {
      console.log(response.data);
      console.log("reloading table!")
      loadTable(dbName, tbName, tableSel)
    })
    .catch(error => {
      console.log(error);
    }); 
  }

  //this represents the functionality of the delete button and simply calls the delete row const above
  const deleteButton = (dbName : string, tbName : string, row : {}, headers : string[]) => {
    deleteRow(dbName, tbName, row, headers)
  }

  //this represents the functionality of the edit button, enables the editing row, does not actually send post request
  const editButton = (dbName : string, tbName : string) =>{
    setOldRow(row)
    setEdit(rowIndex)
    loadTable(dbName, tbName, tableSel)
  }

  return ( 
    <tr id={'row ' + rowNum.toString()}>
      {/* @ts-ignore */}
      { Object.keys(row).map((key) => (<td key={key}>{row[key]}</td>)) }
      {/* {editButton} */}
      {(editRow === -1) && <td id='edit-button'><AwesomeButton type="secondary" onPress = {() => {editButton(dbName, tbName)}} >Edit</AwesomeButton></td>}
      {(editRow === -1) && <td id='delete-button'><AwesomeButton type="secondary" onPress = {() => {deleteButton(dbName, tbName, row, headers)}} >Delete</AwesomeButton></td>}
    </tr>
  )
}

export default TableRow;
