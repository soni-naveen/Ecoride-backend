exports.deleteRideMail = (driverName) => {
    return `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Ride deleted</title>
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
                    }
                    p {
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
                    .btn-cont {
                        text-align: center;
                    }
                    button {
                        font-size: 17px;
                        border: none;
                        background-color: #07b2a4;
                        padding: 10px 15px;
                        border-radius: 3px;
                        color: white;
                        font-weight: 600;
                    }
                </style>
            </head>
            
            <body>
                <div class="container">
                    <div class="message">Unfortunately ${driverName} can't take you anymore.</div>
                    <div class="body">
                        <p>Dear Passenger,</p>
                        <p>We regret to inform you that ${driverName} deleted the ride you booked. We apologize for any inconvenience this may cause.</p>
                        <p>Thank you for your understanding.</p>
                        <br>
                        <div class="btn-cont">
                            <a href="https://theecoride.in/searchride">
                                <button>Find a new ride</button>
                            </a>
                        </div>
                    </div>
                    <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
                        at
                        <a href="mailto:ecoride.in@gmail.com">ecoride.in@gmail.com</a>. We are here to help you!
                    </div>
                </div>
            </body>
          </html>`;
  };
  