import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class LeaderboardEngine {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Error: Missing database path argument.");
            System.exit(1);
        }

        String dbPath = args[0];
        String jdbcUrl = "jdbc:sqlite:" + dbPath;

        try {
            // Ensure driver is loaded statically
            Class.forName("org.sqlite.JDBC");
            
            Connection connection = DriverManager.getConnection(jdbcUrl);
            Statement statement = connection.createStatement();
            
            String query = "SELECT username, xp FROM users ORDER BY xp DESC LIMIT 10";
            ResultSet rs = statement.executeQuery(query);
            
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{\"leaderboard\": [");
            
            boolean first = true;
            while (rs.next()) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;
                
                String username = rs.getString("username");
                // Escape simple JSON chars properly to avoid breaks
                if (username != null) {
                    username = username.replace("\"", "\\\"").replace("\\", "\\\\");
                }
                int xp = rs.getInt("xp");
                
                jsonBuilder.append("{")
                           .append("\"username\":\"").append(username).append("\",")
                           .append("\"xp\":").append(xp)
                           .append("}");
            }
            
            jsonBuilder.append("]}");
            System.out.println(jsonBuilder.toString());
            
            rs.close();
            statement.close();
            connection.close();
            
        } catch (Exception e) {
            System.err.println("{\"error\": \"Java Exception Occurred: " + e.getMessage() + "\"}");
            System.exit(1);
        }
    }
}
