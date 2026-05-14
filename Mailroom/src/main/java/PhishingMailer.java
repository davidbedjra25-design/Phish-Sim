import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;
import java.io.InputStream;

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

        String targetName = "Alice";
        String targetEmail = "alice@company.com";
        String trackingLink = "http://localhost:3000/clicked?target=" + targetName;

        try {
            // 4. Draft the Phishing Email
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("it-support@company-portal.com"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(targetEmail));
            message.setSubject("URGENT:: Mandatory Password Rotation Required");

            // The body of the email containing your hidden link
            String emailBody = "<h2>Security Alert</h2>"
                    + "<p>Hello " + targetName + ",</p>"
                    + "<p>Your corporate password expires in 2 hours. Please update it immediately to avoid account lockout.</p>"
                    + "<p><a href='" + trackingLink + "' style='padding: 10px; background: red; color: white; text-decoration: none;'>Update Password Now</a>";

            message.setContent(emailBody, "text/html; charset=utf-8");

            // 5. Send the Email
            Transport.send(message);
            System.out.println("Simulated phishing email sent successfully to Mailtrap!");

        }

        catch (MessagingException me) {
            me.printStackTrace();
        }
        
    }
}