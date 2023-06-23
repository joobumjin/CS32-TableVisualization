package edu.brown.cs.student.repl;

/**
 * This abstract class is meant to represent a set of classes which will contain several
 * intertwined REPLCommands that have shared states.
 * @author Bumjin
 */
public interface CommandContainer {
  /**
   * Executes the functionality of the command as described by String command by accessing the
   * command associated with String command and applying the arguments String args.
   * @param command represents the command that should be called from the commands contained
   *                by an instance of this interface.
   * @param args represents the args that should be passed to the command by the container.
   * @throws NullPointerException if the command described by String command is not present
   *                              in the container.
   */
  void execute(String command, String args) throws NullPointerException;
}
