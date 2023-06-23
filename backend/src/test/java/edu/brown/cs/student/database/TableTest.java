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

public class TableTest {

    //TODO: Javadocs, comments

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
        String filepath = "file:////Users/masonburke/Documents/GitHub/cs32/project-2-bjoo2-jrhee8-mburke15/frontend/table/table.html";
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

        driver.findElement(By.id("db-loader")).click();
    }

    private void chooseTable(final int index) {
        WebElement selectTB = driver.findElement(By.id("tb-selector"));
        Select db = new Select(selectTB);

        db.selectByIndex(index);

        driver.findElement(By.id("table-loader")).click();
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

    private List<String> getModDivInfo(final int index) {

        WebElement modifyDD = driver.findElement(By.id("modification-selector"));

        Select modifyButton = new Select(modifyDD);

        modifyButton.selectByIndex(index);

        List<WebElement> modDiv = driver.findElement(By.id("modification-div")).findElements(By.tagName("input"));

        List<String> innerTexts = new ArrayList<>();

        for (WebElement ele: modDiv) {
            innerTexts.add(ele.getAttribute("placeholder"));
        }

        return innerTexts;
    }


    // ---------------------------- HOROSCOPE TESTS ---------------------------
    @Test
    public final void horoscopesConnectTest() {
        // horoscopes database
        chooseDatabase(0);

        WebElement cc = driver.findElement(By.id("connection-confirmation"));
        String connected = cc.getText();
        assertEquals( "horoscopes.sqlite3 database connected!", connected);
    }

    @Test
    public final void horoscopesLoadHoroscopesTest() {
        // horoscopes database
        chooseDatabase(0);
        chooseTable(0);

        List<Integer> dims = getTableDimensions();
        assertEquals(Integer.valueOf(13), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        List<String> data = getDataRow(0);
        assertEquals("1", data.get(0));
        assertEquals("Aries", data.get(1));
    }

    @Test
    public final void horoscopesLoadTAHoroscopesTest() {
        // horoscopes database
        chooseDatabase(0);

        chooseTable(1);
        List<Integer> dims = getTableDimensions();

        assertEquals(Integer.valueOf(8), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        List<String> data = getDataRow(0);
        assertEquals("1", data.get(0));
        assertEquals("9", data.get(1));
    }

    @Test
    public final void horoscopesLoadTAsTest() {
        // horoscopes database
        chooseDatabase(0);

        chooseTable(2);
        List<Integer> dims = getTableDimensions();

        assertEquals(Integer.valueOf(8), dims.get(0));
        assertEquals(Integer.valueOf(3), dims.get(1));

        List<String> data = getDataRow(1);
        assertEquals("2", data.get(0));
        assertEquals("HTA", data.get(1));
        assertEquals("Hari", data.get(2));
    }

    // ----------------------------- KANBAN TESTS -----------------------------
    @Test
    public final void kanbanConnectTest() {
        // kanban database
        chooseDatabase(1);

        WebElement cc = driver.findElement(By.id("connection-confirmation"));
        String connected = cc.getText();
        assertEquals( "kanban.sqlite3 database connected!", connected);
    }

    @Test
    public final void kanbanLoadKanbanTest() {
        // kanban database
        chooseDatabase(1);
        chooseTable(0);

        List<Integer> dims = getTableDimensions();
        assertEquals(Integer.valueOf(10), dims.get(0));
        assertEquals(Integer.valueOf(5), dims.get(1));

        List<String> data = getDataRow(3);
        assertEquals("4", data.get(0));
        assertEquals("1/21/2022", data.get(1));
        assertEquals("Social Time", data.get(2));
        assertEquals("Tianren", data.get(3));
        assertEquals("Remember to see friends", data.get(4));
    }

    // ----------------------------- MOVIES TESTS -----------------------------
    @Test
    public final void moviesConnectTest() {
        // movies database
        chooseDatabase(2);

        WebElement cc = driver.findElement(By.id("connection-confirmation"));
        String connected = cc.getText();

        assertEquals("movies.sqlite3 database connected!", connected);
    }

    @Test
    public final void moviesLoadActorTest() {
        // movies database
        chooseDatabase(2);
        chooseTable(0);

        List<Integer> dims = getTableDimensions();
        assertEquals(Integer.valueOf(34), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        List<String> data = getDataRow(2);
        assertEquals("/m/016z2j", data.get(0));
        assertEquals("Robert Downey Jr.", data.get(1));
    }

    @Test
    public final void moviesLoadActorFilmTest() {
        // movies database
        chooseDatabase(2);
        chooseTable(1);

        List<Integer> dims = getTableDimensions();
        assertEquals(Integer.valueOf(30), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        List<String> data = getDataRow(1);
        assertEquals("/m/0154qm", data.get(0));
        assertEquals("/m/02q3fdr", data.get(1));
    }

    @Test
    public final void moviesLoadFilmTest() {
        // movies database
        chooseDatabase(2);
        chooseTable(2);

        List<Integer> dims = getTableDimensions();
        assertEquals(Integer.valueOf(152), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        List<String> data = getDataRow(8);
        assertEquals("/m/02q3fdr", data.get(0));
        assertEquals("Ponyo", data.get(1));
    }

    @Test
    public final void moviesLoadNameLookupTest() {
        // movies database
        chooseDatabase(2);
        chooseTable(3);

        List<Integer> dims = getTableDimensions();
        assertEquals(Integer.valueOf(30), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        List<String> data = getDataRow(1);
        assertEquals("Cate Blanchett", data.get(0));
        assertEquals("Ponyo", data.get(1));
    }

    // -------------------------- MISCELLANEOUS TESTS -------------------------
    @Test
    public final void reconnectTest() {
        // load Horoscopes database
        chooseDatabase(0);
        chooseTable(0);

        List<Integer> dims = getTableDimensions();
        assertEquals(Integer.valueOf(13), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        List<String> data = getDataRow(0);
        assertEquals("1", data.get(0));
        assertEquals("Aries", data.get(1));

        // verify no table exists
        driver.findElement(By.id("clear-table")).click();
        assertEquals(0, driver.findElements(By.tagName("table")).size());

        // load new data from movies database
        chooseDatabase(2);
        chooseTable(3);

        dims = getTableDimensions();
        assertEquals(Integer.valueOf(30), dims.get(0));
        assertEquals(Integer.valueOf(2), dims.get(1));

        data = getDataRow(1);
        assertEquals("Cate Blanchett", data.get(0));
        assertEquals("Ponyo", data.get(1));
    }

    @Test
    public final void insertFormTest() {
        chooseDatabase(1);
        chooseTable(0);

        List<String> innerTexts = getModDivInfo(1);

        assertEquals("value for id", innerTexts.get(0));
        assertEquals("value for date", innerTexts.get(1));
        assertEquals("value for title", innerTexts.get(2));
        assertEquals("value for user", innerTexts.get(3));
        assertEquals("value for content", innerTexts.get(4));
        assertEquals(5, innerTexts.size());
    }

    @Test
    public final void deleteFormTest() {
        chooseDatabase(2);
        chooseTable(3);

        List<String> innerTexts = getModDivInfo(2);

        assertEquals("row number to remove", innerTexts.get(0));
        assertEquals(1, innerTexts.size());
    }

    @Test
    public final void updateFormTest() {
        chooseDatabase(0);
        chooseTable(1);

        List<String> innerTexts = getModDivInfo(3);

        assertEquals("row number to update", innerTexts.get(0));
        assertEquals("value for ta_id", innerTexts.get(1));
        assertEquals("value for horoscope_id", innerTexts.get(2));
        assertEquals(3, innerTexts.size());
    }
}
