"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Globals
let currentDB = '';
let tbNames = [];
let dbNames = ['horoscopes.sqlite3', 'kanban.sqlite3', 'movies.sqlite3'];
let tableData;
let columnNames = [];
/**
 * Initializes the webpage.
 */
function initializePage() {
    const dbDropdown = document.getElementById('db-dropdown');
    const dbDropdownLabel = document.createElement('label');
    dbDropdownLabel.innerHTML = 'Choose a database to connect: ';
    dbDropdownLabel.setAttribute('for', 'db-name');
    dbDropdown === null || dbDropdown === void 0 ? void 0 : dbDropdown.appendChild(dbDropdownLabel);
    const dbSelect = document.createElement('select');
    dbSelect.setAttribute('name', 'db-name');
    dbSelect.setAttribute('id', 'db-selector');
    for (let name of dbNames) {
        const dbOption = document.createElement('option');
        dbOption.setAttribute('value', name);
        dbOption.innerHTML = name;
        dbSelect.appendChild(dbOption);
    }
    dbDropdown === null || dbDropdown === void 0 ? void 0 : dbDropdown.appendChild(dbSelect);
    const tbDropdown = document.getElementById('table-dropdown');
    const tbDropdownLabel = document.createElement('label');
    tbDropdownLabel.innerHTML = 'Choose a table: ';
    tbDropdownLabel.setAttribute('for', 'tb-name');
    tbDropdown === null || tbDropdown === void 0 ? void 0 : tbDropdown.appendChild(tbDropdownLabel);
    const tbSelect = document.createElement('select');
    tbSelect.setAttribute('name', 'tb-name');
    tbSelect.setAttribute('id', 'tb-selector');
    const emptyOption = document.createElement('option');
    tbSelect.appendChild(emptyOption);
    tbDropdown === null || tbDropdown === void 0 ? void 0 : tbDropdown.appendChild(tbSelect);
}
/**
 * Connects to a database on the backend.
 */
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const dbSelector = document.getElementById('db-selector');
        const dbName = dbSelector.options[dbSelector.selectedIndex].value;
        const reqBody = {
            db_path: 'data/' + dbName
        };
        const response = yield fetch('http://127.0.0.1:4567/get_db', {
            method: 'post',
            body: JSON.stringify(reqBody),
            headers: { "Access-Control-Allow-Origin": "*" }
        });
        currentDB = dbName;
        tbNames = (yield response.json())['tb_names'];
        const confirmation = document.getElementById('connection-confirmation');
        if (confirmation != null) {
            confirmation.innerHTML = dbName + " database connected!";
        }
        loadTBNames(tbNames);
    });
}
/**
 * Loads table names into a dropdown.
 *
 * @param names thes names of the tables available
 */
function loadTBNames(names) {
    const tbSelector = document.getElementById('tb-selector');
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
function removeChildren(element) {
    if (element != null) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}
/**
 * Loads a table from a database.
 */
function loadTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const contentDiv = document.getElementById('content');
        const tbSelector = document.getElementById('tb-selector');
        const tbName = tbSelector.options[tbSelector.selectedIndex].value;
        removeChildren(contentDiv);
        const reqBody = {
            db_path: 'data/' + currentDB,
            tb_name: tbName
        };
        const response = yield fetch('http://127.0.0.1:4567/get_table', {
            method: 'post',
            body: JSON.stringify(reqBody),
            headers: { "Access-Control-Allow-Origin": "*" }
        });
        tableData = yield response.json();
        if (contentDiv != null) {
            const tableElt = document.createElement('table');
            contentDiv.appendChild(tableElt);
            const table = document.querySelector("table");
            columnNames = [];
            let primaryKey = "";
            for (let col in tableData[0]) {
                if (col === "primary_key") {
                    primaryKey = tableData[0][col];
                }
                else {
                    columnNames.push(col);
                }
            }
            if (primaryKey != "") {
                columnNames.splice(columnNames.indexOf(primaryKey), 1);
                columnNames.unshift(primaryKey);
            }
            if (table != null) {
                buildTableHeader(table, columnNames);
                populateTable(table, tableData, columnNames);
            }
            updateModificationFields();
        }
    });
}
/**
 * Constructs the header for a table.
 *
 * @param table table for which to construct a header
 * @param colNames the names of each column in the table
 */
