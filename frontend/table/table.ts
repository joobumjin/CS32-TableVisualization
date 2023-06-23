/**
 * Type for table returned from SQL query.
 */
type tableObj = {
  [key : string] : string;
}

/**
 * Type for requesting to connect to a database.
 */
type dbRequestBody = {
  db_path : string;
}

/**
 * Type for requesting table data from a database.
 */
type tableRequestBody = {
  db_path : string;
  tb_name : string;
}

/**
 * Type for modifying table data from a database.
 */
type tableModificationRequestBody = {
  db_path : string;
  tb_name : string;
  query : string;
}

// Globals
let currentDB : string = '';
let tbNames : string[] = [];
let dbNames : string[] = ['horoscopes.sqlite3', 'kanban.sqlite3', 'movies.sqlite3'];
let tableData : Array<tableObj>;
let columnNames : Array<String> = [];

/**
 * Initializes the webpage.
 */
function initializePage() {
  const dbDropdown : HTMLElement | null = document.getElementById('db-dropdown');
  const dbDropdownLabel = document.createElement('label');

  dbDropdownLabel.innerHTML = 'Choose a database to connect: ';
  dbDropdownLabel.setAttribute('for', 'db-name');
  dbDropdown?.appendChild(dbDropdownLabel);

  const dbSelect = document.createElement('select');
  dbSelect.setAttribute('name', 'db-name');
  dbSelect.setAttribute('id', 'db-selector');

  for (let name of dbNames ) {
    const dbOption : HTMLElement = document.createElement('option');
    dbOption.setAttribute('value', name);
    dbOption.innerHTML = name;
    dbSelect.appendChild(dbOption);
  }

  dbDropdown?.appendChild(dbSelect);

  const tbDropdown : HTMLElement | null = document.getElementById('table-dropdown');
  const tbDropdownLabel = document.createElement('label');
  tbDropdownLabel.innerHTML = 'Choose a table: ';
  tbDropdownLabel.setAttribute('for', 'tb-name');
  tbDropdown?.appendChild(tbDropdownLabel);

  const tbSelect = document.createElement('select');
  tbSelect.setAttribute('name', 'tb-name');
  tbSelect.setAttribute('id', 'tb-selector');

  const emptyOption = document.createElement('option');
  tbSelect.appendChild(emptyOption);
  tbDropdown?.appendChild(tbSelect);
}

/**
 * Connects to a database on the backend.
 */
async function connectDB() {
  const dbSelector : HTMLSelectElement = document.getElementById('db-selector') as HTMLSelectElement;
  const dbName : string = dbSelector.options[dbSelector.selectedIndex].value;
  const reqBody : dbRequestBody = {
    db_path: 'data/' + dbName
  };
  const response = await fetch('http://127.0.0.1:4567/get_db', {
    method: 'post',
    body: JSON.stringify(reqBody),
    headers: { "Access-Control-Allow-Origin":"*" }
  });
  currentDB = dbName;
  tbNames = (await response.json())['tb_names'];

  const confirmation : HTMLElement | null = document.getElementById('connection-confirmation');
  if (confirmation != null) {
    confirmation.innerHTML = dbName + " database connected!";
  }
  
  loadTBNames(tbNames);
}

/**
 * Loads table names into a dropdown.
 *
 * @param names thes names of the tables available
 */
function loadTBNames(names : string[]) {
  const tbSelector : HTMLSelectElement = document.getElementById('tb-selector') as HTMLSelectElement;
  removeChildren(tbSelector);
  for (let name of names) {
    const option = document.createElement('option');
    option.setAttribute('value', name);
    option.innerHTML = name;
    tbSelector.appendChild(option);
  }
}

/**
 * Removes all child nodes from a given element.
 *
 * @param element element from which to remove all children
 */
function removeChildren(element : HTMLElement) {
  if (element != null) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}

/**
 * Loads a table from a database.
 */
