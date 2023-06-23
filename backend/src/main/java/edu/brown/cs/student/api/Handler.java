package edu.brown.cs.student.api;

import edu.brown.cs.student.database.DatabaseProxy;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Contains shared metadata of the database.
 */
public abstract class Handler {
  private static DatabaseProxy db;
  private static String dbpath;
  private static String curTable;
  private static boolean loadedFromREPL;

  /**
   * Sets database proxy.
   *
   * @param dbp database proxy
   * @param fromREPL flag for whether the database was loaded from the REPL
   */
  public static void setDB(DatabaseProxy dbp, boolean fromREPL) {
    db = dbp;
    curTable = dbp.getTableNames().get(0);
    loadedFromREPL = fromREPL;
  }

  /**
   * Returns database proxy.
   * @return connected database proxy
   */
  public static DatabaseProxy getDB() {
    return db;
  }

  /**
   * Sets currently viewed table.
   *
   * @param name name of table being viewed
   */
  public static void setCurTable(String name) {
    curTable = name;
  }

  /**
   * Gets the current table.
   *
   * @return name of current table.
   */
  public static String getCurTable() {
    return curTable;
  }

  /**
   * Gets whether the database was loaded from the REPL.
   *
   * @return flag for if the database was loaded from the REPL
   */
  public static boolean getLoadedFromREPL() {
    return loadedFromREPL;
  }

  /**
   * Sets the path to the loaded database.
   *
   * @param path path to the loaded database
   */
  public static void setDBPath(String path) {
    dbpath = path;
  }

  /**
   * Returns the path to the connected database.
   *
   * @return the path to the connected database
   */
  public static String getDBPath() {
    return dbpath;
  }

  public static Map<String, String> jsonObjectToMap(JSONObject json) throws JSONException {
    Map<String, String> jsonMap = new HashMap<>();
    Iterator<String> keyIterator = json.keys();

    while (keyIterator.hasNext()) {
      String curKey = keyIterator.next();
      String colValue = json.getString(curKey);
      jsonMap.put(curKey, colValue);
    }

    return jsonMap;
  }
}
