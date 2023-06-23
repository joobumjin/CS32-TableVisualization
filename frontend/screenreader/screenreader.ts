/**
 * A screen reader for use with HTML files with the following tags:
 * <ul>
 *     <li> Metadata </li>
 *     <ul>
 *         <li> &lt;title> </li>
 *     </ul>
 * </ul>
 * <ul>
 *     <li> Text </li>
 *     <ul>
 *         <li> &lt;h1>, &lt;h2>, …, &lt;h6> </li>
 *         <li> &lt;p> </li>
 *     </ul>
 * </ul>
 * <ul>
 *     <li> Graphics </li>
 *     <ul>
 *         <li> &lt;img> </li>
 *     </ul>
 * </ul>
 * <ul>
 *     <li> Interactive </li>
 *     <ul>
 *         <li> &lt;a> </li>
 *         <li> &lt;input> </li>
 *         <li> &lt;button> </li>
 *     </ul>
 * </ul>
 * <ul>
 *     <li> Tables </li>
 *     <ul>
 *         <li> &lt;table> </li>
 *         <li> &lt;caption> </li>
 *         <li> &lt;td> </li>
 *         <li> &lt;tfoot> </li>
 *         <li> &lt;th> </li>
 *         <li> &lt;tr> </li>
 *     </ul>
 * </ul>
 * Features supported:
 * <ul>
 *     <li> Start reading document (SPACE) </li>
 *     <li> Pause / Resume (p) </li>
 *     <li> Speed up / slow down (ArrowRight / ArrowLeft) </li>
 * </ul>
 *
 * @author mason-burke
 */


// ----------------------------- GLOBAL VARIABLES ----------------------------
/**
 * An instance of the Web Speech API
 * (https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
 * Initialized when the window first loads
 */
let VOICE_SYNTH: SpeechSynthesis;

/**
 * The current speaking rate of the screen reader
 * When updated, takes effect at the
 * start of the next utterance
 */
let VOICE_RATE: number;

/**
 * Stores element types and their handler functions
 * These handlers take in an HTMLElement, and return
 * a string representation for uttering
 */
let ELEMENT_HANDLERS: Map<string, (ele: HTMLElement) => string>;

/**
 * Stores element types for interactive processing
 * If we have an element in here, we'll await a response
 * from the respective handler
 */
let ASYNC_HANDLERS: Map<string, (ele: HTMLElement) => Promise<void>>;

/**
 * A list of IDs in order of appearance in the DOM,
 * used to order the elements sequentially and
 * for moving to the next or previous element
 */
let ids: string[];

/**
 * A set of supported type attributes on input elements
 */
let supportedInputTypes: Set<string>;

/**
 * An integer indicating the element
 * that the reader is currently reading
 */
let current: number;

/**
 * when we reach EOF, this lets us restart
 * or navigate to the last element
 */
let shouldRestart: boolean;

/**
 * enabled when interacting with elements
 * protects against usual event behaviour
 */
let interactMode: boolean;

/**
 * when in previous() or next(), we want to
 * skip the interaction processing
 */
let skipInteract: boolean;

/**
 * a parameter defining timeout duration
 * for interactive elements
 */
const TIMEOUT_DURATION: number = 1500;

/**
 * variable keeping track of every table visited.
 */
let tables: Array<HTMLElement>;

/**
 * variable keeping track of current table.
 */
let currentTable: HTMLElement;

/**
 * variable to keep track of current table index.
 */
let currentTableIdx: number;

/**
 * boolean representing if a table is hit.
 */
let tableHit: boolean;

/**
 * true if table navigation mode is on.
 */
let tableNavEnabled: boolean;

/**
 * total number of rows in the current table.
 */
let totalRows: number;

/**
 * total number of columns in the current table.
 */
let totalCols: number;

/**
 * current row in the table.
 */
let curRow: number;

/**
 * current column in the table.
 */
let curCol: number;

/**
 * current <tr> HTML element.
 */
let curRowElt: HTMLElement;

/**
 * currrent <td> HTML element.
 */
let curColElt: HTMLElement;

/**
 * element immediately following the current table.
 */
let afterTableElt: HTMLElement | null;

