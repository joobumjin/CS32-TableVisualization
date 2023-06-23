package edu.brown.cs.student.database;

import org.json.JSONException;
import org.junit.Test;

import java.io.FileNotFoundException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;

public class QueryOutputTest {

  @Test
  public void testToString() throws SQLException, ClassNotFoundException, FileNotFoundException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.loadDB("data/proj1_rec_data/sql/data.sqlite3");
    QueryOutput output = dbp.executeQuery("SELECT * FROM names LIMIT 1");
    assertEquals("id\tname\temail\t\n" +
            "1\tPetr Dillingstone\tpdillingstone0@nationalgeographic.com",
        output.toString());
  }

  @Test
  public void testToList() throws SQLException, ClassNotFoundException, FileNotFoundException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.loadDB("data/proj1_rec_data/sql/data.sqlite3");
    QueryOutput output = dbp.executeQuery("SELECT * FROM names LIMIT 1");
    assertEquals("[[id, name, email], " +
        "[1, Petr Dillingstone, pdillingstone0@nationalgeographic.com]]",
        output.toList().toString());
  }

  @Test
  public void testToMap() throws SQLException, ClassNotFoundException, FileNotFoundException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.loadDB("data/proj1_rec_data/sql/data.sqlite3");
    QueryOutput output = dbp.executeQuery("SELECT * FROM names LIMIT 1");
    Map<String, List<String>> expectedMap = new HashMap<>();
    expectedMap.put("id", new ArrayList<>());
    expectedMap.get("id").add("1");
    expectedMap.put("name", new ArrayList<>());
    expectedMap.get("name").add("Petr Dillingstone");
    expectedMap.put("email", new ArrayList<>());
    expectedMap.get("email").add("pdillingstone0@nationalgeographic.com");
    assertEquals(expectedMap, output.toMap());
  }

  @Test
  public void testToJSON() throws SQLException, ClassNotFoundException, FileNotFoundException,
      JSONException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.loadDB("data/proj1_rec_data/sql/data.sqlite3");
    QueryOutput output = dbp.executeQuery("SELECT * FROM names LIMIT 1");
    assertEquals("[{\"name\":\"Petr Dillingstone\",\"id\":\"1\"," +
            "\"email\":\"pdillingstone0@nationalgeographic.com\"}]", output.toJSON());
  }

  @Test
  public void testToJSONWithKey() throws SQLException, ClassNotFoundException, FileNotFoundException,
      JSONException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.loadDB("data/proj1_rec_data/sql/data.sqlite3");
    QueryOutput output = dbp.executeQuery("SELECT * FROM names LIMIT 1");
    assertEquals("[{\"name\":\"Petr Dillingstone\",\"id\":\"1\",\"primary_key\":\"id\"," +
            "\"email\":\"pdillingstone0@nationalgeographic.com\"}]",
        output.toJSONWithKey());
  }
}
