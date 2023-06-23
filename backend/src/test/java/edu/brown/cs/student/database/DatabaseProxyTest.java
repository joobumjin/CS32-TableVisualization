package edu.brown.cs.student.database;

import edu.brown.cs.student.api.Insert;
import edu.brown.cs.student.api.Update;
import org.junit.Test;

import java.io.FileNotFoundException;
import java.sql.SQLException;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

public class DatabaseProxyTest {
  @Test
  public void testLoadAndExecute() throws SQLException, FileNotFoundException, ClassNotFoundException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.loadDB("data/proj1_rec_data/sql/data.sqlite3");
    QueryOutput output = dbp.executeQuery("SELECT * FROM names LIMIT 1");
    assertEquals("id\tname\temail\t\n" +
            "1\tPetr Dillingstone\tpdillingstone0@nationalgeographic.com",
        output.toString());
    assertThrows(SQLException.class, () -> dbp.executeQuery("SELECT * FROM tim LIMIT 1"));
  }

  @Test
  public void testClearCache() throws SQLException, FileNotFoundException, ClassNotFoundException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.clearCache();
  }

  @Test
  public void testChangePermissions() throws SQLException, FileNotFoundException, ClassNotFoundException {
    DatabaseProxy dbp = new DatabaseProxy("data/proj1_rec_data/sql/data.sqlite3");
    dbp.changePermissions("names", "RW");
    dbp.changePermissions("names", "R");
    dbp.changePermissions("names", "W");
    assertThrows(SQLException.class, () -> dbp.executeQuery("SELECT * FROM names LIMIT 1"));
  }

  @Test
  public void misc() throws SQLException {
    Update update = new Update();
    update.handle(null, null);
    Insert insert = new Insert();
    insert.handle(null, null);
  }
}
