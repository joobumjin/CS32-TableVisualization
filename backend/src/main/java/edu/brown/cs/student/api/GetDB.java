package edu.brown.cs.student.api;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import edu.brown.cs.student.database.DatabaseProxy;
import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Route;

import java.io.FileNotFoundException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Returns a Database.
 * @author Bumjin Joo
 */
public class GetDB extends Handler implements Route {
  /**
   * Returns the connected database.
   *
   * @param request request from frontend
   * @param response response from frontend
   * @return String of table names in the database.
   * @throws SQLException thrown if SQL exception
   * @throws FileNotFoundException thrown if file not found
   * @throws ClassNotFoundException thrown if class not found
   */
  @Override
  public String handle(Request request, Response response) throws SQLException,
      FileNotFoundException, ClassNotFoundException {

    String dbPath;
    try {
      JSONObject json = new JSONObject(request.body());
      dbPath = json.getString("db_path");
    } catch (JSONException e) {
      System.out.println(e.getMessage());
      return "Failed.";
    }

    setDB(new DatabaseProxy(dbPath), false);
    setDBPath(dbPath);
    Map<String, List<String>> immutableMap = ImmutableMap.of("tb_names", getDB().getTableNames());

    Gson gson = new Gson();
    return gson.toJson(immutableMap);
  }
}
