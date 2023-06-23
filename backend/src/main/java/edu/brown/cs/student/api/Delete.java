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
 * Deletes from a database.
 * @author Bumjin Joo
 */
public class Delete extends Handler implements Route {
  /**
   * Deletes from a given database based on request from frontend.
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
    Map<String, String> rowMap;
    try {
      json = new JSONObject(request.body());
      tableName = json.getString("tb_name");
      JSONObject rowData = json.getJSONObject("row");
      rowMap = jsonObjectToMap(rowData);
    } catch (JSONException | NullPointerException e) {
      System.out.println(e.getMessage());
      return -1;
    }

    List<String> params = new ArrayList<>();
    // instead of using primary key, just check all the columns
    String command = "DELETE FROM " + tableName + " WHERE ";

    for (Map.Entry<String, String> entry : rowMap.entrySet()) {
      command = command + entry.getKey() + " = ? AND ";
      params.add(entry.getValue());
    }

    command = command.substring(0, command.length() - 5) + ";";

    getDB().executeQuery(command, params);
    return 1;
  }
}
