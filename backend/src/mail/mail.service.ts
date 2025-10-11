import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, MAIL_USER } from 'src/config/constants';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>(MAIL_HOST) || 'smtp.gmail.com',
      port: Number(this.configService.get<string>(MAIL_PORT)) || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>(MAIL_USER),
        pass: this.configService.get<string>(MAIL_PASSWORD),
      },
    });
  }

  async sendTemplateMail(to: string, subject: string, templateName: string, context: any) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(source);
    const html = compiledTemplate(context);
   
    await this.transporter.sendMail({
      from: `"Voluntariado" <${this.configService.get<string>('MAIL_USER')}>`,
      to,
      subject,
      html,
    });
  }

}
