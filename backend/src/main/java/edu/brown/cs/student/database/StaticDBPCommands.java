package edu.brown.cs.student.database;

import edu.brown.cs.student.repl.CommandContainer;
import edu.brown.cs.student.repl.REPLCommand;

import java.util.HashMap;
import java.util.Map;

/**
 * Contains the static database proxy commands.
 */
public class StaticDBPCommands implements CommandContainer {
  private final Map<String, REPLCommand> commands = new HashMap<>();

  /**
   * Constructs database commands container.
   */
  public StaticDBPCommands() {
    commands.put("connect", new StaticConnectWrapper());
    commands.put("run", new StaticRunWrapper());
  }

  /**
   * Runs a database command.
   *
   * @param command represents the command that should be called from the commands contained
   *                by an instance of this interface.
   * @param args represents the args that should be passed to the command by the container.
   * @throws NullPointerException if command not found
   */
  @Override
  public void execute(String command, String args) throws NullPointerException {
    try {
      this.commands.get(command).execute(args);
    } catch (NullPointerException e) {
      throw new NullPointerException("Command not found");
    }
  }

  /**
   * Static wrapper class for connect command.
   */
  private static class StaticConnectWrapper implements REPLCommand {
    /**
     * Method to connect to a SQL database from the REPL.
     *
     * @param args represents the arguments that may be necessary for command execution. Parsing of
     *             the arguments should occur in the instance of the REPLCommand.
     */
    @Override
    public void execute(String args) {
      StaticConnect.execute(args);
    }
  }

  /**
   * Static wrapper class for run command.
   */
  private static class StaticRunWrapper implements REPLCommand {
    /**
     * Executes a SQL query and returns a String representation of the output.
     *
     * @param args represents the arguments that may be necessary for command execution. Parsing of
     *             the arguments should occur in the instance of the REPLCommand.
     */
    @Override
    public void execute(String args) {
      StaticRun.execute(args);
    }
  }
}