/**
 * index of element after table.
 */
let afterTableEltIdxs: Array<number>;

/**
 * index of every visited table.
 */
let tableIdxs: Array<number>;

/**
 * all column headers in the current table.
 */
let colHeaders: Array<string>;

/**
 * flag to tell the reading to stop.
 */
let stopHere: boolean;

/**
 * background color before highlighting.
 */
let oldBGColor: string;
// ---------------------------------- SETUP ----------------------------------
window.onload = () => {
    // Initialize VOICE_SYNTH and setup DOM processing
    VOICE_SYNTH = window.speechSynthesis;
    VOICE_RATE = 1;

    // initialize other global parameters
    ELEMENT_HANDLERS = new Map();
    ASYNC_HANDLERS = new Map();

    ids = [];
    supportedInputTypes = new Set(["text", "submit", "button"]);
    current = 0;

    shouldRestart = true;
    interactMode = false;
    skipInteract = false;
    tableHit = false;
    tableNavEnabled = false;
    stopHere = false;
    afterTableEltIdxs = [];
    tableIdxs = [];
    tables = [];

    // assign handlers and map the page's IDs
    generateHandlers();
    mapPage();

    // Add screen reader information to DOM
    document.body.innerHTML = `
        <div id="screenReader">
            <button onclick="start()">Start [Space]</button>
            <button onclick="
            if (VOICE_SYNTH.paused) {
                resume();
            } else if (VOICE_SYNTH.speaking || VOICE_SYNTH.pending) {
                pause();
            } else {
                start();
            }">Pause/Resume [P]</button>
            <button onclick="changeVoiceRate(1.1);">Speed Up [Right Arrow]</button>
            <button onclick="changeVoiceRate(0.9);">Slow Down [Left Arrow]</button>
        </div>
    ` + document.body.innerHTML;
    // Listen for keydown events for user control
    document.addEventListener("keydown", globalKeystrokes);
}

/**
 * Maps all possible tag names to their corresponding
 * handler, for processing and generation of its string form
 */
function generateHandlers(): void {
    // Add each element type to ELEMENT_HANDLERS, along with its handler
    // note: HTMLElement.tagName converts to uppercase

    // Metadata Elements
    ELEMENT_HANDLERS.set("TITLE", titleHandler);
    // Text Elements
    ELEMENT_HANDLERS.set("H1", headerHandler);
    ELEMENT_HANDLERS.set("H2", headerHandler);
    ELEMENT_HANDLERS.set("H3", headerHandler);
    ELEMENT_HANDLERS.set("H4", headerHandler);
    ELEMENT_HANDLERS.set("H5", headerHandler);
    ELEMENT_HANDLERS.set("H6", headerHandler);
    ELEMENT_HANDLERS.set("P", paragraphHandler);
    // Graphics Elements
    ELEMENT_HANDLERS.set("IMG", imageHandler);
    // Table Elements
    ELEMENT_HANDLERS.set("TABLE", tableHandler);
    ELEMENT_HANDLERS.set("CAPTION", captionHandler);
    ELEMENT_HANDLERS.set("TD", tableCellHandler);
    ELEMENT_HANDLERS.set("TFOOT", tableFootHandler);
    ELEMENT_HANDLERS.set("TH", tableHeaderHandler);
    ELEMENT_HANDLERS.set("TR", tableRowHandler);
    // Interactive Elements
    ELEMENT_HANDLERS.set("A", anchorHandler);
    ELEMENT_HANDLERS.set("INPUT", inputHandler);
    ELEMENT_HANDLERS.set("BUTTON", buttonHandler);

    /* Adding each interactive element type to
     * its respective interaction handler
     */
    ASYNC_HANDLERS.set("A", anchorInteractHandler);
    ASYNC_HANDLERS.set("INPUT", inputInteractHandler);
    ASYNC_HANDLERS.set("BUTTON", buttonInteractHandler);
    ASYNC_HANDLERS.set("TABLE", tableInteractHandler);
}

/**
 * Maps the DOM's HTMLElements to IDs,
 * giving them an explicit ordering
 */
