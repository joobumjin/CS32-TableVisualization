package edu.brown.cs.student.api;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import spark.Request;
import spark.Response;
import spark.Route;

import java.util.Map;

/**
 * Gets loaded metadata.
 * @author Justin Rhee
 */
public class GetLoaded extends Handler implements Route {
  /**
   * Handles a request for loaded metadata.
   *
   * @param request request from frontend
   * @param response response from frontend
   * @return metadata about loaded database.
   */
  @Override
  public String handle(Request request, Response response) {

    String fromREPL = getLoadedFromREPL() ? "true" : "false";
    String path;
    String loaded;
    String curTable;

    if (getDBPath() == null) {
      loaded = "false";
      path = "";
      curTable = "";
    } else {
      loaded = "true";
      path = getDBPath();
      curTable = getCurTable();
    }

    Map<String, String> immutableMap = ImmutableMap.of(
        "db_path", path,
        "from_repl", fromREPL,
        "loaded", loaded,
        "cur_table", curTable);

    Gson gson = new Gson();
    return gson.toJson(immutableMap);
  }
}
