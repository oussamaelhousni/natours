const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const htmlToText = require('html-to-text');
/* exports.sendEmail = async (options) => {
    // 1 - create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2 - Define The email option
    const mailOptions = {
        from: 'oussama elhousni <oussama@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html
    };

    // 3 - send the mail
    await transporter.sendMail(mailOptions);
}; */

module.exports = class Email {
    constructor(user, url) {
        this.firstName = user.name.split(' ')[0];
        this.to = user.email;
        this.url = url;
        this.from = `Oussama Elh<${process.env.EMAIL_FROM}>`;
    }

    createTransport() {
        if (process.env.NODE_ENV === 'production') {
            // for production
            return 1;
        } else {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
        }
    }

    async send(template, subject) {
        // 1) render html based on a pug template
        const html = pug.renderFile(
            path.join(__dirname, '..', 'views', 'email', `${template}.pug`),
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        );
        console.log('after render html');

        // 2) define the mailOptions
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html),
        };

        // 3) create the transporter and send the email

        await this.createTransport().sendMail(mailOptions);
    }

    sendWelcome() {
        this.send('welcome', 'Welcome to the natours family !');
    }

    sendResetPassword() {
        this.send(
            'passwordReset',
            'Your password reset token (only valide for 10min)'
        );
    }
};
