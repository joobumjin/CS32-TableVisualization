import React from 'react';

import Block from './Block';

import './Column.css';

/**
 * Renders a column of data into Block components and returns it
 * @param id the id of the column
 * @param blockInfo a mapping of block ids to block information
 */
function Column(id: string, name: string, blockInfo: Array<Array<string>>, tagInfo: Map<string, Array<{}>>) {
    for (const block in blockInfo.values()) {
        if (!tagInfo.has(block[0])) {
            tagInfo.set(block[0], new Array<{}>())
        }
    }

    return (
        <div className={'column'} id={'column_id:' + id}>
            <div className={'column-title'} id={'column-title:'+ id}>
                {name}
            </div>
            <div className={'column_content'} id={'column_content:' + id}>
                {blockInfo.map((block: Array<string>) => (
                    Block(block[0], block[1], block[2], block[3], tagInfo.get(block[0])!)
                ))}
            </div>
        </div>
    );
}

export default Column;