async function loadTable() : Promise<void> {
  const contentDiv : HTMLElement = document.getElementById('content') as HTMLElement;
  const tbSelector : HTMLSelectElement = document.getElementById('tb-selector') as HTMLSelectElement;
  const tbName : string = tbSelector.options[tbSelector.selectedIndex].value;

  removeChildren(contentDiv);

  const reqBody : tableRequestBody = {
    db_path: 'data/' + currentDB,
    tb_name: tbName
  };

  const response = await fetch('http://127.0.0.1:4567/get_table', {
    method: 'post',
    body: JSON.stringify(reqBody),
    headers: { "Access-Control-Allow-Origin":"*" }
  });

  tableData = await response.json();
  if (contentDiv != null) {
    const tableElt : HTMLElement = document.createElement('table');
    contentDiv.appendChild(tableElt);
    const table : HTMLTableElement | null = document.querySelector("table");
    columnNames = [];
    let primaryKey : String = "";

    for (let col in tableData[0]) {
      if (col === "primary_key") {
        primaryKey = tableData[0][col];
      } else {
        columnNames.push(col);
      }
    }

    if (primaryKey != "") {
      columnNames.splice(columnNames.indexOf(primaryKey), 1)
      columnNames.unshift(primaryKey)
    }

    if (table != null) {
      buildTableHeader(table, columnNames);
      populateTable(table, tableData, columnNames);
    }
    updateModificationFields();
  }
}

/**
 * Constructs the header for a table.
 *
 * @param table table for which to construct a header
 * @param colNames the names of each column in the table
 */
function buildTableHeader(table : HTMLTableElement, colNames : Array<String>) : void {
  let headerRow : HTMLTableRowElement = table.createTHead().insertRow();
  for (let name of colNames) {
    let th : HTMLTableCellElement = document.createElement('th');
    th.innerHTML += name;
    headerRow.append(th);
  }
}

/**
 * Populates the table with data from a query.
 *
 * @param table table to populate
 * @param data data with which to populate the table
 * @param colNames the names of each column in the table
 */
function populateTable(table : HTMLTableElement, data : Array<tableObj>, colNames : Array<String>) : void {
  let tableBody : HTMLTableSectionElement = table.createTBody();
  for (let obj of data) {
    let row : HTMLTableRowElement = tableBody.insertRow();
    for (let name of colNames) {
      let td : HTMLTableCellElement = document.createElement('td');
      td.innerHTML = obj[name.toString()];
      row.appendChild(td);
    }
  }
}

/**
 * Checks if a database has been loaded from the REPL.
 */
async function checkLoadedFromREPL() {
  const response = await (await fetch('http://127.0.0.1:4567/get_loaded')).json();
  const regex =  /\/.+\..+/g;
  const fromREPL : string = response['from_repl'];
  const loaded : string = response['loaded']
  const dbPath = response['db_path'];
  const curTable = response['cur_table'];

  if (fromREPL === 'true' && loaded === 'true') {
    const dbName : string = dbPath.match(regex)[0].replace("/","");
    console.log(dbName);
    const reqBody : dbRequestBody = {
      db_path: 'data/' + dbName
    };

    const response = await fetch('http://127.0.0.1:4567/get_db', {
      method: 'post',
      body: JSON.stringify(reqBody),
      headers: { "Access-Control-Allow-Origin":"*" }
    });

    currentDB = dbName;
    const dbIdx : number = dbNames.indexOf(dbName);
    const dbSelector : HTMLSelectElement = document.getElementById('db-selector') as HTMLSelectElement;
    dbSelector.selectedIndex = dbIdx;

    tbNames = (await response.json())['tb_names'];

    const confirmation : HTMLElement | null = document.getElementById('connection-confirmation');
    if (confirmation != null) {
      confirmation.innerHTML = dbName + " database connected from REPL!";
    }

    loadTBNames(tbNames);

    const tbIdx : number = tbNames.indexOf(curTable);
    const tbSelector : HTMLSelectElement = document.getElementById('tb-selector') as HTMLSelectElement;
    tbSelector.selectedIndex = tbIdx;
  }
}

