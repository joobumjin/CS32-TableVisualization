package edu.brown.cs.student.database;

import edu.brown.cs.student.repl.REPLCommand;

import java.io.FileNotFoundException;
import java.sql.SQLException;

import static edu.brown.cs.student.repl.ParseCommand.parseInput;

/**
 * REPL command to connect to a SQL database.
 * @author Justin Rhee
 */
public class Connect implements REPLCommand {
  private DatabaseProxy db;

  /**
   * Method to connect to a SQL database from the REPL.
   *
   * @param args represents the arguments that may be necessary for command execution. Parsing of
   *             the arguments should occur in the instance of the REPLCommand.
   */
  @Override
  public void execute(String args) {
    try {
      String[] params = parseInput(args);
      db = new DatabaseProxy(params[0]);
    } catch (SQLException | ClassNotFoundException | FileNotFoundException
        | IndexOutOfBoundsException e) {
      System.out.println("ERROR: " + e.getMessage());
    }
    System.out.println(db.getPermissions().toString());
  }

  /**
   * Returns the loaded database.
   *
   * @return loaded database
   */
  public DatabaseProxy getDatabase() {
    return this.db;
  }
}