function mapPage(): void {
    // Get all the HTML elements in the DOM
    const docElements: HTMLCollection =
        document.getElementsByTagName("*");

    /* Assign every usable element an id.
     * Useful for navigating between elements,
     * highlighting, and interaction.
     */
    let i: number = 0;
    let j: number = 0;
    while (i < docElements.length) {
        const ele: HTMLElement = docElements.item(i) as HTMLElement;
        // if it's an element we're capable of handling, add its id to our list
        if (ELEMENT_HANDLERS.has(ele.tagName)) {
            // if it doesn't have an id, we assign it one
            if (ele.id === "") {
                ele.id = "sr-id" + j;
                j++;
            }
            ids.push(ele.id);
        }
        i++;
    }
}


// --------------------------------- SPEAKING --------------------------------
/**
 * Speaks out text for the current HTMLElement.
 * Calls recursively until we've spoken all elements,
 * with opportunity to move to previous and next speeches.
 */
async function speakQueue() {
    if (VOICE_SYNTH) {
        // Make sure we're not at end of document. Exit if we are.
        if (current >= ids.length) {
            const speech = new SpeechSynthesisUtterance("End of document");
            speech.rate = VOICE_RATE;
            VOICE_SYNTH.speak(speech);
            shouldRestart = true;
            tableHit = false;
            stopHere = true;
            current = 0;
            return;
        }

        // initialize a speech request using SpeechSynthesisUtterance
        const ele: HTMLElement = document.getElementById(ids[current])!;
        const eleHandler: (HTMLe: HTMLElement) => string = ELEMENT_HANDLERS.get(ele.tagName)!;
        const speech: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(eleHandler(ele));

        speech.rate = VOICE_RATE;
        VOICE_SYNTH.speak(speech);

        document.onvisibilitychange = () => {
            // NOTE: to remove automatic resuming, remove the else clause.
            if (document.hidden) {
                pause();
            } else {
                resume();
            }
        }

        // update BG color
        oldBGColor = document.getElementById(ele.id)!.style.backgroundColor;
        document.getElementById(ele.id)!.style.backgroundColor = "yellow";

        // skipInteract might get set to true before speech.onend, but default should be false
        skipInteract = false;

        speech.onend = async () => {
            // Potentially enter interact mode
            if (!skipInteract && ASYNC_HANDLERS.has(ele.tagName)) {
                interactMode = true;
                await ASYNC_HANDLERS.get(ele.tagName)!(ele);
            }
            interactMode = false;
            skipInteract = false;

            // restore BG color
            document.getElementById(ele.id)!.style.backgroundColor = oldBGColor;

            // if we have more ids to speak, continue, otherwise alert + prepare for restart
            if (++current < ids.length) {
                if (tableHit && !tableNavEnabled) {
                    skipEle(currentTable);
                    tableHit = false;
                }
                if (!tableNavEnabled && !stopHere) {
                    await speakQueue();
                } else {
                    stopHere = false;
                    current--;
                }
            } else {
                VOICE_SYNTH.speak(new SpeechSynthesisUtterance("End of document"));
                shouldRestart = true;
                tableHit = false;
                current = 0;
            }
        }
    }
}

/**
 * Changes the speaking rate of the screen reader.
 * @param factor multiplier on the speaking rate
 */
function changeVoiceRate(factor: number): void {
    VOICE_RATE *= factor
    if (VOICE_RATE > 4) {
        VOICE_RATE = 4;
    } else if (VOICE_RATE < 0.25){
        VOICE_RATE = 0.25;
    }
}


// ------------------------------- USER CONTROL ------------------------------
/* NOTE: next() and previous() just set current, and then cancel the current
 * speech. Due to how the onend handling works in speakQueue,
 * speaking of the new correct element will begin at cancellation.
 */

/**
 * Moves to the next HTML element in the DOM.
 */
function next(): void {
    // use ID_MAP to start at current + 1
    if (current + 1 >= ids.length) {
        cancel();
        const speech = new SpeechSynthesisUtterance("End of document");
        speech.rate = VOICE_RATE;
        VOICE_SYNTH.speak(speech);
        current = 0;
    } else {
        if (tableHit) {
            skipEle(currentTable);
            tableHit = false;
            current--;
        }
        cancel();
        if (current + 1 >= ids.length || current == -1) {
            cancel();
            const speech = new SpeechSynthesisUtterance("End of document");
            speech.rate = VOICE_RATE;
            VOICE_SYNTH.speak(speech);
        }
    }
}

