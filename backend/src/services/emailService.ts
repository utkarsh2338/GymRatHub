import { Resend } from "resend";

// Initialize Resend optionally
const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "mock_key"
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<boolean> {
  try {
    if (!resend) {
      console.log(`[Email Mock Service] Sending email:
To: ${to}
Subject: ${subject}
HTML: ${html.substring(0, 300)}...`);
      return true;
    }

    const { data, error } = await resend.emails.send({
      from: "GymRatHub <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error sending email:", error);
      return false;
    }

    console.log("Email sent successfully via Resend:", data?.id);
    return true;
  } catch (error) {
    console.error("Exception in sendEmail service:", error);
    return false;
  }
}
