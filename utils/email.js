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
      html = `<div style="font-family: 'Arial', sans-serif; background-color: #F8F8F8; padding: 20px 10px; min-width: 100%;">
  <!-- Main Container -->
  <div style="max-width: 100%; width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin: 0 auto;">
    <!-- Header Banner (Mobile-optimized padding) -->
    <div style="background-color: #B22222; padding: 16px 10px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 600; line-height: 1.3;">RAMANI</h1>
    </div>
    
    <!-- Content Area (Stacked for mobile) -->
    <div style="padding: 20px;">
      <h2 style="color: #1A1A1A; font-size: 18px; margin-top: 0; margin-bottom: 16px; line-height: 1.4;">
        Welcome to Ramani, ${this.firstName}!
      </h2>
      
      <p style="color: #333333; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
        We're excited to have you join Tanzania's construction network. Confirm your email to activate your account:
      </p>
      
      <!-- CTA Button (Full-width on mobile) -->
      <div style="text-align: center; margin: 25px 0;">
        <a href="${
          this.url
        }" style="display: inline-block; width: 100%; max-width: 240px; background-color: #B22222; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(178, 34, 34, 0.2);">
          Activate My Account
        </a>
      </div>
      
      <!-- Secondary Text (Adjusted spacing) -->
      <p style="color: #666666; font-size: 13px; line-height: 1.5; margin-bottom: 25px;">
        Didn’t create an account? Ignore this email or contact <a href="mailto:support@ramani.co.tz" style="color: #556B2F; text-decoration: underline;">support@ramani.co.tz</a>.
      </p>
      
      <!-- Footer (Tighter padding) -->
      <div style="border-top: 1px solid #D2B48C; padding-top: 16px;">
        <p style="color: #444444; font-size: 13px; margin: 4px 0;">
          Thanks for building with us,
        </p>
        <p style="color: #1A1A1A; font-size: 15px; font-weight: 600; margin: 4px 0 8px;">
          The Ramani Team
        </p>
        <p style="color: #556B2F; font-size: 11px; margin-top: 16px;">
          © ${new Date().getFullYear()} Ramani. All rights reserved.
        </p>
      </div>
    </div>
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