/**
 * Moves to the previous HTML element in the DOM.
 */
function previous(): void {
    // use ID_MAP to start at current - 1
    if (current > 0) {
        if (afterTableEltIdxs.includes(current)) {
            skipEleReverse(tables[afterTableEltIdxs.findIndex(elt => elt == current)]);
            return;
        } else if (current == currentTableIdx) {
            current -= 2;
            tableHit = false;
            cancel();
            return;
        } else if (current == currentTableIdx + 1) {
            current -= 3;
            tableHit = false;
            cancel();
            return;
        }

        if (shouldRestart) {
            cancel();
            shouldRestart = false;
            speakQueue();
        } else {
            current -= 2;
            cancel();
        }
    } else {
        current = -1;
        cancel();
    }
}

/**
 * Starts reading the page continuously.
 */
function start(): void {
    if (!ids.length) {
        VOICE_SYNTH.speak(new SpeechSynthesisUtterance("ERROR: No readable elements in document."));
    } else if (shouldRestart) {
        current = 0;
        shouldRestart = false;
        stopHere = false;
        cancel();
        speakQueue();
    } else {
        current = -1;
        cancel();
    }
}

/**
 * Pauses the reading of the page.
 */
function pause(): void {
    VOICE_SYNTH.pause();
}

/**
* Resumes the reading of the page.
*/
function resume(): void {
    VOICE_SYNTH.resume();
}

/**
 * Cancels the reading currently in progress
 * and skips the opportunity for interaction,
 * used by next() and previous().
 */
function cancel(): void {
    skipInteract = true;
    if (document.getElementById(ids[current])) {
        document.getElementById(ids[current])!.style.backgroundColor = oldBGColor;
    }
    VOICE_SYNTH.cancel();
}

/**
 * Listens for keydown events.
 * @param event keydown event
 */
function globalKeystrokes(event: KeyboardEvent): void {
    // When in interactive mode, we want to disable these events from getting control
    if (!interactMode) {
        switch (event.key) {
            case " ":
                event.preventDefault();
                start();
                break;
            case "P": case "p":
                if (VOICE_SYNTH.paused) {
                    resume();
                } else if (VOICE_SYNTH.speaking || VOICE_SYNTH.pending) {
                    pause();
                } else {
                    // if not already playing, and P is pressed, it'll start from the beginning
                    start();
                }
                break;
            case "ArrowRight":
                if (!tableNavEnabled) {
                    event.preventDefault();
                    changeVoiceRate(1.1);
                }
                break;
            case "ArrowLeft":
                if (!tableNavEnabled) {
                    event.preventDefault();
                    changeVoiceRate(0.9);
                }
                break;
            case "ArrowUp":
                if (!tableNavEnabled) {
                    event.preventDefault();
                    previous();
                }
                break;
            case "ArrowDown":
                if (!tableNavEnabled) {
                    event.preventDefault();
                    next();
                }
                break;
            case "J": case "j":
                if (tableNavEnabled) {
                    event.preventDefault();
                    cancel();
                    goDown();
                }
                break;
            case "K": case "k":
                if (tableNavEnabled) {
                    event.preventDefault();
                    cancel();
                    goUp();
                }
                break;
            case "H": case "h":
                if (tableNavEnabled) {
                    event.preventDefault();
                    cancel();
                    goLeft();
                }
                break;
            case "L": case "l":
                if (tableNavEnabled) {
                    event.preventDefault();
                    cancel();
                    goRight();
                }
                break;
            case ";":
                if (tableNavEnabled) {
                    event.preventDefault();
                    cancel();
                    readPosition();
                }
                break;
            case "Escape":
                escapeTable();
                break;
            default:
                break;
        }
    }
}


// ----------------------------- ELEMENT HANDLERS ----------------------------
/**
 * &lt;title>
 * @param ele: &lt;title> HTMLElement
 * @return title speech text
 */
