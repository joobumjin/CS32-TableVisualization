package edu.brown.cs.student.repl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

/**
 * This class is meant to represent an abstracted REPL which can take in any command.
 * This class is not responsible for any of the command execution. Instead, it simply calls
 * a universal .execute() on the command, given that the REPL was provided a command call (String)
 * and an associated CommandContainer.
 * @author Bumjin Joo
 */
public class REPL {
  private final Map<String, CommandContainer> commands;

  /**
   * Default constructor.
   * For the purposes of Sprint1, this constructor assumes that certain commands regarding
   * kd trees, bloom filters, and stars will be desired.
   */
  public REPL() {
    this.commands = new HashMap<>();
  }

  /**
   * This method should be used to add a command to the HashMap of possible commands.
   * @param commandCall is the command call that should be recognized from user input (i.e.
   *                    the String entered by the user to call the command).
   * @param newCommands is the CommandContainer that contains the desired commands for when the
   *                    command is called.
   */
  public void addCommand(String commandCall, CommandContainer newCommands) {
    commands.put(commandCall, newCommands);
  }

  /**
   * This method begins the REPL loop and has the main functionality of accepting the user
   * input and parsing which command is being called from that input. The loop ends
   * once the inputReader hits the end of the stream.
   *
   * @throws IOException if the inputReader experiences an IOReader
   * @author Bumjin Joo
   */
  public void startREPL() throws IOException {
    BufferedReader inputReader = new BufferedReader(new InputStreamReader(System.in));
    String command = inputReader.readLine();

    // loop is used to keep accepting commands, is broken by any of the errors below
    while (command != null) {
      try {
        String[] commList = command.split(" ", 2);

        if (commList.length > 0) {
          CommandContainer comm = this.commands.get(commList[0]);

          if (comm != null) {
            if (commList.length == 2) {
              try {
                comm.execute(commList[0], commList[1]);
              } catch (NullPointerException e) {
                System.out.println("ERROR: Command " + commList[0] + " Not Found");
              }
            } else { // no arguments
              try {
                comm.execute(commList[0], "");
              } catch (NullPointerException e) {
                System.out.println("ERROR: Command " + commList[0] + " Not Found");
              }
            }
          } else {
            System.out.println("ERROR: Unknown Command");
          }
        } else {
          System.out.println("ERROR: No Command Given");
        }

        command = inputReader.readLine();

      } catch (IOException e) {
        System.out.println("ERROR: User Input Error");
      }
    }
  }
}
