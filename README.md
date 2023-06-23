# README -  Project 2 Specifications

## Note

This is a project taken from CSCI0320: Introduction to Software Engineering at Brown University in accordance with the class's collaboration policy.

## Team Members

| Member | Role Sprint 3       | Role Sprint 4          |
| ------ | ------------------- | ---------------------- |
| Bumjin | Backend Integration | Table Sorting          |
| Justin | Table Visualization | Screen / Table Reading |
| Mason  | Screen Reader       | Kanban / Selenium      |

For those that have trouble reading long documentation or want to reference quick use commands, we have included a significantly shorter README here: [CHEATSHEET.md](https://github.com/joobumjin/CS32-TableVisualization/blob/main/CHEATSHEET.md).

## Section 2: Overall Description
### 2.1 User Needs
Through our websites, uses will be able to access and modify large databases containing multiple tables of data.
Current tools used for database manipulation are often implemented through the terminal, which is inaccessible for many visually-impaired users. Moreover, for existing database manipulation websites, visually-impaired users are still facing accessibility issues because these websites often represent the loaded tables from the databases visually, often printing a large, spreadsheet style table that can be difficult for visually-impaired users to navigate and read. Moreover, certain users, like concussed people, may be unable to inspect large amounts of text for long periods of time.
Therefore, we wanted to introduce a website in which databases could be accessed and manipulated, with both visual and audio-based tools to help increase the accessibility of our platform. Specifically, we aimed to create a website with very clear visual controls in the form of buttons and dropdown menus as well as screen reading for further accommodations for users who may not be able to take advantage of visual tools.
This database manipulation product could be used in any context which involves or is related to database files like in schools or workplaces.

### 2.2 Assumptions and dependencies
#### Technical Dependencies:
* Java 17 
* GitHub 
* IntelliJ 
* Personal Computers for Every Developer
* Spark Framework 
* Typescript 
* Javascript 
* React
* Selenium
* WebDriverManager

#### Non-technical Dependencies:
* There is a need for a website acting as a table visualizer with screen reading functionality.
* No major legal or ethical issues regarding any algorithms or data that are used.
* No copyright issues.

#### Normative Assumptions
* There is a need for a web-based SQL database visualizer.

#### Financial Dependencies
* Free access to IntelliJ through Brown
* Funds to replace personal computers if needed


## Section 3: System Features and Requirements
### 3.1 Risks
At the moment, given that the product does not take in any user data and is instead intended as a demonstration of functionality, there are not many risks to document.
Firstly, we have attempted to address all of the stakeholders’ requested features. Moreover, given that users cannot upload their own data to our product at the moment, there is no need to consider user consent and privacy. To this end, we further assume that the databases provided to our product are publicly accessible. Moreover, as our product does not make decisions, there is no risk of a lack of transparency in terms of decision-making.
Considering the implemented accessibility features, we have aimed to make the product equally useful and beneficial to all users.
We attempt to minimize our use of resources and energy by minimizing our use of separate endpoints. As sending data over HTTP is expensive with regards to time and resources, we attempted to separate endpoints as little as possible.
Given that the entire aim of the product is to access and manipulate database tables, the users must be able to directly modify these database files.

### 3.2 Data Requirements
Our program will not take in any data as part of its functionality at the moment. If this stays the case, there are no data requirements to be considered. Moreover, the intention is not for the front-end to store any of the data itself in the case that functionality for accepting user-uploaded data is added.
Of course, in accessing and displaying table data from a database, the product will necessarily interact with the potentially sensitive information stored in a database. However, the program is not intended to store this data.

### 3.3 System Features
#### Usage and Description of System Features
##### Screen Reader

_Usage_:

Starting Screen Reader:

* First, the TypeScript file must be compiled into JavaScript for the Screen Reader to function
* Pressing `[Space]` or the button in the top left on a given page with Screen Reading implemented will begin the screen reader

Using Screen Reader:

* Once Screen Reading has been started, `[up]` and `[down]` arrow keys can be used for next and previous lines
* Once Screen Reading has been started, `[left]` and `[right]` arrow keys can be used for increasing and decreasing the speed of the Screen Reader
* Once Screen Reading has been started, `[p]` will pause/resume reading, or start the document if not yet begun
* Once Screen Reading has been started and the current navigation is on a link/button/input field, verbal instruction will prompt the user to use keyboard keys to interact with these elements. If the users choose to not interact, they must wait 1.5 seconds (configurable) before the reader moves on to the next element
* When the current element is a link, pressing `[Enter]` will open the link in a new tab, and pause reading by the screenreader
* When the current element is a button, pressing `[Enter]` will click the button, and then the user may click the button with `[Enter]` as many times as they like before pressing `[Escape]` to move to the next element
* When the current element is an input element, pressing `[Enter]` will allow text input into the field or click the input button, depending on the “type” attribute of the element; then, the user may escape the text field and move on to the next element by pressing `[Escape]`

Table Reading:
* Once the screen reader reaches a table, pressing the `[Enter]` key will enter table navigation mode. Pressing `[Escape]` will exit table navigation and continue to the next element after the table.
* Once in table navigation mode, to navigate, `[j]`  will move down a row, `[k]` will move up a row, `[h]` will move back a column, and `[l]` will move forward a column.
* To get the current position in the table, press the `[;]` key.
* Clicking links in table navigation mode is the same as in normal screen reader usage. To click a link, press `[Enter]` when prompted.

##### Table Visualization (HTML)
Once the Spark server has been started, the table visualization aspect of our application can be used as follows.

_Usage_:

* Connecting a database:
  * Loading from REPL: Using the `connect <database path>` REPL command, a database can be connected from the REPL.
  * Loading from Webpage: Select a database to load from the database dropdown menu and click the `“Connect database”` button.
* Loading a Table to Visualize
  * Select a table from the table dropdown and click the `“Load Table”` button.
* Clearing the Visualization
  * Click the `“Clear Table”` button.
* Modifying the Table
  * Select a modification from the dropdown, input the requested fields, and click the `“Apply Modification”` button.

##### Backend Integration
The following endpoints for interacting with the backend are listed below.

**Endpoint**: `/get_db`\
Method: `POST`\
Expects:
```
{
    db_path : string
}
```
Returns on Success:
```
{
    result: tb_names : string
}
```
Returns on Failure:
```
{
    error: “Failed.” : string
}
```


**Endpoint**: `/get_table`\
Method: `POST`\
Expects:
```
{
    first: tb_name : string
}
```
Returns on Success:
```
{
    result: json_string : string
}
```
Returns on Failure:
```
{
    error: “Failed” : string
}
```

**Endpoint**: `/update`\
Method: `POST`\
Expects:
```
{
    first: table_name : string,
    second: primary_key : string,
    third: primary_key_value: string
    fourth: column_names : string,
    fifth: new_data : string
}
```
Returns on Success:
```
{
    result: 1 : int
}
```
Returns on Failure:
```
{
    error: -1 : int
}
```

**Endpoint**: `/insert`\
Method: `POST`\
Expects:
```
{
    first: table_name : string,
    second: column_names : string,
    third: new_data : string
}
```
Returns on Success:
```
{
    result: 1 : int
}
```
Returns on Failure:
```
{
    error: -1 : int
}
```

**Endpoint**: `/delete`\
Method: `POST`\
Expects:
```
{
    first: table_name : string,
    second: primary_key : string,
    third: primary_key_value: string
}
```
Returns on Success:
```
{
    result: 1 : int
}
```
Returns on Failure:
```
{
    error: -1 : int
}
```

##### Database Proxy
_Usage_ / _REPL Commands_:
* REPL Command: `connect`
  * Usage: `"connect <insert file path to SQLite database here>"`
  * Function: Connects to a database. Connected frontend will also be seen by table visualization frontend.
  * Acceptance Criteria: Successfully establishes a connection to the database from the REPL.
* REPL Command: `run`
  * Usage: `"run <insert SQL query here in quotes>"`
  * Function: Executes SQL queries on the connected database.
  * Acceptance Criteria: Executes a SQL query successfully.

##### Table Visualization + Sorting (React)
Once the spark server has been started by changing directories to `backend` and calling `./run --gui`, the React front
end can be started by changing directories to the `frontend/table-sorter` directory and then running `npm start`. This
should bring up a new browser window with the web page. 

Afterwards, the user can now start interacting with the webpage! A database to connect to can be selected from the top
dropdown menu. The database can then be connected to by pressing the big "Connect Database" button. Once a Database has
been connected to, the tables in that `sqlite` file will show up in the secondary dropdown. A table to load can be selected
from that second dropdown. The table can then be visualized by pressing the `Load Table` document. The visualization can
be cleared with the `Clear Table` button. Selecting a new table will clear the visualization, while selecting a new database
will clear the visualization and the table selection. 

Modification can be done to the table by selecting the edit or delete buttons at the end of a table row or inserting data into 
the text boxes at the very bottom row and then pressing the Insert button. 

The table can also be sorted by pressing the button in each of the header columns. This will automatically sort it in ascending
order, though the triangle button to the right of the header name that now popped up can be pressed to change the direction of the
sorting. To deselect the header column for sorting, simply press the column header button again.

Notice that testing can be run by opening a new terminal window and running `mvn package`. However, the backend,
as run by the `./run --gui`, may not be up to date with the current `mvn package`.

##### Kanban
To run the backend, navigate to `backend`, then run `./run --gui`.
To begin the React app, navigate to `frontend/kanban/static-kanban`,
then run `npm start`.

##### Package Organization
In order to achieve the desired functionality with decent readability, our project has been separated into various packages containing interfaces and classes that pertain to a single function. The organization of our code into packages is as follows:

###### Backend
- `api`: package which contains all the API endpoints for our application.
- `database`: package which contains a database proxy class and helper classes to connect to sqlite databases with REPL command functions.
- `repl`: package which contains all the necessary code for the REPL.

###### Frontend
- `screenreader`: directory which contains all screen reader code.
- `table`: directory containing all table visualization code to interface with backend API.

### 3.4 Functional Requirements
#### Screen Reader

#### Table Visualization
* Can visualize any table in a sqlite database.
* Has a UI for modifying SQL tables
* Tables can only be selected once a database is first selected
* Tables can only be manipulated once a table is first selected.

#### Backend Integration
* Provides endpoints for frontend for SQL table visualization
* Database Proxy
* Provides an interface for a SQL database and provides mechanisms for access control to specific tables.
* Can be used from the REPL and can be used through API endpoints

### 3.5 Testing Plan
For testing, we plan to include the following unit and system tests:

#### Screen Reader
- [Unit Test] ensure web page can be read
- [Unit Test] check pausing functionality
- [Unit Test] check resuming functionality
#### Table Visualization
- [Unit Test] test functionality of sending data to and from the backend
- [Unit Test] ensure a variety of tables can be visualized based on user input
- [System Test] ensure tables visualize correctly
#### Backend Integration
- [Unit Test] ensure endpoints provide correct responses
- [System Test] ensure smooth integration with frontend
#### Database Proxy
- [Unit Test] test ability to connect to SQL databases
- [Unit Test] test ability to execute SQL queries
- [Unit Test] ensure outputs can be reformatted appropriately
- [System Test] test integration with front end
#### Table Sorting
- [System Test] Selenium tests which check intended functionality regarding user interaction

For testing in general, we plan to write extensive unit and system tests. We are aiming for >50% coverage with our unit tests. System tests will test overall functionality of the screen reader and table visualizer along with their integration into the backend. Some specific cases we would like to test are modifying SQL tables and reading unusually formatted HTML. Backend unit tests can be run by entering `mvn test` into the command line in the backend directory. The REPL and Spark server can be started with `./run –gui` in the backend directory.

### 3.6 External Interface Requirements
Our user interface will be implemented as a web page. We hope that the visual GUI of the web page with dropdown menus and buttons will improve ease of access over terminal usage. Moreover, the screen reader will provide functionality for opening links to give motor impaired users more options by which they can navigate the different elements in a webpage. For accessibility to those that are visually impaired, we will provide a screen reading functionality. In the future, we could plan to implement other usual conventions for web accessibility such as ARIA labeling, semantic HTML, careful use of color and non-color emphasis, and clean, uncluttered content.
Our app connects with a Java Spark server to access data stored in SQLite databases on the backend.
### 3.7 Non-functional Requirements
Performance: With the use of caching in our database and the importance of having reliable screen reading functionality, we expect a high standard of speed and reliability.
Security: Since we will be interacting with a SQL database, we hope for a moderate level of security, ensuring that no unintended SQL queries can get executed (e.g. via SQL injection).
Privacy: Since personal information can potentially be stored or visualized in our system, we will aim for a high standard of privacy in which personal data is not directly accessible by anyone or anything besides the algorithms that require it.
UI: We hope to have a simple, practical, and intuitive interface.
