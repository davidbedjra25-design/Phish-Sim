import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class PhishingMailer {
    public static void main(String[] args) {
        // 1. Load the configuration file
        Properties config = new Properties();
        try(InputStream input = PhishingMailer.class.getClassLoader().getResourceAsStream("config.properties")) {
            if(input == null) {
                System.out.println("Error: Unable to find config.properties in the resources folder.");
                return;
            }
            config.load(input);
        }
        catch(Exception e) {
            System.out.println("Error reading configuration file: " + e.getMessage());
            return;
        }

        // 2. Set up the Jakarta Mail properties using our secure config
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", config.getProperty("smtp.host"));
        props.put("mail.smtp.port", config.getProperty("smtp.port"));

        // 3. Authenticate with the Server
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(
                    config.getProperty("smtp.username"), 
                    config.getProperty("smtp.password")
                );
            }
        });

        // String targetName = "Alice";
        // String targetEmail = "alice@company.com";
        // String trackingLink = "http://localhost:3000/clicked?target=" + targetName;

        try {
            //Preload the HTM: template once so we don't read the file over and over
            String template = "";
            try(InputStream templateStream = PhishingMailer.class.getClassLoader().getResourceAsStream("template.html")) {
                if(templateStream != null) {
                    template = new String(templateStream.readAllBytes(), StandardCharsets.UTF_8);
                }
            }
            catch(Exception e) {
                System.out.println("Error reading html template: " + e.getMessage());
                return;
            }

            //Opening the CSV Database
            InputStream targetStream = PhishingMailer.class.getClassLoader().getResourceAsStream("targets.csv");
            if(targetStream == null) {
                System.out.println("Error: Could not find targets.csv");
                return;
            }

            BufferedReader reader = new BufferedReader(new InputStreamReader(targetStream, StandardCharsets.UTF_8));
            int totalEmailsSent = 0; //Setting up the number of emails sent

            String line;

            // Loop through the CSV file line by line
            while((line = reader.readLine()) != null) {
                // Splitting the comma-separated line
                String[] parts = line.split(",");
                if(parts.length < 2) {
                    continue;   //Skipping any blank or broken lines
                }

                PhishingTarget target = new PhishingTarget(parts[0].trim(), parts[1].trim());

                String trackingLink = "http://localhost:3000/clicked?target=" + target.name();

                // 4. Draft the Phishing Email
                Message message = new MimeMessage(session);
                message.setFrom(new InternetAddress("it-support@company-portal.com"));
                message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(target.email()));
                message.setSubject("URGENT:: Mandatory Password Reset Required");

                // Inject the target's specific data into the HTML
                String emailBody = template.replace("{{TARGET_NAME}}", target.name());
                emailBody = emailBody.replace("{{TRACKING_LINK}}", trackingLink);

                 message.setContent(emailBody, "text/html; charset=utf-8");

                // 5. Send the Email
                Transport.send(message);
                System.out.println("Simulated phishing email sent successfully to Mailtrap!");

                totalEmailsSent++; //incrementing the count for the number of emails sent

                Thread.sleep(10000); // Adding a short delay between emails to avoid getting flagged by the server for spamming
            }
            broadcastCampaignStart(totalEmailsSent);
           System.out.println("All the targets have been successfully processed!");
           reader.close();
        }

        catch (Exception me) {
            System.out.println("An error occurred while going through the loop:");
            me.printStackTrace();
        }
        
    }

    private static void broadcastCampaignStart(int totalSent) {
        try {
            //Telling the Node.js server exactly how many emails were being sent
            URL url = new URL("http://localhost:3000/api/campaign-start?total=" + totalSent);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            // sending the request
            int responseCode = connection.getResponseCode();
            
            if(responseCode == 200) {
                System.out.println("[SUCCESS] Node.js dashboard notified. Total targets: " + totalSent);
            }
            else {
                System.out.println("[WARNING] Dashboard didn't respond correctly. Is Node.js running?");
            }
        }
        catch(Exception e) {
            System.out.println("[ERROR] Could not connect to Node.js dashboard: " + e.getMessage());
        }
    }

}