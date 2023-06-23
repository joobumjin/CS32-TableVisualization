package edu.brown.cs.student.main;

import edu.brown.cs.student.api.Delete;
import edu.brown.cs.student.api.GetDB;
import edu.brown.cs.student.api.GetLoaded;
import edu.brown.cs.student.api.GetTable;
import edu.brown.cs.student.api.GetTableDep;
import edu.brown.cs.student.api.Insert;
import edu.brown.cs.student.api.Update;
import edu.brown.cs.student.api.Demo;
import edu.brown.cs.student.database.StaticDBPCommands;
import edu.brown.cs.student.repl.CommandContainer;
import edu.brown.cs.student.repl.REPL;
import joptsimple.OptionParser;
import joptsimple.OptionSet;
import spark.Spark;

import java.io.IOException;

/**
 * The Main class of our project. This is where execution begins.
 *
 */

public final class Main {

  private static final int DEFAULT_PORT = 4567;

  /**
   * The initial method called when execution begins.
   *
   * @param args An array of command line arguments
   */
  public static void main(String[] args) {
    new Main(args).run();
  }

  private String[] args;

  private Main(String[] args) {
    this.args = args;
  }

  private void run() {
    OptionParser parser = new OptionParser();
    parser.accepts("gui");
    parser.accepts("port").withRequiredArg().ofType(Integer.class).defaultsTo(DEFAULT_PORT);

    OptionSet options = parser.parse(args);

    if (options.has("gui")) {
      runSparkServer((int) options.valueOf("port"));
    }

    try {
      REPL repl = new REPL();
      CommandContainer dbCommands = new StaticDBPCommands();
      repl.addCommand("connect", dbCommands);
      repl.addCommand("run", dbCommands);
      repl.startREPL();
    } catch (IOException e) {
      System.out.println("ERROR: Input error");
    }
  }

  private static void runSparkServer(int port) {
    Spark.port(port);
    Spark.externalStaticFileLocation("src/main/resources/static");

    Spark.options("/*", (request, response) -> {
      String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
      if (accessControlRequestHeaders != null) {
        response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
      }

      String accessControlRequestMethod = request.headers("Access-Control-Request-Method");

      if (accessControlRequestMethod != null) {
        response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
      }

      return "OK";
    });

    Spark.before((request, response) -> response.header("Access-Control-Allow-Origin", "*"));

    // Put Routes Here
    Spark.get("/get_loaded", new GetLoaded());
    Spark.get("/demo", new Demo());
    Spark.post("/get_table", new GetTable());
    //Spark.post("/get_table_old", new GetTableDep());
    Spark.post("/get_db", new GetDB());
    Spark.post("/delete", new Delete());
    Spark.post("/insert", new Insert());
    Spark.post("/update", new Update());
    Spark.init();
  }
}
