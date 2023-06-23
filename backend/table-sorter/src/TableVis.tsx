import React, { Component } from 'react';
import './table.css'
import displayTable from './DisplayTable';
import {useState} from 'react';
import axios from 'axios';
// @ts-ignore
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";

const dbNames = ['horoscopes.sqlite3', 'kanban.sqlite3', 'movies.sqlite3'];

/*
This is the main component used throughout the react app
*/
function TableVis() {
  //init consts
  const [curDB, setCurDB] = useState('');
  const [curTB, setCurTB] = useState('');
  const [dbSel, setDBSel] = useState(false);
  const [tbSel, setTBSel] = useState(false);

  const [tbNames, setTbNames] = useState([]);
  const [dbMessage, setDBMessage] = useState('Database not connected');
  // use to handle any changes to the currently selected db
  const handleDBChange=((event : any)=>{
    //select the db
    setCurDB(event.target.value)
    setDBSel(true)
    
    //reset the table selection
    setTBSel(false)
    setCurTB('')
    setDBMessage('Database not connected')
    setTBMessage('Table not loaded')
    setTbNames([])
    clear()
  })

  // connect to the backend to load the database file
  const loadDB = (dbName : string) => {
    if (dbSel) {
      const toSend = {
        "db_path": 'data/' + dbName
      };

      let config = {
          headers: {
              "Content-Type": "application/json",
              'Access-Control-Allow-Origin': '*',
          }
      }

      axios.post('http://localhost:4567/get_db', toSend, config)
      .then(response => {
          //console.log(response.data);
          setTbNames(response.data['tb_names']);
          setDBMessage(dbName + ' database connected!')
      })
      .catch(error => {
          console.log(error);
      });
    }
  }

  const [tbMessage, setTBMessage] = useState('Table not loaded');
  // use to handle any changes to the currently selected table
  const handleTBChange=((event : any)=>{
    //console.log('tb selected: ' + event.target.value);
    setTBSel(true);
    setCurTB(event.target.value);
    clear()
    setTBMessage(event.target.value + ' table loaded!')
  })

  // keeps track of the table data
  const [tbData, setTBData] = useState<{}[]>([]);

  //keep track of the headers of the current table in table data
  const [headers, setHeaders] = useState<string[]>([]);

  const [sort, setSort] = useState(false)

  const clear = () => {
    setTBData([])
    setHeaders([])
    setSort(false)
  }

  return (
    <div className="TableVis">
      <header className="App-header">
        {/* get and display database names */}
        <form >
          <label>
          Choose a database to connect: 
          <select id='db-selector' onChange={handleDBChange}>
            <option disabled={dbSel}> Select Database </option>
           {(dbNames.map((fileName : string) => (<option key={fileName}>{fileName}</option>)))}
          </select>
          </label>
        </form>
        <AwesomeButton id='db-loader' type='primary' onPress = {() => loadDB(curDB)}>Connect Database</AwesomeButton><span id="connection-confirmation">{dbMessage}</span>
        
        {/* get and display table names */}
        <form>
          <label>
            Choose a table: 
            <select id='tb-selector' onChange={handleTBChange}>
              <option disabled={tbSel}> Select Table </option>
              {(tbNames.map((tbName : string) => (<option key={tbName}>{tbName}</option>)))}
            </select>
          </label>
        </form>
        <span id='tb-confirmation'>{tbMessage}</span>
        {/* display table */}
        {displayTable(curDB, curTB, tbSel, tbData, setTBData, headers, setHeaders, sort, setSort, clear)}
      </header>
    </div>
  );
}

export default TableVis;