function titleHandler(ele: HTMLElement): string {
    if (ele.innerText) {
        return "Title: " + ele.innerText;
    }
    return "An empty title.";
}

/**
 * &lt;h1>, &lt;h2>, ... , &lt;h6>
 * @param ele: header HTMLElement
 * @return header speech text
 */
function headerHandler(ele: HTMLElement): string {
    if (ele.tagName[1] && ele.innerText) {
        return "Heading " + ele.tagName[1] + ": " + ele.innerText;
    }
    return "An empty heading.";
}

/**
 * &lt;p>
 * @param ele: &lt;p> HTMLElement
 * @return paragraph speech text
 */
function paragraphHandler(ele: HTMLElement): string {
    if (ele.innerText) {
        return ele.innerText;
    }
    return "An empty paragraph.";
}

/**
 * &lt;img>
 * @param ele: &lt;img> HTMLElement
 * @return image speech text
 */
function imageHandler(ele: HTMLElement): string {
    if (ele.hasAttribute("alt")) {
        return "An image of " + ele.getAttribute("alt")!;
    }
    return "An image of unknown description.";
}

/**
 * &lt;a>
 * Renders a link's text for speaking.
 * @param ele: &lt;a> HTMLElement
 * @return link speech text
 */
function anchorHandler(ele: HTMLElement): string {
    if (ele.hasAttribute("href")) {
        const linkName: string = ele.getAttribute("href")!;
        const shortURL: string = new URL(linkName).hostname.replace("www.", "")
        if (ele.innerText) {
            return "A link to " + shortURL
                + " with description" + ele.innerText + ". Press Enter to visit in new tab.";
        } else {
            return "A link to " + shortURL + ". Press Enter to visit in new tab.";
        }
    }

    return "A link to an unknown website.";
}

/**
 * &lt;input>
 * Renders an input element's text for speaking.
 * @param ele: &lt;input> HTMLElement
 * @return input speech text
 */
function inputHandler(ele: HTMLElement): string {
    if ((ele as HTMLInputElement).type && supportedInputTypes.has((ele as HTMLInputElement).type)) {
        return "An input element of type " + (ele as HTMLInputElement).type + ". Press Enter to interact, Escape to exit.";
    }
    return "An input element of unsupported type.";
}

/**
 * &lt;button>
 * Renders a button's text for speaking.
 * @param ele: &lt;button> HTMLElement
 * @return button speech text
 */
function buttonHandler(ele: HTMLElement): string {
    const buttonLabels: NodeListOf<HTMLElement> = (ele as HTMLButtonElement).labels;
    if (buttonLabels.length && buttonLabels.item(0) && buttonLabels.item(0).innerText) {
        return "A button with description: " + buttonLabels.item(0).innerText + ". Press Enter to interact, Escape to exit.";
    }
    return "A button with no description. Press Enter to interact, Escape to exit.";
}

/**
 * &lt;table>
 * Renders a table's text for speaking.
 * @return table speech text
 */
function tableHandler(ele: HTMLElement): string {
    curRow = 1;
    curCol = 1;
    currentTable = ele;
    if (!tables.includes(ele)) {
        tables.push(ele);
    }
    tableHit = true;
    currentTableIdx = current;
    tableIdxs.push(current);
    afterTableElt = getNextEle(ele); 
    if (afterTableElt && !afterTableEltIdxs.includes(getSRID(afterTableElt))) {
        afterTableEltIdxs.push(getSRID(afterTableElt));
    }

    let toSay = "";
    let tableCaptions = ele.getElementsByTagName('caption');

    if (ele.getElementsByTagName('thead').length != 0) {
        let tableHeader = ele.getElementsByTagName('thead')[0];
        colHeaders = Array.from(tableHeader.getElementsByTagName('th')).map(x => x.innerHTML);
    } else {
        colHeaders = [];
    }
    
    let tableBody = ele.getElementsByTagName('tbody')[0];
    let tableRows = tableBody.getElementsByTagName('tr');

    totalCols = tableBody.getElementsByTagName('td').length;
    totalRows = tableRows.length;

    if (!tableCaptions.length) {
        toSay += "A table with no caption. ";
    } else {
        toSay += "A table with caption " + captionHandler(tableCaptions[0]);
    }

    totalCols = tableBody.getElementsByTagName('tr')[0].getElementsByTagName('td').length;
    totalRows = tableRows.length;

    toSay += "This table has " + tableRows.length.toString() + " rows and " + totalCols.toString() + " columns. ";
    toSay += "Press Enter to begin navigating the table. ";

    return toSay;
}

