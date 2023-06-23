package edu.brown.cs.student.database;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.checkerframework.checker.nullness.qual.NonNull;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.ResultSet;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Database proxy class. Acts as a proxy between a SQL database.
 * @author Justin Rhee
 */
public class DatabaseProxy implements IDatabaseProxy {
  private Connection conn;
  private Map<String, String> permissions;
  private static final String DEFAULT_PERMISSION = "RW";
  private List<String> tableNames;
  private static final Map<String, String> SQL_COMMAND_PERMISSIONS = new HashMap<>() {
    {
      put("SELECT", "R");
      put("INSERT", "W");
      put("DROP", "RW");
      put("UPDATE", "RW");
      put("DELETE", "RW");
      put("ALTER", "RW");
      put("JOIN", "R");
      put("TRUNCATE", "RW");
    }
  };

  private final LoadingCache<String, QueryOutput> cache;
  private static final int MAXIMUM_CACHE_SIZE = 10;

  /**
   * Constructs a database proxy from a path to a SQL database.
   *
   * @param filename path to a SQL database
   * @throws ClassNotFoundException exception thrown by Class.forName
   * @throws SQLException exception thrown by invalid SQL operations
   * @throws FileNotFoundException thrown when file indicated by filepath is not found
   */
  public DatabaseProxy(String filename) throws
      ClassNotFoundException, SQLException, FileNotFoundException {

    this.permissions = null;

    File f = new File(filename);
    if (!f.exists()) {
      throw new FileNotFoundException("File not found");
    }

    cache = CacheBuilder.newBuilder().maximumSize(MAXIMUM_CACHE_SIZE).build(new CacheLoader<>() {
      @Override
      public QueryOutput load(@NonNull String query) {
        try {
          return new QueryOutput(conn, query, false);
        } catch (SQLException e) {
          return new QueryOutput();
        }
      }
    });

    loadDB(filename);
  }

  /**
   * Connects to a SQL database.
   *
   * @param filename path to a SQL database
   * @throws ClassNotFoundException exception thrown by Class.forName
   * @throws SQLException exception thrown by invalid SQL operations
   */
  public void loadDB(String filename) throws ClassNotFoundException, SQLException {
    Class.forName("org.sqlite.JDBC");
    String urlToDB = "jdbc:sqlite:" + filename;
    Connection connTemp = DriverManager.getConnection(urlToDB);
    Statement stat = connTemp.createStatement();
    stat.executeUpdate("PRAGMA foreign_keys=ON;");

    conn = connTemp;
    this.permissions = new HashMap<>();
    this.tableNames = new ArrayList<>();
    this.setDefaultPermissions();
  }

  /**
   * Executes a provided SQL query and returns the ResultSet.
   *
   * @param query SQL query to execute
   * @return ResultSet of the query
   * @throws SQLException exception thrown by invalid SQL operations
   */
  public QueryOutput executeQuery(String query) throws SQLException {
    this.checkPermissions(query);
    if (this.checkWrite(query)) {
      cache.invalidateAll(); // invalidates cached data due to update on database
      return new QueryOutput(conn, query, true);
    } else {
      QueryOutput output = cache.getUnchecked(query);
      if (!output.getIsValid()) {
        cache.invalidate(query);
        throw new SQLException("SQL Exception");
      }
      return output;
    }
  }

  /**
   * Executes a provided SQL query and returns the ResultSet.
   * @author Bumjin
   *
   * @param query SQL query to execute
   * @param params the SQL parameters to be set in the query string
   * @return ResultSet of the query
   * @throws SQLException exception thrown by invalid SQL operations
   */
  public QueryOutput executeQuery(String query, List<String> params)
      throws SQLException {
    this.checkPermissions(query);
    if (this.checkWrite(query)) {
      cache.invalidateAll(); // invalidates cached data due to update on database
      return new QueryOutput(conn, query, params, true);
    } else {
      QueryOutput output = cache.getUnchecked(query);
      if (!output.getIsValid()) {
        cache.invalidate(query);
        throw new SQLException("SQL Exception");
      }
      return output;
    }
  }