/**
 * Updates the modification fields based on the selected SQL modifier.
 */
function updateModificationFields() {
  const modSelector : HTMLSelectElement = document.getElementById('modification-selector') as HTMLSelectElement;
  const modName : string = modSelector.options[modSelector.selectedIndex].value;

  removeModificationFields();
  switch (modName) {
    case "INSERT":
      addInsertFields();
      break;
    
    case "UPDATE":
      addUpdateFields();
      break;
    
    case "DELETE":
      addDeleteFields();
      break;
    
    default:
      removeModificationFields();
  }
}

/**
 * Remove modification fields.
 */
function removeModificationFields() {
  const modDiv : HTMLElement = document.getElementById('modification-div') as HTMLElement;
  while (modDiv.children.length > 3) {
    modDiv.children[modDiv.children.length - 2].remove();
  }
}

/**
 * Adds modification fields for INSERT SQL command.
 */
function addInsertFields() {
  const modDiv : HTMLElement = document.getElementById('modification-div') as HTMLElement;
  for (let name of columnNames) {
    const newInput = document.createElement('input');
    newInput.setAttribute('type', 'text');
    newInput.setAttribute('placeholder', 'value for ' + name);
    modDiv.insertBefore(newInput, modDiv.children[modDiv.children.length - 1]);
  }
}

/**
 * Adds modification inputs for DELETE SQL command.
 */
function addDeleteFields() {
  const modDiv : HTMLElement = document.getElementById('modification-div') as HTMLElement;
  const newInput = document.createElement('input');
  newInput.setAttribute('type', 'text');
  newInput.setAttribute('placeholder', 'row number to remove');
  modDiv.insertBefore(newInput, modDiv.children[modDiv.children.length - 1]);
}

/**
 * Adds modification field for UPDATE SQL command.
 */
function addUpdateFields() {
  const modDiv : HTMLElement = document.getElementById('modification-div') as HTMLElement;
  const newInput = document.createElement('input');
  newInput.setAttribute('type', 'text');
  newInput.setAttribute('placeholder', 'row number to update');
  modDiv.insertBefore(newInput, modDiv.children[modDiv.children.length - 1]);
  for (let name of columnNames) {
    const newInput = document.createElement('input');
    newInput.setAttribute('type', 'text');
    newInput.setAttribute('placeholder', 'value for ' + name);
    modDiv.insertBefore(newInput, modDiv.children[modDiv.children.length - 1]);
  }
}


/**
 * Applies modification to connected SQL database.
 */
function applyModification() {
  // makes request
}


/**
 * Function to run on start.
 */
function main() {
  initializePage();
  const dbLoadButton : HTMLElement = document.getElementById('db-loader') as HTMLElement;
  dbLoadButton.addEventListener('click', connectDB);

  const dbSelector : HTMLSelectElement = document.getElementById('db-selector') as HTMLSelectElement;
  dbSelector.addEventListener('change', connectDB);

  const tbLoadButton : HTMLElement = document.getElementById('table-loader') as HTMLElement;
  tbLoadButton.addEventListener('click', loadTable);

  const tbClearButton : HTMLElement = document.getElementById('clear-table') as HTMLElement;
  tbClearButton.addEventListener('click', () => {
    const contentDiv : HTMLElement = document.getElementById('content') as HTMLElement;
    removeChildren(contentDiv)
  });

  const modSelector : HTMLSelectElement = document.getElementById('modification-selector') as HTMLSelectElement;
  modSelector.addEventListener('change', updateModificationFields);


  const demoBtn : HTMLButtonElement = document.getElementById('demo-btn') as HTMLButtonElement;
  demoBtn.addEventListener('click', () => fetch('http://127.0.0.1:4567/demo'));

  setInterval(checkLoadedFromREPL, 1000);
}

main();