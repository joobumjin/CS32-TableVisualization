package edu.brown.cs.student.api;

import spark.Request;
import spark.Response;
import spark.Route;

/**
 * Demo which prints hello to the console.
 */
public class Demo extends Handler implements Route {
  /**
   * Updates a database.
   *
   * @param request request from frontend
   * @param response response from frontend
   */
  @Override
  public String handle(Request request, Response response) {
    System.out.println("hello!");
    return "";
  }
}
