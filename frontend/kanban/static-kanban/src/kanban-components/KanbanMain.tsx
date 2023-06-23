import React, { useState } from 'react';

import KanbanVis from './KanbanVis';

import './Kanban.css';

/**
 * Container for the Kanban Visualization.
 */
function KanbanMain() {
    const dbNames = ['potluck_kanban.sqlite3', 'student_kanban.sqlite3'];
    // init consts
    const [curDB, setCurDB] = useState("");
    const [dbSel, setDBSel] = useState(false);

    const [dbMessage, setDBMessage] = useState('Database not connected');

    // use to handle any changes to the currently selected db
    const handleDBChange = ((event : any) => {
        // select the db
        console.log('db selected: ' + event.target.value);
        setCurDB(event.target.value);
        setDBSel(true);
        setDBMessage(event.target.value + ' database connected!');
    });

    return (
        <div className="kanban-main" key={"kanban_main"}>
            <header className="App-header">
                {/* get and display database names */}
                <form>
                    <label>
                        Choose a database to connect:
                        <select onChange={handleDBChange}>
                            <option disabled={dbSel}> Select Database </option>
                            {dbNames.map((fileName: string) =>
                                (<option key={fileName}> {fileName} </option>)
                            )}
                        </select>
                    </label>
                </form>
                {dbMessage}

                {KanbanVis(curDB)}
            </header>
        </div>
    );
}

export default KanbanMain;
