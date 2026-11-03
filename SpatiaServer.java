import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/** Small Java/JDBC server for the existing SPATIA HTML interface. */
public class SpatiaServer {
    // Change YOUR_PASSWORD to your local MySQL root password.
    private static final String DB_URL = "jdbc:mysql://localhost:3306/spatia?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "YOUR_PASSWORD";
    private static final int PORT = 8080;
    private static final Path HTML_FILE = Path.of("final spatia.html");

    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection c = connect(); Statement st = c.createStatement()) {
            st.executeUpdate("CREATE TABLE IF NOT EXISTS app_data (" +
                "data_key VARCHAR(100) PRIMARY KEY, data_value LONGTEXT NOT NULL, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)");
        }
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/data/", SpatiaServer::handleData);
        server.createContext("/", SpatiaServer::servePage);
        server.setExecutor(null);
        server.start();
        System.out.println("SPATIA is running at http://localhost:" + PORT);
        System.out.println("Keep this terminal open while demonstrating the project.");
    }

    private static Connection connect() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    private static void handleData(HttpExchange ex) throws IOException {
        String key = URLDecoder.decode(ex.getRequestURI().getRawPath().substring("/api/data/".length()), StandardCharsets.UTF_8);
        if (key.isBlank() || key.length() > 100) { send(ex, 400, "Invalid data key", "text/plain; charset=utf-8"); return; }
        try (Connection c = connect()) {
            switch (ex.getRequestMethod()) {
                case "GET": {
                    try (PreparedStatement ps = c.prepareStatement("SELECT data_value FROM app_data WHERE data_key=?")) {
                        ps.setString(1, key);
                        try (ResultSet rs = ps.executeQuery()) {
                            if (rs.next()) send(ex, 200, rs.getString(1), "application/json; charset=utf-8");
                            else send(ex, 200, "null", "application/json; charset=utf-8");
                        }
                    }
                    break;
                }
                case "PUT": {
                    byte[] bytes = readAll(ex.getRequestBody());
                    if (bytes.length > 8_000_000) { send(ex, 413, "Data too large", "text/plain; charset=utf-8"); return; }
                    String json = new String(bytes, StandardCharsets.UTF_8);
                    try (PreparedStatement ps = c.prepareStatement(
                        "INSERT INTO app_data(data_key,data_value) VALUES(?,?) ON DUPLICATE KEY UPDATE data_value=VALUES(data_value)")) {
                        ps.setString(1, key); ps.setString(2, json); ps.executeUpdate();
                    }
                    send(ex, 200, "{\"saved\":true}", "application/json; charset=utf-8");
                    break;
                }
                case "DELETE": {
                    try (PreparedStatement ps = c.prepareStatement("DELETE FROM app_data WHERE data_key=?")) {
                        ps.setString(1, key); ps.executeUpdate();
                    }
                    send(ex, 200, "{\"deleted\":true}", "application/json; charset=utf-8");
                    break;
                }
                default:
                    ex.getResponseHeaders().set("Allow", "GET, PUT, DELETE");
                    send(ex, 405, "Method not allowed", "text/plain; charset=utf-8");
            }
        } catch (Exception e) {
            e.printStackTrace();
            send(ex, 500, "Database error: " + e.getMessage(), "text/plain; charset=utf-8");
        }
    }

    private static byte[] readAll(InputStream in) throws IOException { return in.readAllBytes(); }

    private static void servePage(HttpExchange ex) throws IOException {
        if (!"GET".equals(ex.getRequestMethod())) { send(ex, 405, "Method not allowed", "text/plain; charset=utf-8"); return; }
        if (ex.getRequestURI().getPath().startsWith("/api/")) { send(ex, 404, "Not found", "text/plain; charset=utf-8"); return; }
        try {
            byte[] html = Files.readAllBytes(HTML_FILE);
            sendBytes(ex, 200, html, "text/html; charset=utf-8");
        } catch (IOException e) {
            send(ex, 500, "Could not read 'final spatia.html'. Keep it in the same folder as SpatiaServer.java.", "text/plain; charset=utf-8");
        }
    }

    private static void send(HttpExchange ex, int status, String body, String type) throws IOException {
        sendBytes(ex, status, body.getBytes(StandardCharsets.UTF_8), type);
    }

    private static void sendBytes(HttpExchange ex, int status, byte[] body, String type) throws IOException {
        ex.getResponseHeaders().set("Content-Type", type);
        ex.getResponseHeaders().set("Cache-Control", "no-store");
        ex.sendResponseHeaders(status, body.length);
        try (OutputStream out = ex.getResponseBody()) { out.write(body); }
    }
}
