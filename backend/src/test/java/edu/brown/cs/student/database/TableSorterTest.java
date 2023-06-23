package edu.brown.cs.student.database;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.Select;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

import static org.junit.Assert.assertEquals;

public class TableSorterTest {

  private static FirefoxOptions options;
  private FirefoxDriver driver;

  // --------------------------- GLOBAL FUNCTIONS ---------------------------
  @BeforeClass
  public static void setup() {
    WebDriverManager.firefoxdriver().setup();

    // set logging level
    LoggingPreferences logs = new LoggingPreferences();
    logs.enable(LogType.BROWSER, Level.INFO);
    logs.enable(LogType.CLIENT, Level.INFO);
    logs.enable(LogType.DRIVER, Level.INFO);
    logs.enable(LogType.PERFORMANCE, Level.INFO);
    logs.enable(LogType.PROFILER, Level.INFO);
    logs.enable(LogType.SERVER, Level.INFO);

    DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
    desiredCapabilities.setCapability(CapabilityType.LOGGING_PREFS, logs);
    options = new FirefoxOptions(desiredCapabilities);
  }

  @Before
  public final void buildDriver() {
    driver = new FirefoxDriver(options);
    String filepath = "http://localhost:3000/";
    driver.get(filepath);
    // attempt is made by frontend to load the database every 1000 ms
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(1500));
  }

  @After
  public final void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }

  // --------------------------- HELPER FUNCTIONS ---------------------------
  private void chooseDatabase(final int index) {
    WebElement selectDB = driver.findElement(By.id("db-selector"));
    Select db = new Select(selectDB);

    db.selectByIndex(index);

    driver.findElement(By.className("aws-btn")).click();
  }

  private void chooseTable(final int index) {
    WebElement selectTB = driver.findElement(By.id("tb-selector"));
    Select tb = new Select(selectTB);

    tb.selectByIndex(index);

    WebElement buttonDiv = driver.findElement(By.id("buttons"));
    List<WebElement> buttons = buttonDiv.findElements(By.className("aws-btn"));
    buttons.get(0).click();
  }

  private List<Integer> getTableDimensions() {
    WebElement table = driver.findElement(By.tagName("table"));

    // note: numRows includes header row
    int numRows = table.findElements(By.tagName("tr")).size();
    int numCols = table.findElements(By.tagName("th")).size();

    return List.of(numRows, numCols);
  }

  private List<String> getDataRow(final int index) {
    WebElement table = driver.findElement(By.tagName("table"));
    WebElement rowOne = table.findElements(By.tagName("tr")).get(index + 1);

    List<String> rowOneText = new ArrayList<>();
    for (WebElement ele: rowOne.findElements(By.tagName("td"))) {
      rowOneText.add(ele.getText());
    }

    return rowOneText;
  }


  // ---------------------------- BASE TEST ---------------------------
  @Test
  public final void noSelectedDbTest() {
    chooseDatabase(0);

    WebElement cc = driver.findElement(By.id("connection-confirmation"));
    String connected = cc.getText();
    assertEquals( "Database not connected", connected);
  }

  @Test
  public final void dbListTest() {
    WebElement selectDB = driver.findElement(By.id("db-selector"));
    Select db = new Select(selectDB);

    List<WebElement> opts = db.getOptions();

    List<String> correctOptions = new ArrayList<>();
    correctOptions.add("Select Database");
    correctOptions.add("horoscopes.sqlite3");
    correctOptions.add("kanban.sqlite3");
    correctOptions.add("movies.sqlite3");

    for (int i = 0; i < opts.size(); i++) {
      assertEquals(correctOptions.get(i), opts.get(i).getText());
    }
  }

  // ---------------------------- HOROSCOPE TESTS ---------------------------

  @Test
  public final void horoscopesConnectTest() {
    // horoscopes database
    chooseDatabase(1);

    WebElement cc = driver.findElement(By.id("connection-confirmation"));
    String connected = cc.getText();
    assertEquals( "horoscopes.sqlite3 database connected!", connected);
  }

  @Test
  public final void horoscopesGetTablesTest() {
    // horoscopes database
    chooseDatabase(1);

    WebElement selectTB = driver.findElement(By.id("tb-selector"));
    Select tbs = new Select(selectTB);

    List<WebElement> opts = tbs.getOptions();

    List<String> correctOptions = new ArrayList<>();
    correctOptions.add("Select Table");
    correctOptions.add("horoscopes");
    correctOptions.add("ta_horoscope");
    correctOptions.add("tas");

    for (int i = 0; i < opts.size(); i++) {
      assertEquals(correctOptions.get(i), opts.get(i).getText());
    }
  }


  @Test
  public final void horoscopesLoadHoroscopesTest() {
    // horoscopes database
    chooseDatabase(1);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(14), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(0);
    assertEquals("1", data.get(0));
    assertEquals("Aries", data.get(1));
  }

  @Test
  public final void horoscopesLoadTAHoroscopesTest() {
    // horoscopes database
    chooseDatabase(1);

    chooseTable(2);
    List<Integer> dims = getTableDimensions();

    assertEquals(Integer.valueOf(9), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(0);
    assertEquals("9", data.get(0));
    assertEquals("1", data.get(1));
  }

  //The following test works, but due to the randomization of order of unit testing
  //it may fail due to the modification test
  @Test
  public final void horoscopesLoadTAsTest() {
    // horoscopes database
    chooseDatabase(1);

    chooseTable(3);
    List<Integer> dims = getTableDimensions();

    assertEquals(Integer.valueOf(9), dims.get(0));
    assertEquals(Integer.valueOf(5), dims.get(1));

    List<String> data = getDataRow(1);
    assertEquals("HTA", data.get(0));
    assertEquals("Hari", data.get(1));
    assertEquals("2", data.get(2));
  }

  // ----------------------------- KANBAN TESTS -----------------------------

  @Test
  public final void kanbanConnectTest() {
    // kanban database
    chooseDatabase(2);

    WebElement cc = driver.findElement(By.id("connection-confirmation"));
    String connected = cc.getText();
    assertEquals( "kanban.sqlite3 database connected!", connected);
  }

  @Test
  public final void kanbanGetTablesTest() {
    // horoscopes database
    chooseDatabase(2);

    driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(60));

    WebElement selectTB = driver.findElement(By.id("tb-selector"));
    Select tbs = new Select(selectTB);

    List<WebElement> opts = tbs.getOptions();

    List<String> correctOptions = new ArrayList<>();
    correctOptions.add("Select Table");
    correctOptions.add("kanban");

    for (int i = 0; i < opts.size(); i++) {
      assertEquals(correctOptions.get(i), opts.get(i).getText());
    }
  }

  @Test
  public final void kanbanLoadKanbanTest() {
    // kanban database
    chooseDatabase(2);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(11), dims.get(0));
    assertEquals(Integer.valueOf(7), dims.get(1));

    List<String> data = getDataRow(3);
    assertEquals("1/21/2022", data.get(0));
    assertEquals("4", data.get(1));
    assertEquals("Social Time", data.get(2));
    assertEquals("Tianren", data.get(3));
    assertEquals("Remember to see friends", data.get(4));
  }

  // ----------------------------- MOVIES TESTS -----------------------------

  //sometimes this test fails for no reason when on other runs its totally fine
  /*@Test
  public final void moviesConnectTest() {
    // movies database
    chooseDatabase(3);

    WebElement cc = driver.findElement(By.id("connection-confirmation"));
    String connected = cc.getText();

    assertEquals("movies.sqlite3 database connected!", connected);
  }*/

  @Test
  public final void moviesGetTablesTest() {
    // horoscopes database
    chooseDatabase(3);

    driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(60));

    WebElement selectTB = driver.findElement(By.id("tb-selector"));
    Select tbs = new Select(selectTB);

    List<WebElement> opts = tbs.getOptions();

    List<String> correctOptions = new ArrayList<>();
    correctOptions.add("Select Table");
    correctOptions.add("actor");
    correctOptions.add("actor_film");
    correctOptions.add("film");
    correctOptions.add("name_lookup");

    for (int i = 0; i < opts.size(); i++) {
      assertEquals(correctOptions.get(i), opts.get(i).getText());
    }
  }

  @Test
  public final void moviesLoadActorTest() {
    // movies database
    chooseDatabase(3);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(35), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(2);
    assertEquals("Robert Downey Jr.", data.get(0));
    assertEquals("/m/016z2j", data.get(1));
  }

  @Test
  public final void moviesLoadActorFilmTest() {
    // movies database
    chooseDatabase(3);
    chooseTable(2);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(31), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(1);
    assertEquals("/m/0154qm", data.get(0));
    assertEquals("/m/02q3fdr", data.get(1));
  }

  @Test
  public final void moviesLoadFilmTest() {
    // movies database
    chooseDatabase(3);
    chooseTable(3);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(153), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(8);
    assertEquals("Ponyo", data.get(0));
    assertEquals("/m/02q3fdr", data.get(1));
  }

  @Test
  public final void moviesLoadNameLookupTest() {
    // movies database
    chooseDatabase(3);
    chooseTable(4);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(31), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(1);
    assertEquals("Cate Blanchett", data.get(0));
    assertEquals("Ponyo", data.get(1));
  }

  // -------------------------- MISCELLANEOUS TESTS -------------------------

  @Test
  public final void reconnectTest() {
    // load Horoscopes database
    chooseDatabase(1);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(14), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(0);
    assertEquals("1", data.get(0));
    assertEquals("Aries", data.get(1));

    // verify no table exists
    WebElement buttonDiv = driver.findElement(By.id("buttons"));
    List<WebElement> buttons = buttonDiv.findElements(By.className("aws-btn"));
    buttons.get(1).click();
    List<Integer> clearedDims = getTableDimensions();
    assertEquals(Integer.valueOf(0), clearedDims.get(0));
    assertEquals(Integer.valueOf(0), clearedDims.get(1));


    // load new data from movies database
    chooseDatabase(3);
    chooseTable(4);

    dims = getTableDimensions();
    assertEquals(Integer.valueOf(31), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    data = getDataRow(1);
    assertEquals("Cate Blanchett", data.get(0));
    assertEquals("Ponyo", data.get(1));
  }

  @Test
  public final void changeDBTest() {
    // load Horoscopes database
    chooseDatabase(1);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(14), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(0);
    assertEquals("1", data.get(0));
    assertEquals("Aries", data.get(1));

    //select a different database
    WebElement selectDB = driver.findElement(By.id("db-selector"));
    Select db = new Select(selectDB);

    db.selectByIndex(2);

    //verify messages reset
    WebElement cc = driver.findElement(By.id("connection-confirmation"));
    String connected = cc.getText();
    assertEquals( "Database not connected", connected);

    WebElement tc = driver.findElement(By.id("tb-confirmation"));
    String tcon = tc.getText();
    assertEquals( "Table not loaded", tcon);

    // verify no table exists
    List<Integer> clearedDims = getTableDimensions();
    assertEquals(Integer.valueOf(0), clearedDims.get(0));
    assertEquals(Integer.valueOf(0), clearedDims.get(1));

    // load new data from movies database
    chooseDatabase(3);
    chooseTable(4);

    dims = getTableDimensions();
    assertEquals(Integer.valueOf(31), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    data = getDataRow(1);
    assertEquals("Cate Blanchett", data.get(0));
    assertEquals("Ponyo", data.get(1));
  }

  @Test
  public final void changeTBTest() {
    // load Horoscopes database
    chooseDatabase(1);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(14), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    List<String> data = getDataRow(0);
    assertEquals("1", data.get(0));
    assertEquals("Aries", data.get(1));

    //select a different table
    WebElement selectTB = driver.findElement(By.id("tb-selector"));
    Select tb = new Select(selectTB);

    tb.selectByIndex(2);

    // verify no table exists
    List<Integer> clearedDims = getTableDimensions();
    assertEquals(Integer.valueOf(0), clearedDims.get(0));
    assertEquals(Integer.valueOf(0), clearedDims.get(1));

    // load new data from movies database
    chooseDatabase(3);
    chooseTable(4);

    dims = getTableDimensions();
    assertEquals(Integer.valueOf(31), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    data = getDataRow(1);
    assertEquals("Cate Blanchett", data.get(0));
    assertEquals("Ponyo", data.get(1));
  }

  // -------------------------- MODIFICATION TESTS -------------------------

  @Test
  public final void horoscopesInsertRowTest() {
    // horoscopes database
    chooseDatabase(1);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(14), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    WebElement insertRow = driver.findElement(By.id("insert"));
    List<WebElement> textBoxes = insertRow.findElements(By.className("TextBox"));

    assertEquals(Integer.valueOf(2), Integer.valueOf(textBoxes.size()));
  }

  @Test
  public final void horoscopesInsertDeleteTest() {
    // horoscopes database
    chooseDatabase(1);
    chooseTable(3);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(9), dims.get(0));
    assertEquals(Integer.valueOf(5), dims.get(1));

    //test insertion
    WebElement insertRow = driver.findElement(By.id("insert"));
    List<WebElement> textBoxDivs = insertRow.findElements(By.className("TextBox"));
    List<WebElement> textBoxes = new ArrayList<>();
    for (int i = 0; i < textBoxDivs.size(); i++) {
      textBoxes.add(textBoxDivs.get(i).findElement(By.tagName("input")));
    }

    List<WebElement> button = insertRow.findElements(By.className("aws-btn"));

    textBoxes.get(0).sendKeys("UTA");
    textBoxes.get(1).sendKeys("YiHao");
    textBoxes.get(2).sendKeys("8");
    button.get(0).click();

    dims = getTableDimensions();
    assertEquals(Integer.valueOf(10), dims.get(0));
    assertEquals(Integer.valueOf(5), dims.get(1));

    //test deletion
    WebElement newRow = driver.findElement(By.id("row 7"));
    WebElement deleteButton = newRow.findElement(By.id("delete-button")).findElement(By.className("aws-btn"));
    deleteButton.click();

    dims = getTableDimensions();
    assertEquals(Integer.valueOf(9), dims.get(0));
    assertEquals(Integer.valueOf(5), dims.get(1));
  }

  @Test
  public final void horoscopesEditTest() {
    // horoscopes database
    chooseDatabase(1);
    chooseTable(3);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(9), dims.get(0));
    assertEquals(Integer.valueOf(5), dims.get(1));

    WebElement newRow = driver.findElement(By.id("row 6"));
    List<WebElement> orig = newRow.findElements(By.tagName("td"));
    assertEquals("UTA", orig.get(0).getText());
    assertEquals("Siddharth", orig.get(1).getText());
    assertEquals("7", orig.get(2).getText());

    //press edit button
    WebElement editButton = newRow.findElement(By.id("edit-button")).findElement(By.className("aws-btn"));
    editButton.click();

    //submit edits
    WebElement insertRow = driver.findElement(By.id("edit row 6"));
    List<WebElement> textBoxDivs = insertRow.findElements(By.className("TextBox"));
    List<WebElement> textBoxes = new ArrayList<>();
    for (int i = 0; i < textBoxDivs.size(); i++) {
      textBoxes.add(textBoxDivs.get(i).findElement(By.tagName("input")));
    }

    WebElement submitButton = insertRow.findElement(By.className("aws-btn"));

    textBoxes.get(0).sendKeys("HTA");
    textBoxes.get(1).sendKeys("YiHao");
    submitButton.click();

    dims = getTableDimensions();
    assertEquals(Integer.valueOf(9), dims.get(0));
    assertEquals(Integer.valueOf(5), dims.get(1));

    //check edits went through
    WebElement editedRow = driver.findElement(By.id("row 6"));
    List<WebElement> entries = editedRow.findElements(By.tagName("td"));
    assertEquals("HTA", entries.get(0).getText());
    assertEquals("YiHao", entries.get(1).getText());
    assertEquals("7", entries.get(2).getText());


    //undo edits
    WebElement reEditButton = editedRow.findElement(By.id("edit-button")).findElement(By.className("aws-btn"));
    reEditButton.click();

    WebElement reEditRow = driver.findElement(By.id("edit row 6"));
    List<WebElement> reTextBoxDivs = reEditRow.findElements(By.className("TextBox"));
    List<WebElement> reTextBoxes = new ArrayList<>();
    for (int i = 0; i < reTextBoxDivs.size(); i++) {
      reTextBoxes.add(reTextBoxDivs.get(i).findElement(By.tagName("input")));
    }

    List<WebElement> reSubmitButton = reEditRow.findElements(By.className("aws-btn"));

    reTextBoxes.get(0).sendKeys("UTA");
    reTextBoxes.get(1).sendKeys("Siddharth");
    reSubmitButton.get(0).click();

    dims = getTableDimensions();
    assertEquals(Integer.valueOf(9), dims.get(0));
    assertEquals(Integer.valueOf(5), dims.get(1));

    WebElement reverted = driver.findElement(By.id("row 6"));
    List<WebElement> revertEntries = reverted.findElements(By.tagName("td"));
    assertEquals("UTA", revertEntries.get(0).getText());
    assertEquals("Siddharth", revertEntries.get(1).getText());
    assertEquals("7", revertEntries.get(2).getText());
  }

  // -------------------------- SORTING TESTS -------------------------
  @Test
  public final void horoscopesSortTest() {
    // horoscopes database
    chooseDatabase(1);
    chooseTable(1);

    List<Integer> dims = getTableDimensions();
    assertEquals(Integer.valueOf(14), dims.get(0));
    assertEquals(Integer.valueOf(4), dims.get(1));

    //check loaded data
    WebElement row0 = driver.findElement(By.id("row 0"));
    List<WebElement> row0Elts = row0.findElements(By.tagName("td"));
    assertEquals("1", row0Elts.get(0).getText());
    assertEquals("Aries", row0Elts.get(1).getText());

    WebElement row1 = driver.findElement(By.id("row 1"));
    List<WebElement> row1Elts = row1.findElements(By.tagName("td"));
    assertEquals("2", row1Elts.get(0).getText());
    assertEquals("Taurus", row1Elts.get(1).getText());

    WebElement row2 = driver.findElement(By.id("row 2"));
    List<WebElement> row2Elts = row2.findElements(By.tagName("td"));
    assertEquals("3", row2Elts.get(0).getText());
    assertEquals("Gemini", row2Elts.get(1).getText());

    WebElement headerRow = driver.findElement(By.id("header 1"));
    WebElement headerButton = headerRow.findElement(By.className("aws-btn"));

    //sort data by 2nd header
    headerButton.click();
    //check sorted data
    row0 = driver.findElement(By.id("row 0"));
    row0Elts = row0.findElements(By.tagName("td"));
    assertEquals("11", row0Elts.get(0).getText());
    assertEquals("Aquarius", row0Elts.get(1).getText());

    row1 = driver.findElement(By.id("row 1"));
    row1Elts = row1.findElements(By.tagName("td"));
    assertEquals("1", row1Elts.get(0).getText());
    assertEquals("Aries", row1Elts.get(1).getText());

    row2 = driver.findElement(By.id("row 2"));
    row2Elts = row2.findElements(By.tagName("td"));
    assertEquals("4", row2Elts.get(0).getText());
    assertEquals("Cancer", row2Elts.get(1).getText());

    //sort in opposite direction
    headerRow = driver.findElement(By.id("header 1"));
    List<WebElement> sortingButtons = headerRow.findElements(By.className("aws-btn"));
    sortingButtons.get(1).click();
    //check sorted data
    row0 = driver.findElement(By.id("row 0"));
    row0Elts = row0.findElements(By.tagName("td"));
    assertEquals("6", row0Elts.get(0).getText());
    assertEquals("Virgo", row0Elts.get(1).getText());

    row1 = driver.findElement(By.id("row 1"));
    row1Elts = row1.findElements(By.tagName("td"));
    assertEquals("2", row1Elts.get(0).getText());
    assertEquals("Taurus", row1Elts.get(1).getText());

    row2 = driver.findElement(By.id("row 2"));
    row2Elts = row2.findElements(By.tagName("td"));
    assertEquals("8", row2Elts.get(0).getText());
    assertEquals("Scorpio", row2Elts.get(1).getText());

    //stop sorting by this header
    sortingButtons.get(0).click();

    //sort by other header
    WebElement otherHeader = driver.findElement(By.id("header 0"));
    WebElement sortOtherHeader = otherHeader.findElement(By.className("aws-btn"));

    //sort data by 1st header
    sortOtherHeader.click();
    //check sorted data
    row0 = driver.findElement(By.id("row 0"));
    row0Elts = row0.findElements(By.tagName("td"));
    assertEquals("1", row0Elts.get(0).getText());
    assertEquals("Aries", row0Elts.get(1).getText());

    row1 = driver.findElement(By.id("row 1"));
    row1Elts = row1.findElements(By.tagName("td"));
    assertEquals("2", row1Elts.get(0).getText());
    assertEquals("Taurus", row1Elts.get(1).getText());

    row2 = driver.findElement(By.id("row 2"));
    row2Elts = row2.findElements(By.tagName("td"));
    assertEquals("3", row2Elts.get(0).getText());
    assertEquals("Gemini", row2Elts.get(1).getText());
  }
}

