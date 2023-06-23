package edu.brown.cs.student.database;

import edu.brown.cs.student.repl.REPLCommand;

import java.sql.SQLException;

/**
 * Class which represents a REPL command to run a SQL query on a loaded database.
 * @author Justin Rhee
 */
public class Run implements REPLCommand {
  private final Connect connect;

  /**
   * Constructor to set database connection for running SQL queries.
   *
   * @param connect class representing a connection do a database proxy
   */
  public Run(Connect connect) {
    this.connect = connect;
  }

  /**
   * Executes a SQL query and returns a String representation of the output.
   *
   * @param args represents the arguments that may be necessary for command execution. Parsing of
   *             the arguments should occur in the instance of the REPLCommand.
   */
  @Override
  public void execute(String args) {
    try {
      System.out.println(this.connect.getDatabase().executeQuery(args));
    } catch (SQLException e) {
      System.out.println("ERROR: " + e.getMessage());
    }
  }
}
