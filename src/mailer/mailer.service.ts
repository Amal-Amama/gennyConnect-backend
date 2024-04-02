import * as nodemailer from 'nodemailer';

export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
      },
    });
    this.transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log('ready for message');
      }
    });
  }

  async sendingSignupConfirmation(userEmail: string, confirmationLink: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.USER,
        to: userEmail,
        subject: 'inscription',
        html: `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center; 
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo {
            max-width: 100px;
            height: auto;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #FF6600; 
            color: #fff; 
            text-decoration: none;
            border-radius: 5px;
            margin: 0 auto; /* Centrer le bouton horizontalement */
        }
        .footer {
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="./touch.png" alt="GennyConnect" style="max-width: 10px">
            <h1>Email Confirmation</h1>
        </div>
        <p>Hello,</p>
        <p>You're about to join the GennyConnect community. Please click the button below to verify your email address <strong> before the ending of 6hours from now </strong>and start enjoying our services:</p>
        <a href="${confirmationLink}" class="button">Verify Email</a>
        <div class="footer">
            <p>Thank you,</p>
            <p>The GennyConnect Team</p>
        </div>
    </div>
</body>
</html>
            `,
      });
      console.log('E-mail envoyé avec succès !');
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
    }
  }
  async sendResetPassword(userEmail: string, url: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.USER,
        to: userEmail,
        subject: 'reset password',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #FF6600;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset</h2>
        <p>Click the following link to reset your password:</p>
        <p><a href="${url}" class="btn">Reset Password</a></p>
        <p>Secret code: <strong>${code}</strong></p>
        <p><strong>This code will expire in 15 minutes.</strong></p>
        <div class="footer">
            <p>Thank you,</p>
            <p>GennyConnect Team</p>
        </div>
    </div>
</body>
</html>
`,
      });
      console.log('E-mail envoyé avec succès !');
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
    }
  }
  async sendMailNotifForTech(
    userEmail: string,
    firstName: string,
    userRole: string[],
  ) {
    try {
      await this.transporter.sendMail({
        from: process.env.USER,
        to: userEmail,
        subject: 'New work added',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #FF6600;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
    <h2>New Work Added</h2>
    <p>Congratulations ${firstName}🎉,you have a new maintenance opportunity added to your jobBoard in gennyConnect plateform</p></br> 
    <p><strong>check it !</strong>, don't rate this opportunity to elevate your score and bieng most recommended ${userRole}!!</p><br/> 
    <p><a href="" class="btn">Login</a></p><br/>
     <div class="footer">
            <p>Thank you,</p>
            <p>GennyConnect Team</p>
        </div>
    </div>
</body>
</html>`,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
    }
  }
  async sendMailNotifForClient(userEmail: string, firstName: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.USER,
        to: userEmail,
        subject: 'New work added',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #FF6600;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
    <h2>New Work Added</h2>
    <p>Congratulations ${firstName}🎉,a new technician accepted to work with you</p></br> 
    <strong>check your account for more details !</strong><br/> 
    <p><a href="" class="btn">Login</a></p><br/>
     <div class="footer">
            <p>Thank you,</p>
            <p>GennyConnect Team</p>
        </div>
    </div>
</body>
</html>`,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
    }
  }
}
