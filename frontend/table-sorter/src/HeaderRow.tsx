import React, { Component } from 'react';
import './table.css'
import {useState, useEffect} from 'react';
import axios from 'axios';
// @ts-ignore
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import { createImportSpecifier, ObjectFlags } from 'typescript';

/*
This function represents the header row of the table
@params row: the JavaScript object which maps headers to the row's entry / data
@params sort: a boolean describing whether the table data should be sorted or not
@params setSort: a react hook used to set sort
@params ascend: a boolean which describes if the data should be sorted in ascending order or not
@params setAscend: a React Hook used to set the value of ascend
@params sortHeader: the header by which the table should be sorted by
@params setSortHeader: a React Hook used to set the value of sortHeader
@params sorter: a const which sorts an array of rows 
*/
function HeaderRow(row : {}, sort : boolean, setSort : React.Dispatch<React.SetStateAction<boolean>>, ascend : boolean, setAscend : React.Dispatch<React.SetStateAction<boolean>>, sortHeader : string, setSortHeader : React.Dispatch<React.SetStateAction<string>>, sorter :  (header: string, ascend : boolean) => void) {
  //this button switches whether the data should be sorted or not
  const sortButton = (sort : boolean, setSort : React.Dispatch<React.SetStateAction<boolean>>, setAscend : React.Dispatch<React.SetStateAction<boolean>>, header : string, setSortHeader : React.Dispatch<React.SetStateAction<string>>) => {
    setSort(!sort)
    setAscend(true)
    setSortHeader(header)
    if (!sort) {
      sorter(header, true)
    }
  }

  // this button switches whether or not the sort order should be ascending
  const ascendButton = (sort : boolean, header : string, ascend : boolean, setAscend : React.Dispatch<React.SetStateAction<boolean>>) => {
    setAscend(!ascend)
    if (sort) {
      sorter(header, !ascend)
    }
  }

  return (
    <tr id="headers">
      {/* Map an object to its keys (which in a table represents the headers) */}
      {/* @ts-ignore */}
      { Object.keys(row).map((key, headerInd) => 
        (<th id={"header " + headerInd} key={key}>
          {((!sort) || (key === sortHeader)) ? <AwesomeButton type="primary" onPress = {() => {sortButton(sort, setSort, setAscend, key, setSortHeader)}}>{key}</AwesomeButton> : key}
          {((sort) && (key === sortHeader)) ? <AwesomeButton type="secondary" onPress = {() => {ascendButton(sort, key, ascend, setAscend)}}>{ascend ? 	"\u25B2" : '\u25BC'}</AwesomeButton> : <></>}
        </th>)) 
      }
      {/* Extend the header row to have the entire row have consistent formatting */}
      <th/>
      <th/>
    </tr>
  )
}

export default HeaderRow;
