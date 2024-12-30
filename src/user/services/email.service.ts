import { Injectable } from "@nestjs/common";
import { ConfigService } from "../../config/config.service";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly mailerSend: MailerSend;
  constructor(private configService: ConfigService) {
    this.mailerSend = new MailerSend({
      apiKey: configService.get().mailerSendApiKey,
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const config = this.configService.get();
    const verificationUrl = `${config.baseUrl}/user/email/verification/${token}`;

    console.log(`Sending verification email to ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);


    sgMail.setApiKey(config.sendgridApiKey);
    const msg = {
      to: email, // Change to your recipient
      from: config.sendgridFromEmail, // Change to your verified sender
      subject: 'Welcome to users system (SG)',
      text: 'welcome, please verify your email',
      html: `<p>Please validate your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    };
    await sgMail.send(msg);


    const sentFrom = new Sender(config.mailerSendFromEmail, config.mailerSendFromName);
    const recipients = [new Recipient(email)];
    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject('Welcome to users system')
        .setHtml(`<strong>Please validate your email by clicking <a href="${verificationUrl}">here</a>.</strong>`);

    await this.mailerSend.email.send(emailParams)
  }
}
