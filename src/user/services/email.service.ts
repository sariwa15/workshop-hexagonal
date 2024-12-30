import { Injectable } from "@nestjs/common";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import sgMail from '@sendgrid/mail';
import { ConfigService } from "@nestjs/config";
import { Config } from "src/config/config.interface";

@Injectable()
export class EmailService {
  private readonly mailerSend: MailerSend;
  constructor(private configService: ConfigService<Config, true>) {
    this.mailerSend = new MailerSend({
      apiKey: configService.get('mailerSendApiKey'),
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('baseUrl')}/user/email/verification/${token}`;

    console.log(`Sending verification email to ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);


    sgMail.setApiKey(this.configService.get('sendgridApiKey'));
    const msg = {
      to: email, // Change to your recipient
      from: this.configService.get('sendgridFromEmail'), // Change to your verified sender
      subject: 'Welcome to users system (SG)',
      text: 'welcome, please verify your email',
      html: `<p>Please validate your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    };
    await sgMail.send(msg);


    const sentFrom = new Sender(this.configService.get('mailerSendFromEmail'), this.configService.get('mailerSendFromName'));
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
