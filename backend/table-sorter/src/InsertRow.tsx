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
This component describes the row at the bottom of a table used to insert data into the table
@params dbName: name of the database to which we should connect
@params tableName: name of the table which we should access
@params tableSel: boolean describing whether a table has been selected from the drop down or not
@params headers: a string array of the headers of the table
@params loadTable: a const used to fetch table data
*/
function InsertRow(dbName : string, tbName : string, tableSel : boolean, headers : string[], loadTable : (dbName: string, tbName: string, tableSel : boolean) => void, newRow : Map<string, string>) {
  //this post request is used to insert into the table in the database file specified in the params
  const insertRow = async (dbName : string, tbName : string, newData : {}, headers : string[]) => {
    const toSend = {
        "db_path": 'data/' + dbName,
        "tb_name": tbName,
        "new_row": newData,
        "headers": headers
    };

    let config = {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    }

    await axios.post('http://localhost:4567/insert', toSend, config)
    .then(response => {
      console.log(response.data);
      console.log("reloading table!")
      loadTable(dbName, tbName, tableSel)
    })
    .catch(error => {
      console.log(error);
    }); 
  }

  //this const describes the functionality of the insert button
  const insertButton = (dbName : string, tbName : string, newRow : Map<string, string>) =>{
    insertRow(dbName, tbName, Object.fromEntries(newRow), headers)
  }

  return (
    //build the insert row
    <tr id="insert">
      {headers.map(header => <td> {TextBox(header, '', newRow)} </td>)}
      <td><div id='insert-button'><AwesomeButton type="secondary" onPress = {() => {insertButton(dbName, tbName, newRow)}} >Insert</AwesomeButton></div></td>
    </tr>
  )
}

export default InsertRow;
