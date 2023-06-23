package edu.brown.cs.student.repl;

/**
 * An interface that should be used to represent commands that can be executed by the REPL class
 * if it is contained in a CommandContainer.
 */
public interface REPLCommand {
  /**
   * This method should be called to execute the functionality of the Command based on the
   * (optional) arguments passed in through String args.
   * @param args represents the arguments that may be necessary for command execution. Parsing of
   *             the arguments should occur in the instance of the REPLCommand.
   */
  void execute(String args);
}
