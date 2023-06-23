package edu.brown.cs.student.repl;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Abstract class to parse REPL commands.
 * @author Justin Rhee
 */
public abstract class ParseCommand {
  /**
   * Parses a REPL command.
   *
   * @param input Input to parse
   * @return String array of parsed input
   */
  public static String[] parseInput(String input) {
    List<String> matchList = new ArrayList<>();
    Pattern regex = Pattern.compile("[^\\s\"']+|\"([^\"]*)\"|'([^']*)'");
    Matcher regexMatcher = regex.matcher(input);
    while (regexMatcher.find()) {
      if (regexMatcher.group(1) != null) {
        matchList.add(regexMatcher.group(1));
      } else if (regexMatcher.group(2) != null) {
        matchList.add(regexMatcher.group(2));
      } else {
        matchList.add(regexMatcher.group());
      }
    }
    String[] output = new String[matchList.size()];
    output = matchList.toArray(output);
    return output;
  }
}
