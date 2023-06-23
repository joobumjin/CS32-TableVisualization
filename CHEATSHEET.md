# Command CheatSheet
## Sprint 3
After git clone-ing the repository, run `mvn package` to first compile all the code.

Afterwards, run `./run --gui` to start the backend. Opening the `table.html` file will then launch the front end.

To manually connect to a database in the command line, first run `./run --gui` to start the `REPL` and then enter `connect <filepath>`.

If any edits to any `.ts` are made, then `tsc -w` should be run in that directory to compile changes into the associated `.js` file before any Screen Reading is done.

### Command Line Commands
| Command       | Purpose                                                                                                                  |
|---------------|--------------------------------------------------------------------------------------------------------------------------|
| `mvn package` | Repackage all code and load any changes from the code                                                                    |
| `./run --gui` | Begin the command line `REPL` and the backend for the product                                                            |
| `tsc -w`      | Begin actively checking for any changes in a `.ts` file so that these changes can be compiled into the proper `.js` file | 

### REPL Commands
| Command                       | Purpose                                                  |
|-------------------------------|----------------------------------------------------------|
| `connect <database filepath>` | Manually connects to a database file                     | 
| `run <SQL Command>`           | Executes a query (should not be used in this context yet | 

## Sprint 4
### Table Visualization
After git clone-ing the repository, run `mvn package` to first compile all the code. Remember to disable testing before `mvn package`ing the first time.
Calling `mvn package` with the backend running will run all Selenium tests.

Afterwards, run `./run --gui` in the `backend` directory to start the backend. 

Then, navigate to the `frontend/table-sorter` directory to start the front end.

### Screen Reading
Opening the `html` files with screen reading built in will automatically begin the screen reading.

