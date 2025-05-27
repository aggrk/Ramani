import nodemailer from "nodemailer";

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Kennedy <${process.env.EMAIL_FROM}>`;
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    let html;
    if (template === "welcome") {
      html = `<div style="font-family: Arial, sans-serif; background-color: #fdfaf6; padding: 30px;">
  <div style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; margin: auto; border: 1px solid #d2b48c;">
    <h2 style="color: #556b2f;">Welcome to Ramani, ${this.firstName}!</h2>
    <p style="color: #333;">We're excited to have you join us. Please confirm your email address to activate your account:</p>
    <a href="${this.url}" style="display: inline-block; background-color: #556b2f; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; margin-top: 20px;">Activate My Account</a>
    <p style="margin-top: 30px; color: #666;">If you didn’t create an account, please ignore this email.</p>
    <p style="color: #444;">Thanks,<br><strong>The Ramani Team</strong></p>
  </div>
</div>

`;
    }

    if (template === "reset") {
      html = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <div style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; margin: auto;">
    <h2 style="color: #dc3545;">Password Reset Request</h2>
    <p>Hello ${this.firstName},</p>
    <p>You recently requested to reset your password. Click the button below to proceed:</p>
    <a href="${this.url}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; margin-top: 20px;">Reset Password</a>
    <p style="margin-top: 30px;">This link will expire in 10 minutes. If you did not request this, you can safely ignore it.</p>
    <p>Best,<br><strong>Ramani Support</strong></p>
  </div>
</div>
`;
    }

    if (template === "approved") {
      html = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <div style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; margin: auto;">
    <h2 style="color: #28a745;">Congratulations, ${this.firstName}!</h2>
    <p>We’re pleased to inform you that your application for the site ${this.url.siteTitle} has been approved. Please visit the site for work.</p>
    <p style="margin-top: 30px;">If you have any questions, feel free to reply to this email.</p>
    <p>Warm regards,<br><strong>Ramani Team</strong></p>
  </div>
</div>
`;
    }

    if (template === "hardware") {
      html = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <div style="max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px; margin: auto;">
    <h2 style="color: #28a745;">Congratulations, ${this.firstName}!</h2>
    <p>We’re pleased to inform you that your application for the hardware ${this.url.name} has been approved. Please login to you account to add some products.</p>
    <p style="margin-top: 30px;">If you have any questions, feel free to reply to this email.</p>
    <p>Warm regards,<br><strong>Ramani Team</strong></p>
  </div>
</div>
`;
    }

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    // 3) Create a transporter and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendWelcome() {
    // Send welcome email
    await this.send("welcome", "Welcome to Ramani!");
  }
  async sendReset() {
    await this.send(
      "reset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
  async sendApproved() {
    await this.send("approved", "Your application has been approved");
  }

  async sendHardwareApproved() {
    await this.send("hardware", "You hardware registration has been approved");
  }
}