/**
 * &lt;caption>
 * Renders a caption's text for speaking.
 * @param ele: &lt;caption> HTMLElement
 * @return caption speech text
 */
function captionHandler(ele: HTMLElement): string {
    if (ele.textContent) {
        return ele.textContent + " ";
    }
    return "An empty caption. "
}

/**
 * &lt;td>
 * Renders a table cell's text for speaking.
 * @param ele: &lt;td> HTMLElement
 * @return table cell speech text
 */
function tableCellHandler(ele: HTMLElement): string {
    if (ele.innerText) {
        if (colHeaders) {
            if (colHeaders[curCol - 1] != undefined) {
                return colHeaders[curCol - 1] + ": " + ele.innerText;
            } else {
                return ele.innerText;
            }
        } else {
            return ele.innerText;
        }
    }
    return "An empty cell.";
}

/**
 * &lt;tfoot>
 * Renders a table foot's text for speaking.
 * @param ele: &lt;tfoot> HTMLElement
 * @return table foot speech text
 */
function tableFootHandler(ele: HTMLElement): string {
    if (ele.innerText) {
        return "Footer: " + ele.innerText;
    }
    return "An empty footer";
}

/**
 * &lt;th>
 * Renders a table header's text for speaking.
 * @param ele: &lt;th> HTMLElement
 * @return table header speech text
 */
function tableHeaderHandler(ele: HTMLElement): string {
    if (ele.innerText) {
        return "Header: " + ele.innerText;
    }
    return "An empty header";
}

/**
 * &lt;tr>
 * Renders a table row's text for speaking.
 * @return table row speech text
 */
function tableRowHandler(): string {
    return "Row. ";
}


// ------------------------------ ASYNC HANDLERS -----------------------------
/**
 * &lt;a>
 * handles link element interaction
 * 1. press enter to enter click link
 * 2. otherwise, wait a second and a half
 * @param ele: &lt;a> HTMLElement
 * @return empty promise, resolves on return
 */
async function anchorInteractHandler(ele: HTMLElement): Promise<void> {
    if (ele.hasAttribute("href")) {
        let linkClicker: (e: KeyboardEvent) => void = (event: KeyboardEvent) => {
            if (event.key === "Enter" && document.getElementById(ids[current])!.hasAttribute("href")) {
                const url: string = document.getElementById(ids[current])!.getAttribute("href")!;
                window.open(url, "_blank");
            }
        }
        document.addEventListener("keydown", linkClicker);
        // once we set up linkClicker, wait for input
        await sleep(TIMEOUT_DURATION);
        document.removeEventListener("keydown", linkClicker);
    }
}

/**
 * &lt;input>
 * handles input element interaction
 * 1. press enter to enter the text box
 * 2. type until you're done
 * 3. Press Escape to exit
 * @return an empty promise, resolves on timeout, Enter -> Escape, or button handling
 */
async function inputInteractHandler(): Promise<void> {
    const eleType: string = (document.getElementById(ids[current]) as HTMLInputElement).type;

    // switch behaviour on input type
    switch (eleType) {
        case "text":
            let timeoutID: number;
            let inputListener: (e: KeyboardEvent) => void;
            return new Promise<void> (resolve => {
                document.addEventListener("keydown", inputListener = (event: KeyboardEvent) => {
                    switch (event.key) {
                        case "Enter":
                            event.preventDefault();
                            clearTimeout(timeoutID);
                            document.getElementById(ids[current])!.focus();
                            break;
                        case "Escape":
                            document.removeEventListener("keydown", inputListener);
                            document.getElementById(ids[current])!.blur();
                            resolve();
                            break;
                    }
                })
                timeoutID = setTimeout(() => {
                    document.removeEventListener("keydown", inputListener)
                    resolve();
                }, TIMEOUT_DURATION);
            })
        case "submit": case "button":
            await buttonInteractHandler();
            break;
        default:
            break;
    }
}

