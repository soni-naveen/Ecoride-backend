exports.resetPasswordMail = (token) => {
  return `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Reset your password</title>
          <style>
              body {
                  background-color: #ffffff;
                  font-family: Arial, sans-serif;
                  font-size: 16px;
                  line-height: 1.4;
                  color: #333333;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  text-align: start;
              }
              .logo {
                  max-width: 200px;
                  margin-bottom: 20px;
              }
              .message {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 20px;
              }
              .body {
                  font-size: 16px;
                  margin-bottom: 20px;
              }
              .support {
                  font-size: 14px;
                  color: #999999;
                  margin-top: 20px;
              }
              .highlight {
                  font-weight: bold;
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <div class="message">Reset your password</div>
              <div class="body">
                  <p>We received a request to reset the password for your account.</p>
                  <p>If you did not make this request, please ignore this email.</p>
                  <br>
                  <p> To reset your password, please click the link below:</p>
                  <p> https://theecoride.in/update-password/${token}</p>
                  <p>For security purposes, this link will expire in 5 minutes.</p>
              </div>
              <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
                  at
                  <a href="mailto:ecoride.in@gmail.com">ecoride.in@gmail.com</a>. We are here to help you!
              </div>
          </div>
      </body>
      </html>`;
};
