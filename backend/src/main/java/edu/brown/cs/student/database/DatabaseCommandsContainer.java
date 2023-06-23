package edu.brown.cs.student.database;

import edu.brown.cs.student.repl.CommandContainer;
import edu.brown.cs.student.repl.REPLCommand;

import java.util.HashMap;
import java.util.Map;

/**
 * Wrapper to facilitate data sharing between commands.
 * @author Justin Rhee
 */
public class DatabaseCommandsContainer implements CommandContainer {
  private final Map<String, REPLCommand> commands = new HashMap<>();

  /**
   * Constructs database commands container.
   */
  public DatabaseCommandsContainer() {
    Connect connect = new Connect();
    Run run = new Run(connect);
    commands.put("connect", connect);
    commands.put("run", run);
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
}