/**
 * &lt;button>
 * handles button interaction
 * 1. press enter to click on the text box
 * 2. click as many times as you want
 * 3. Press Escape to exit
 * @return an empty promise, resolves on timeout or Enter -> Escape
 */
async function buttonInteractHandler(): Promise<void> {
    let timeoutID: number;
    let buttonListener: (e: KeyboardEvent) => void;
    return new Promise<void> (resolve => {
        document.addEventListener("keydown", buttonListener = (event: KeyboardEvent) => {
            switch (event.key) {
                case "Enter":
                    event.preventDefault();
                    clearTimeout(timeoutID);
                    document.getElementById(ids[current])!.click();
                    break;
                case "Escape":
                    document.removeEventListener("keydown", buttonListener);
                    resolve();
                    break;
            }
        })
        timeoutID = setTimeout(() => {
            document.removeEventListener("keydown", buttonListener)
            resolve();
        }, TIMEOUT_DURATION);
    })
}

/**
 * Handler to handle table interactions.
 * @param ele table element to interact with.
 */
async function tableInteractHandler(ele: HTMLElement): Promise<void> {
    let enterTable: (e: KeyboardEvent) => void = async (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            cancel();
            tableNavEnabled = true;
            const speech: SpeechSynthesisUtterance = new SpeechSynthesisUtterance("Enter table. Press escape to exit table navigation. ");
            speech.rate = VOICE_RATE;
            VOICE_SYNTH.speak(speech);
            speech.onend = async () => { 
                if (tableNavEnabled) {
                    goToFirstCell(); 
                }
            }
        }
    }
    document.addEventListener("keydown", enterTable);
    await sleep(TIMEOUT_DURATION);
    document.removeEventListener("keydown", enterTable);
}

/**
 * Sleeps for a specified amount of time,
 * returning a promise.  Useful for synchronous work.
 * @param ms the number of milliseconds to sleep for
 * @return a promise that resolves when the timeout is finished
 */
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));


// —————————————————————— HELPERS ————————————————————————-
/**
 * Moves the current cursor past the provided HTML element.
 * @param ele element to skip.
 */
function skipEle(ele: HTMLElement) {
    let nextEle: HTMLElement | null = getNextEle(ele);
    if (nextEle) {
        cancel();
        current = getSRID(nextEle);
    } else {
        cancel();
        current = ids.length;
        speakQueue();
    }
}

/**
 * Moves the current cursor behind the provided HTML element.
 * @param ele element to skip behind.
 */
function skipEleReverse(ele: HTMLElement) {
    let prevEle: HTMLElement | null = getPrevEle(ele);
    if (prevEle) {
        cancel();
        current = getSRID(prevEle);
    } else {
        current = 0;
    }
}

/**
 * Finds the next element to read.
 * @param ele element to get next
 * @returns next HTMLElement
 */
function getNextEle(ele: HTMLElement): HTMLElement | null {
    let nextEle: HTMLElement | null;

    if (ele.nextElementSibling) {
        nextEle = ele.nextElementSibling as HTMLElement;
    } else {
        if (ele.parentElement && ele.parentElement.nextElementSibling) {
            nextEle = ele.parentElement.nextElementSibling as HTMLElement;
        } else {
            return null;
        }
    }

    while (!ELEMENT_HANDLERS.has(nextEle.tagName)) {
        if (nextEle.childNodes.length > 1) {
            nextEle = nextEle.childNodes[1] as HTMLElement;
        } else {
            nextEle = nextEle.nextElementSibling as HTMLElement;
        }
        if (nextEle == null) {
            break;
        }
    }
    if (nextEle) {
        return nextEle;
    } else {
        if (ele.parentElement && ele.parentElement.nextElementSibling) {
            return getNextEle(ele.parentElement);
        } else {
            return null;
        }
    }
}

/**
 * Returns the previous element.
 * @param ele element to get behind.
 * @returns previous element.
 */
