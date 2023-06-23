import React from 'react';

import './Block.css';

/**
 * Returns a static kanban card.
 * @param id the block's id
 * @param title the block's title
 * @param content the block's content
 * @param date the block's date
 */
function Block(id: string, title: string, content: string, date: string, tags: Array<{}>) {
    if (!tags) {
        tags = new Array<{}>();
    }

    return (
        <div className={'block'} id={'block_id:' + id}>
            <div className={'block_title'} id={'block_title:' + id}>
                {title}
            </div>
            <div className={'block_content'} id={'block_content:' + id}>
                {content}
            </div>
            <div className={'block_date'} id={'block_date:' + id} hidden={true}>
                {date}
            </div>
            <div className={'block_tags'} id={'block_tags:' + id}>
                {tags.map((tag: {[key: string]: string}) => (
                    <div className={'block_tag'}>
                            tag: {tag["label"]} ({tag["value"]})
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Block;