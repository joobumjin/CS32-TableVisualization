import React from 'react';

import KanbanMain from './kanban-components/KanbanMain';

import './App.css';

/**
 * App container
 */
function App() {
    return (
        <div className="App-header">
            <h1>Sprint 4 Kanban Visualization</h1>
            <KanbanMain/>
        </div>
    );
}

export default App;