function getPrevEle(ele: HTMLElement): HTMLElement | null {
    let prevEle: HTMLElement;
    if (ele.previousElementSibling) {
        prevEle = ele.previousElementSibling as HTMLElement;
    } else {
        return null;
    }

    while (!ELEMENT_HANDLERS.has(prevEle.tagName)) {
        prevEle = prevEle.previousElementSibling as HTMLElement;
    }

    if (prevEle) {
        return prevEle;
    } else {
        return null;
    }
}

/**
 * Finds the id of the provided element.
 * @param ele element to find id of
 * @returns id
 */
function getSRID(ele: HTMLElement): number {
    const re = /sr-id([0-9]+)/g;
    return parseInt(re.exec(ele.id)![1]);
}

/**
 * Goes to first cell in current table.
 */
function goToFirstCell() {
    current = getSRID(currentTable.getElementsByTagName('tbody')[0].getElementsByTagName('td')[0]);
    curRow = 1;
    curCol = 1;
    readCurCell(true, true);
}

/**
 * Moves down a row.
 */
function goDown() {
    if (curRow + 1 > totalRows) {
        const posString = "End of Table. ";
        const speech = new SpeechSynthesisUtterance(posString);
        speech.rate = VOICE_RATE;
        VOICE_SYNTH.speak(speech);
    } else {
        curRow++;
        readCurCell(true, false);
    }
}

/**
 * Goes up a row.
 */
function goUp() {
    if (curRow - 1 == 0) {
        const posString = "Top of Table. ";
        const speech = new SpeechSynthesisUtterance(posString);
        speech.rate = VOICE_RATE;
        VOICE_SYNTH.speak(speech);
    } else {
        curRow--;
        readCurCell(true, false);
    }
}

/**
 * Goes back a column.
 */
function goLeft() {
    if (curCol - 1 == 0) {
        const posString = "Beginning of Row. ";
        const speech = new SpeechSynthesisUtterance(posString);
        speech.rate = VOICE_RATE;
        VOICE_SYNTH.speak(speech);
    } else {
        curCol--;
        readCurCell(false, true);
    }
}

/**
 * Goes forward a column.
 */
function goRight() {
    if (curCol + 1 > totalCols) {
        const posString = "End of Row. ";
        const speech = new SpeechSynthesisUtterance(posString);
        speech.rate = VOICE_RATE;
        VOICE_SYNTH.speak(speech);
    } else {
        curCol++;
        readCurCell(false, true);
    }
}

/**
 * Reads the current cell.
 * @param newRow true if row changed.
 * @param newCol true if column changed.
 */
function readCurCell(newRow: boolean, newCol: boolean) {
    let newPos: string = "";
    if (newRow && newCol) {
        readPosition();
    } else if (newRow) {
        newPos +=  "Row: " + curRow.toString() + " of " + totalRows.toString() + ". ";
    } else if (newCol) {
        newPos += "Column: " + curCol.toString() + " of " + totalCols.toString() + ". ";
    }
    const speech = new SpeechSynthesisUtterance(newPos);
    speech.rate = VOICE_RATE;
    VOICE_SYNTH.speak(speech);
    const rowIdx = curRow - 1;
    const colIdx = curCol - 1;
    const curCell: HTMLElement = currentTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[rowIdx].getElementsByTagName('td')[colIdx];
    current = getSRID(curCell);

    if (curCell.getElementsByTagName('a')) {
        speakQueue();
        for (let _ of curCell.getElementsByTagName('a')) {
            current++;
            speakQueue();
        }
    } else {
        speakQueue();
    }
}

/**
 * Reads the current position in the table.
 */
function readPosition(): void {
    const posString = "Row: " + curRow.toString() + " of " + totalRows.toString() + ". Column: " + curCol.toString() + " of " + totalCols.toString() + ". ";
    const speech = new SpeechSynthesisUtterance(posString);
    speech.rate = VOICE_RATE;
    VOICE_SYNTH.speak(speech);
}

/**
 * Escapes table navigation.
 */
function escapeTable() {
    if (tableNavEnabled) {
        tableNavEnabled = false;
        skipEle(currentTable);
        if (current > 0) {
            speakQueue();
            cancel();
        }
    }
}