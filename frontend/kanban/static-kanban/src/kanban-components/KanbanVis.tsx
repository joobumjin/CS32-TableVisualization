import React, {SetStateAction, useState } from 'react';
import axios from 'axios';

import Column from './Column';

import './Kanban.css';

// keeps track of the loaded table data
let blockTable: Array<Object> = new Array<Object>();
let columnTable: Array<Object> = new Array<Object>();
let tagsTable: Array<Object> = new Array<Object>();

/**
 * The Kanban Visualizer
 * @param curDB the current database file
 */
function KanbanVis(curDB: string) {
    const [loadedTables, setLoadedTables] = useState(false);

    // maintains order of columns in kanban
    let columnOrder: Array<string> = new Array<string>();
    // maintains all block information (map from column name to all of its blocks)
    let blockStorage: Map<string, Array<Array<string>>> = new Map<string, Array<Array<string>>>();
    // maintains all tag information (map from block id to array of tags)
    let tags: Map<string, Array<{}>> = new Map<string, Array<{}>>();

    // load all of the pertinent tables
    if (curDB) {
        loadTables(curDB, setLoadedTables);
        console.log(blockTable);
    }

    // only create columns if we've loaded a table
    if (loadedTables) {
        for (let i = 0; i < columnTable.length; i++) {
            // order: name, index (IGNORE), id (IGNORE)
            // (assuming they're in sequential order for simplicity)
            const c: string[] = Object.values(columnTable[i]);
            columnOrder.push(c[0]);
            blockStorage.set(c[0], new Array<Array<string>>());
        }

        for (let i = 0; i < tagsTable.length; i++) {
            // order: tag name, "block_id" (uh? IGNORE), tag value, block id
            const t: string[] = Object.values(tagsTable[i]);
            const blockID: string = t[3];
            const tagName: string = t[0];
            const tagValue: string = t[2];

            if (!tags.has(blockID)) {
                tags.set(blockID, new Array<{}>());
            }
            tags.get(blockID)!.push({"label": tagName, "value": tagValue});
        }

        for (let i = 0; i < blockTable.length; i++) {
            // order: title, date, column index, content, primary key (IGNORE), id
            const b: string[] = Object.values(blockTable[i]);
            const col: string = columnOrder[parseInt(b[2]) - 1];
            blockStorage.get(col)!.push(new Array<string>(b[5], b[0], b[3], b[1]));
        }
    }

    return (
        <div className={"kanban-vis"} key={"kanban_vis"}>
            {columnOrder.map((column, index) => (
                <div className={"column"}>
                    {(Column(index.toString(), column, blockStorage.get(column)!, tags))}
                </div>
            ))}
        </div>
    );
}

/**
 * Loads in tables from the backend.
 * @param dbName the database name
 * @param doneLoadingHook the state hook to update when done
 */
async function loadTables(dbName: string, doneLoadingHook: React.Dispatch<SetStateAction<boolean>>): Promise<void> {
    const getDB = async (dbName: string) => {
        //build the json to send to the endpoint
        const toSend = {
            "db_path": 'data/' + dbName,
        };

        let config = {
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*',
            }
        }
        // await the response of retreiving the table
        await axios.post('http://localhost:4567/get_db', toSend, config)
            .then(() => {
                return;
            })
            .catch(error => {
                console.log(error);
                return;
            });
    }
    const getTable = async (dbName: string, tbName: string, updater: (arg: Array<Object>) => Promise<void>) => {
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
        // await the response of retreiving the table
        await axios.post('http://localhost:4567/get_table', toSend, config)
            .then(async response => {
                //update table data
                await updater(response.data.slice(0));
                return;
            })
            .catch(error => {
                console.log(error);
                return;
            });
    }
    const updateBlock = async (table: Array<Object>): Promise<void> => {
        console.log(table);
        blockTable = table;
    }
    const updateColumn = async (table: Array<Object>): Promise<void> => {
        columnTable = table;
    }
    const updateTags = async (table: Array<Object>): Promise<void> => {
        tagsTable = table;
    }

    await getDB(dbName);
    await getTable(dbName, "block", updateBlock)
    await getTable(dbName, "column", updateColumn);
    await getTable(dbName, "tags", updateTags);
    doneLoadingHook(true);
}

export default KanbanVis;