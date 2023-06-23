package edu.brown.cs.student.database;

import java.sql.SQLException;

/**
 * Database proxy interface.
 * @author Justin Rhee
 */
public interface IDatabaseProxy {
  /**
   * Connects to a SQL database.
   *
   * @param filename path to a SQL database
   * @throws ClassNotFoundException exception thrown by Class.forName
   * @throws SQLException exception thrown by invalid SQL operations
   */
  void loadDB(String filename) throws ClassNotFoundException, SQLException;

  /**
   * Executes a provided SQL query and returns the ResultSet.
   *
   * @param query SQL query to execute
   * @return ResultSet of the query
   * @throws SQLException exception thrown by invalid SQL operations
   */
  QueryOutput executeQuery(String query) throws SQLException;
}
