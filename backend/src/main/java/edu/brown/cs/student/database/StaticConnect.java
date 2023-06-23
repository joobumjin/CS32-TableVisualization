package edu.brown.cs.student.database;

import edu.brown.cs.student.api.Handler;

import java.io.FileNotFoundException;
import java.sql.SQLException;

import static edu.brown.cs.student.repl.ParseCommand.parseInput;

/**
 * Class for connecting to databases from a static context.
 */
public abstract class StaticConnect {
  /**
   * Method to connect to a SQL database from the REPL.
   *
   * @param args represents the arguments that may be necessary for command execution. Parsing of
   *             the arguments should occur in the instance of the REPLCommand.
   */
  public static void execute(String args) {
    try {
      String[] params = parseInput(args);
      Handler.setDB(new DatabaseProxy(params[0]), true);
      Handler.setDBPath(params[0]);
    } catch (SQLException | ClassNotFoundException | FileNotFoundException
        | IndexOutOfBoundsException e) {
      System.out.println("ERROR: " + e.getMessage());
    }
    System.out.println(Handler.getDB().getPermissions().toString());
  }
}
