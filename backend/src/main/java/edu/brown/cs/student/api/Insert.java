package edu.brown.cs.student.api;

import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Route;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Inserts into a database.
 * @author Bumjin Joo
 */
public class Insert extends Handler implements Route {
  /**
   * Inserts into a database.
   *
   * @param request request from frontend
   * @param response response from frontend
   * @return String of table requested
   * @throws SQLException thrown if SQL exception
   */
  @Override
  public Integer handle(Request request, Response response) throws SQLException {
    JSONObject json;
    String tableName;
    Map<String, String> newRow;
    try {
      json = new JSONObject(request.body());
      tableName = json.getString("tb_name");
      JSONObject newRowData = json.getJSONObject("new_row");
      newRow = jsonObjectToMap(newRowData);
    } catch (JSONException | NullPointerException e) {
      System.out.println(e.getMessage());
      return -1;
    }

    List<String> params = new ArrayList<>();
    if (newRow.size() > 0) {
      String command = "INSERT INTO " + tableName;

      String cols = " (";
      String values = "VALUES (";
      for (Map.Entry<String, String> entry : newRow.entrySet()) {
        cols = cols + entry.getKey() + ", ";
        values = values + "?, ";
        params.add(entry.getValue());
      }

      cols = cols.substring(0, cols.length() - 2) + ") ";
      values = values.substring(0, values.length() - 2) + ") ";

      command = command + cols + values;
      command = command + ";";

      getDB().executeQuery(command, params);
    }

    return 1;
  }
}
