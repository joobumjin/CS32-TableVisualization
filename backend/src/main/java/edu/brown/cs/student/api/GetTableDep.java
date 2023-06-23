package edu.brown.cs.student.api;

import edu.brown.cs.student.database.QueryOutput;
import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Route;

import java.sql.SQLException;

/**
 * Returns a JSON of a table for a given database (deprecated).
 * @author Justin Rhee
 */
public class GetTableDep extends Handler implements Route {
  /**
   * Returns a JSON of a table for a given database.
   *
   * @param request request from frontend
   * @param response response from frontend
   * @return String of table requested
   * @throws SQLException thrown if SQL exception
   * @throws JSONException thrown if JSON error
   */
  @Override
  public String handle(Request request, Response response) throws SQLException, JSONException {
    try {
      JSONObject json = new JSONObject(request.body());
      if (!getLoadedFromREPL()) {
        setCurTable(json.getString("tb_name"));
      }
    } catch (JSONException e) {
      System.out.println(e.getMessage());
      return "-1";
    }

    QueryOutput table = getDB().executeQuery("SELECT * FROM " + getCurTable());
    return table.toJSONWithKey();
  }
}
