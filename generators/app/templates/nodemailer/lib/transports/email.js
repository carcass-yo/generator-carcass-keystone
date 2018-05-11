const keystone = require('keystone');
const BaseTransport = require('./base');

const { NODEMAILER_SMTP_HOST, NODEMAILER_SMTP_PORT, NODEMAILER_SENDER_EMAIL } = process.env;

class EmailTransport extends BaseTransport {
  async send() {
    const email = new keystone.Email({
      transport: 'nodemailer',
      templateName: this.message.template,
      nodemailerConfig: {
        host: NODEMAILER_SMTP_HOST,
        port: NODEMAILER_SMTP_PORT,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      },
    });

    return new Promise(async (resolve, reject) => {
      email.send(
        {
          message: this.message,
        },
        {
          to: (await this.getRecipients()).map(u => `${u.name.full} <${u.email}>`),
          from: this.message.from || NODEMAILER_SENDER_EMAIL,
          subject: this.message.subject,
        },
        (err, info) => (err ? reject(err) : resolve(info)),
      );
    });
  }
}

module.exports = EmailTransport;
