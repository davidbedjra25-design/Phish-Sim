import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;

public class PhishingMailer {
    public static void main(String[] args) {

        String targetEmail = "alice@company.com";
        String targetName = "Alice";

        String trackingLink = "https://localhost:3000/auth/password-reset?session=" + targetName;

        Properties props = new Properties();
        props.put("mail.sntp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "sandbox.smtp.mailtrap.io");
        props.put("mail.smtp.port", "2525");

        // REPLACE THESE with your actual Mailtrap credentials
        final String username = "YOUR_MAILTRAP_USERNAME";
        final String password = "YOUR_MAILTRAP_PASSWORD";

        // 3. Authenticate with the Server
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

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
                    + "<p><a href='" + trackingLink + "' style='padding: 10px; background: red, color: white; text-decoration: none;'>Update Password Now</a>";

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