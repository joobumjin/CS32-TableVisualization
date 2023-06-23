import React, { Component } from 'react';
import './table.css'
import {useState, useEffect} from 'react';
import axios from 'axios';
// @ts-ignore
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import { createImportSpecifier, ObjectFlags } from 'typescript';

/*
This component represents a textbox which modifies a mutable Map called newRow by adding a new entry
It associates the param header with the input from the textbox
@params header: string which describes the current header being worked with
@params curVal: the value that was already in the cell being edited
@params newRow: a Map used to associate the new data for the purposes of editing. Looks like a partial row JavaScript object.
*/
function TextBox(header : string, curVal : string, newRow : Map<string, string>) {
  //insert entry into newRow map
  const changeHandler = (event : any) => {
    newRow.set(header, event.target.value)}
  return (
    <div className="TextBox">
      <input type={'text'} onChange={changeHandler} placeholder={curVal}></input>
    </div>
  );
}
export default TextBox;