function buildTableHeader(table, colNames) {
    let headerRow = table.createTHead().insertRow();
    for (let name of colNames) {
        let th = document.createElement('th');
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
function populateTable(table, data, colNames) {
    let tableBody = table.createTBody();
    for (let obj of data) {
        let row = tableBody.insertRow();
        for (let name of colNames) {
            let td = document.createElement('td');
            td.innerHTML = obj[name.toString()];
            row.appendChild(td);
        }
    }
}
/**
 * Checks if a database has been loaded from the REPL.
 */
function checkLoadedFromREPL() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (yield fetch('http://127.0.0.1:4567/get_loaded')).json();
        const regex = /\/.+\..+/g;
        const fromREPL = response['from_repl'];
        const loaded = response['loaded'];
        const dbPath = response['db_path'];
        const curTable = response['cur_table'];
        if (fromREPL === 'true' && loaded === 'true') {
            const dbName = dbPath.match(regex)[0].replace("/", "");
            console.log(dbName);
            const reqBody = {
                db_path: 'data/' + dbName
            };
            const response = yield fetch('http://127.0.0.1:4567/get_db', {
                method: 'post',
                body: JSON.stringify(reqBody),
                headers: { "Access-Control-Allow-Origin": "*" }
            });
            currentDB = dbName;
            const dbIdx = dbNames.indexOf(dbName);
            const dbSelector = document.getElementById('db-selector');
            dbSelector.selectedIndex = dbIdx;
            tbNames = (yield response.json())['tb_names'];
            const confirmation = document.getElementById('connection-confirmation');
            if (confirmation != null) {
                confirmation.innerHTML = dbName + " database connected from REPL!";
            }
            loadTBNames(tbNames);
            const tbIdx = tbNames.indexOf(curTable);
            const tbSelector = document.getElementById('tb-selector');
            tbSelector.selectedIndex = tbIdx;
        }
    });
}
/**
 * Updates the modification fields based on the selected SQL modifier.
 */
function updateModificationFields() {
    const modSelector = document.getElementById('modification-selector');
    const modName = modSelector.options[modSelector.selectedIndex].value;
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
    const modDiv = document.getElementById('modification-div');
    while (modDiv.children.length > 3) {
        modDiv.children[modDiv.children.length - 2].remove();
    }
}
/**
 * Adds modification fields for INSERT SQL command.
 */
function addInsertFields() {
    const modDiv = document.getElementById('modification-div');
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
    const modDiv = document.getElementById('modification-div');
    const newInput = document.createElement('input');
    newInput.setAttribute('type', 'text');
    newInput.setAttribute('placeholder', 'row number to remove');
    modDiv.insertBefore(newInput, modDiv.children[modDiv.children.length - 1]);
}
/**
 * Adds modification field for UPDATE SQL command.
 */
function addUpdateFields() {
    const modDiv = document.getElementById('modification-div');
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
    const dbLoadButton = document.getElementById('db-loader');
    dbLoadButton.addEventListener('click', connectDB);
    const dbSelector = document.getElementById('db-selector');
    dbSelector.addEventListener('change', connectDB);
    const tbLoadButton = document.getElementById('table-loader');
    tbLoadButton.addEventListener('click', loadTable);
    const tbClearButton = document.getElementById('clear-table');
    tbClearButton.addEventListener('click', () => {
        const contentDiv = document.getElementById('content');
        removeChildren(contentDiv);
    });
    const modSelector = document.getElementById('modification-selector');
    modSelector.addEventListener('change', updateModificationFields);
    const demoBtn = document.getElementById('demo-btn');
    demoBtn.addEventListener('click', () => fetch('http://127.0.0.1:4567/demo'));
    setInterval(checkLoadedFromREPL, 1000);
}
main();
