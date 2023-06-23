package edu.brown.cs.student.database;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Class to represent the output of a SQL query. (deprecated)
 * @author Justin Rhee
 */
public class QueryOutput {
  private final boolean isWrite;
  private int linesAffected;
  private List<List<String>> queryResults;
  private final boolean isValid;

  /**
   * Default constructor.
   */
  public QueryOutput() {
    this.isWrite = false;
    this.linesAffected = 0;
    this.queryResults = null;
    this.isValid = false;
  }

  /**
   * Constructor to create a QueryOutput object.
   *
   * @param conn connection to SQL database
   * @param query SQL query to execute
   * @param isWrite check if SQL query requires write access
   * @throws SQLException exception thrown by invalid SQL operations
   */
  public QueryOutput(Connection conn, String query, boolean isWrite) throws SQLException {
    this.isWrite = isWrite;
    if (this.isWrite) {
      linesAffected = conn.prepareStatement(query).executeUpdate();
    } else {
      ResultSet output = conn.prepareStatement(query).executeQuery();
      queryResults = resultSetToList(output);
    }
    this.isValid = true;
  }

  /**
   * Constructor to create a QueryOutput object.
   *
   * @param conn connection to SQL database
   * @param query SQL query to execute
   * @param params the String[] of arguments to be inserted into the query
   * @param isWrite check if SQL query requires write access
   * @throws SQLException exception thrown by invalid SQL operations
   */
  public QueryOutput(Connection conn, String query, List<String> params, boolean isWrite)
      throws SQLException {
    this.isWrite = isWrite;
    if (this.isWrite) {
      PreparedStatement prepStatement = conn.prepareStatement(query);
      for (int i = 0; i < params.size(); i++) {
        prepStatement.setString(i + 1, params.get(i));
      }
      linesAffected = prepStatement.executeUpdate();
    } else {
      ResultSet output = conn.prepareStatement(query).executeQuery();
      queryResults = resultSetToList(output);
    }
    this.isValid = true;
  }

  /**
   * Converts a ResultSet to a List of Lists of Strings.
   *
   * @param rs result set
   * @return List of Lists of Strings from the result set
   * @throws SQLException exception thrown by invalid SQL operations
   */
  private List<List<String>> resultSetToList(ResultSet rs) throws SQLException {

    List<List<String>> output = new ArrayList<>();
    List<String> curRow = new ArrayList<>();

    int numCols = rs.getMetaData().getColumnCount();
    for (int i = 1; i <= numCols; i++) {
      curRow.add(rs.getMetaData().getColumnName(i));
    }
    output.add(curRow);

    while (rs.next()) {
      curRow = new ArrayList<>();
      for (int i = 1; i <= numCols; i++) {
        curRow.add(rs.getString(i));
      }
      output.add(curRow);
    }

    return output;
  }

  /**
   * Converts a QueryOutput to a String.
   *
   * @return String representing a QueryObject
   */
  public String toString() {
    if (this.isWrite) {
      return linesAffected + " line(s) affected.";
    } else {
      StringBuilder output = new StringBuilder();
      for (List<String> row : queryResults) {
        for (String value : row) {
          output.append(value).append("\t");
        }
        output.append("\n");
      }
      output.delete(output.length() - 2, output.length());
      return output.toString();
    }
  }

  /**
   * Returns query results as a list.
   *
   * @return query results as a list.
   */
  public List<List<String>> toList() {
    return new ArrayList<>(queryResults);
  }

  /**
   * Converts results into a map.
   *
   * @return map of results
   */
  public Map<String, List<String>> toMap() {
    if (queryResults.size() <= 0) {
      return null;
    }

    Map<String, List<String>> retMap = new HashMap<>();
    List<String> colNames = new ArrayList<>(queryResults.get(0));
    for (String name : colNames) {
      retMap.put(name, new ArrayList<>());
    }
    for (int i = 0; i < queryResults.get(0).size(); i++) {
      for (int j = 1; j < queryResults.size(); j++) {
        retMap.get(colNames.get(i)).add(queryResults.get(j).get(i));
      }
    }
    return retMap;
  }

  /**
   * Converts results into a json string with primary eky.
   *
   * @return json string
   * @throws JSONException thrown if there is a json exception
   */
  public String toJSONWithKey() throws JSONException {
    List<String> colNames = new ArrayList<>(queryResults.get(0));
    List<List<String>> resultsCopy = new ArrayList<>(queryResults);

    String primaryKey = resultsCopy.remove(0).get(0);
    JSONArray allResults = new JSONArray();

    for (List<String> row : resultsCopy) {
      JSONObject current = new JSONObject();
      current.put("primary_key", primaryKey);
      for (int i = 0; i < row.size(); i++) {
        current.put(colNames.get(i), row.get(i));
      }
      allResults.put(current);
    }
    return allResults.toString();
  }

  /**
   * Converts results into a json string.
   *
   * @return json string
   * @throws JSONException thrown if there is a json exception
   */
  public String toJSON() throws JSONException {
    List<String> colNames = new ArrayList<>(queryResults.get(0));
    List<List<String>> resultsCopy = new ArrayList<>(queryResults);
    JSONArray allResults = new JSONArray();
    resultsCopy.remove(0);

    for (List<String> row : resultsCopy) {
      JSONObject current = new JSONObject();
      for (int i = 0; i < row.size(); i++) {
        current.put(colNames.get(i), row.get(i));
      }
      allResults.put(current);
    }
    return allResults.toString();
  }

  /**
   * Returns whether the query output is valid.
   *
   * @return the value of isValid
   */
  public boolean getIsValid() {
    return isValid;
  }
}
