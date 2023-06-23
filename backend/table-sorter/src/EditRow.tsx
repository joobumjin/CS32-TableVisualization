import React, { Component } from 'react';
import './table.css'
import {useState, useEffect} from 'react';
import axios from 'axios';
// @ts-ignore
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import TextBox from './TextBox';
import { createImportSpecifier, ObjectFlags } from 'typescript';

/*
This component describes a row used to send edits of table data to the database file
@params dbName: name of the database to which we should connect
@params tbName: name of the table which we should access
@params row: the JavaScript object which maps headers to the row's entry / data
@params headers: a string array of the headers of the table
@params loadTable: a const used to fetch table data
@params setEdit: a react hook used to set the varible which describes the index of the row that is currently being edited
@params rowNum: a number which describes the index of the current row with respect to the table from the database
@params newRow: a Map used to associate the new data for the purposes of editing. Looks like a partial row JavaScript object.
@params oldRow: a JavaScript object used to keep track of the oldRow that will be edited.
@params setOldRow: a React Hook used to set the value of oldRow 
*/
function EditRow(dbName : string, tbName : string, tableSel : boolean, row: {}, headers : string[], loadTable : (dbName: string, tbName: string, tableSel : boolean) => void, setEdit : React.Dispatch<React.SetStateAction<number>>, rowNum : number, newRow : Map<string, string>, oldRow : {}, setOldRow :  React.Dispatch<React.SetStateAction<{}>>) {
  //this post request describes how edits should be sent to the database file
  const editRow = async (dbName : string, tbName : string, oldRow : {}, newData : {}, headers : string[], tableSel : boolean) => {
    const toSend = {
        "db_path": 'data/' + dbName,
        "tb_name": tbName,
        "old_row": oldRow,
        "new_row": newData,
        "headers": headers
    };

    let config = {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    }

    await axios.post('http://localhost:4567/update', toSend, config)
    .then(response => {
      console.log(response.data);
      console.log("reloading table!")
      loadTable(dbName, tbName, tableSel)
    })
    .catch(error => {
      console.log(error);
    }); 
  }

  //this const carries out the functionality of the edit button
  const editButton = (dbName : string, tbName : string, oldRow : {}, newRow : Map<string, string>, setEdit : React.Dispatch<React.SetStateAction<number>>, setOldRow :  React.Dispatch<React.SetStateAction<{}>>) =>{
    editRow(dbName, tbName, oldRow, Object.fromEntries(newRow), headers, tableSel)
    setEdit(-1)
    setOldRow({})
  }

  return (
    //build edit row
    <tr id={'edit row ' + rowNum.toString()}>
      {/* @ts-ignore */}
      {headers.map(header => <td> {TextBox(header, row[header], newRow)} </td>)}
      <td><AwesomeButton type="secondary" onPress = {() => {editButton(dbName, tbName, oldRow, newRow, setEdit, setOldRow)}} >Submit Edit</AwesomeButton></td>
    </tr>
  )
}

export default EditRow;
