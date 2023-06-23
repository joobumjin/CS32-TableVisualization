package edu.brown.cs.student.database;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class DBPCommandsTest {
  @Test
  public void testDBPCommands() {
    Connect connect = new Connect();
    Run run = new Run(connect);
    DatabaseCommandsContainer dbpCommands = new DatabaseCommandsContainer();
    connect.execute("data/proj1_rec_data/sql/zoo.sqlite3");
    run.execute("SELECT * FROM zoo LIMIT 2");
    assertEquals("RW", connect.getDatabase().getPermissions().get("zoo"));
    dbpCommands.execute("connect", "data/proj1_rec_data/sql/zoo.sqlite3");
    dbpCommands.execute("run", "SELECT * FROM zoo LIMIT 2");
  }
}