  /**
   * Returns a copy of the map of current table permissions.
   *
   * @return a copy of the map of current table permissions
   */
  public Map<String, String> getPermissions() {
    return Map.copyOf(this.permissions);
  }

  /**
   * Changes table permissions given a table and a new permission to set.
   *
   * @param table table whose permissions to change
   * @param permission permission to set
   * @throws SQLException exception thrown by invalid SQL operations
   */
  public void changePermissions(String table, String permission) throws SQLException {
    if (this.permissions != null) {
      if (this.permissions.containsKey(table)) {
        this.permissions.put(table, permission);
      } else {
        throw new SQLException("Table doesn't exist");
      }
    } else {
      throw new SQLException("Database not loaded");
    }
  }

  /**
   * Changes table permissions given a Map of table permissions.
   *
   * @param newPermissions map of new permissions to set
   * @throws SQLException exception thrown by invalid SQL operations
   */
  public void changePermissions(Map<String, String> newPermissions) throws SQLException {
    if (this.permissions != null) {
      this.permissions.putAll(newPermissions);
    } else {
      throw new SQLException("Database not loaded");
    }
  }

  /**
   * Sets table permissions to the default permission.
   *
   * @throws SQLException exception thrown by invalid SQL operations
   */
  private void setDefaultPermissions() throws SQLException {
    String[] types = {"TABLE"};
    ResultSet tables = conn.getMetaData().getTables(null, null, null, types);
    while (tables.next()) {
      this.permissions.put(tables.getString("TABLE_NAME"), DEFAULT_PERMISSION);
      tableNames.add(tables.getString("TABLE_NAME"));
    }
  }

  /**
   * Checks if all tables have the correct permissions before executing a provided query.
   *
   * @param query SQL query to check
   * @throws SQLException thrown when there is an invalid read or write to a table
   */
  private void checkPermissions(String query) throws SQLException {
    Map<String, List<String>> permsToTables = new HashMap<>() {
      {
        put("R", new ArrayList<>());
        put("W", new ArrayList<>());
        put("RW", new ArrayList<>());
      }
    };

    String[] queryArray = parseQuery(query);
    if (queryArray[0].equals("CREATE")) {
      return;
    }

    String currentPermission = DEFAULT_PERMISSION;
    for (String s : queryArray) {
      if (SQL_COMMAND_PERMISSIONS.containsKey(s)) {
        currentPermission = SQL_COMMAND_PERMISSIONS.get(s);
        continue;
      }
      permsToTables.get(currentPermission).add(s);
    }

    for (Map.Entry<String, List<String>> entry : permsToTables.entrySet()) {
      String permission = entry.getKey();
      List<String> tablesToCheck = entry.getValue();
      for (String table : tablesToCheck) {
        if (this.permissions.get(table) == null || this.permissions.get(table).equals("RW")) {
          continue;
        }
        if (!this.permissions.get(table).equals(permission)) {
          throw new SQLException("Wrong permissions");
        }
      }
    }
  }

  /**
   * Checks if a query requires write permissions.
   *
   * @param query SQL query to check
   */
  private boolean checkWrite(String query) {
    String[] queryArray = parseQuery(query);
    for (String s : queryArray) {
      if (SQL_COMMAND_PERMISSIONS.containsKey(s)) {
        String requiredPermission = SQL_COMMAND_PERMISSIONS.get(s);
        if (requiredPermission.equals("W") || requiredPermission.equals("RW")) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Parses a SQL query into a String array.
   *
   * @param query SQL query to parse.
   * @return String array representing the provided SQL query
   */
  private String[] parseQuery(String query) {
    String regex = "[\\s,]";
    return Arrays.stream(query.split(regex))
        .filter(str -> str != null && str.length() > 0)
        .toArray(String[]::new);
  }

  /**
   * Clears the cache.
   */
  public void clearCache() {
    cache.invalidateAll();
  }

  /**
   * Returns a list of table names in the loaded database.
   *
   * @return list of table names
   */
  public List<String> getTableNames() {
    return List.copyOf(this.tableNames);
  }
}
