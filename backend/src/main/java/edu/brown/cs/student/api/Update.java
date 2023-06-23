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
 * Updates a database.
 * @author Bumjin Joo
 */
public class Update extends Handler implements Route {
  /**
   * Updates a database.
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
    Map<String, String> oldRow;
    Map<String, String> newRow;
    try {
      json = new JSONObject(request.body());
      tableName = json.getString("tb_name");
      JSONObject oldRowData = json.getJSONObject("old_row");
      oldRow = jsonObjectToMap(oldRowData);
      JSONObject newRowData = json.getJSONObject("new_row");
      newRow = jsonObjectToMap(newRowData);
    } catch (JSONException | NullPointerException e) {
      System.out.println(e.getMessage());
      return -1;
    }

    if (oldRow.size() > 0 && newRow.size() > 0) {
      List<String> params = new ArrayList<>();
      String command = "UPDATE " + tableName + " SET ";
      for (Map.Entry<String, String> entry : newRow.entrySet()) {
        command = command + entry.getKey() + " = ?, ";
        params.add(entry.getValue());
      }
      command = command.substring(0, command.length() - 2);
      command = command + " WHERE ";

      for (Map.Entry<String, String> entry : oldRow.entrySet()) {
        command = command + entry.getKey() + " = ? AND ";
        params.add(entry.getValue());
      }

      command = command.substring(0, command.length() - 5) + ";";

      getDB().executeQuery(command, params);
    }
    return 1;
  }
}
