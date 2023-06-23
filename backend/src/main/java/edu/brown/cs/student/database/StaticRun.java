package edu.brown.cs.student.database;

import edu.brown.cs.student.api.Handler;

import java.sql.SQLException;

/**
 * Class for executing run from a static context.
 */
public abstract class StaticRun {
  /**
   * Executes a SQL query and returns a String representation of the output.
   *
   * @param args represents the arguments that may be necessary for command execution. Parsing of
   *             the arguments should occur in the instance of the REPLCommand.
   */
  public static void execute(String args) {
    try {
      System.out.println(Handler.getDB().executeQuery(args));
    } catch (SQLException e) {
      System.out.println("ERROR: " + e.getMessage());
    }
  }
}
