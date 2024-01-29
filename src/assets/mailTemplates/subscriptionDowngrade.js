const SubscriptionDowngrade = (name, planname, amount, interval) => {
    return `<!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
        <!-- Define Charset -->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
        <title>Restoap - Mailer</title>
        <style type="text/css">
            body {
                width: 100%;
                background-color: #f1f1f2;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                font-family: Calibri;
            }
    
            html {
                width: 100%;
            }
    
            table {
                font-size: 15px;
                border: 0;
            }
    
            .btn {
                padding: 10px 15px;
                background-color: #fbbf0d;
                color: #fff;
                text-align: center;
                text-decoration: none;
                line-height: 40px;
                font-size: 18px;
                border-radius: 10px;
                text-transform: uppercase;
            }
        </style>
    </head>
    
    <body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
        <table border="0" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td height="30"></td>
            </tr>
            <tr>
                <td width="100%" align="center" valign="top">
                    <table border="0" width="600" cellpadding="0" cellspacing="0" align="center" class="container"
                        bgcolor="#F5F5F5">
                        <tr>
                            <td height="15"></td>
                        </tr>
                        <tr>
                            <td>
                                <a href="#" style="display: block;">
                                    <img editable="true" mc:edit="logo" width="155"
                                        src="https://restoap-assets.s3.amazonaws.com/logo+(3).png" alt="logo" /></a>
                            </td>
                        </tr>
                        <tr>
                            <td height="15"></td>
                        </tr>
                    </table>
    
                    <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="container">
                        <tr>
                            <td>
                                <table border="0" width="600" align="center" cellpadding="0" cellspacing="0">
    
                                    <tr bgcolor="ffffff">
                                        <td align="center"><img style="display: block;" class="main-image" width="600"
                                                height="auto"
                                                src="https://restoap-assets.s3.amazonaws.com/subscription-downgrade.png" />
                                        </td>
                                    </tr>
                                    <tr bgcolor="ffffff">
                                        <td height="20"></td>
                                    </tr>
    
                                    <tr bgcolor="ffffff">
                                        <td>
                                            <table width="528" border="0" align="center" cellpadding="0" cellspacing="0"
                                                class="mainContent">
                                                <tr>
                                                    <td mc:edit="title1" class="main-header"
                                                        style="color: #484848; font-size: 16px; font-weight: normal;">
                                                    </td>
                                                </tr>
                                                <tr bgcolor="ffffff">
                                                    <td height="20"></td>
                                                </tr>
    
                                                <tr bgcolor="ffffff">
                                                    <td>
                                                        <table width="528" border="0" align="center" cellpadding="0"
                                                            cellspacing="0" class="mainContent">
                                                            <tr>
                                                                <td mc:edit="title1" class="main-header"
                                                                    style="color: #484848; font-size: 16px; font-weight: normal;">
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td height="20"></td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <h1 style="color: #212B36;text-align: left;">Your
                                                                        subscription has <span
                                                                            style="color:#BB3138; ">Downgrade</span> </h1>
                                                                    <p
                                                                        style="color:#212B36; line-height: 24px; font-size:18px ;">
                                                                        Dear ${name}
                                                                    </p>
    
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
    
                                                                    <p
                                                                        style="color:#637381 ; line-height:18px; font-size:16px ;">
                                                                        I hope this message finds you well. We appreciate
                                                                        your continued use of Restoap and
                                                                        your recent subscription update.
    
                                                                        We wanted to confirm that your subscription plan has
                                                                        been successfully downgraded to the ${planname}
                                                                        Plan, as
                                                                        per your request. This change is effective
                                                                        immediately.
                                                                    </p>
    
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <p
                                                                        style="color:#BB3138 ; line-height:24px; font-size:18px ;">
                                                                        Subscription summary
                                                                    </p>
                                                                    <p>${planname} account on Restoap INR
                                                                        Rs.${amount} per ${interval}</p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
    
                                                                    <p
                                                                        style="color:#212b36 ; line-height:24px; font-size:18px ;">
                                                                        Regards,
                                                                    </p>
                                                                    <p>RESTOAP Team</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr bgcolor="ffffff">
                                        <td align="center"><img style="display: block;" class="main-image" width="600"
                                                height="auto" src='https://restoap-assets.s3.amazonaws.com/bottomBg.png' />
                                        </td>
                                    </tr>
    
    
                                </table>
                            </td>
                        </tr>
                        <tr style="background-color:#bb3138 ; color: #fff;">
                            <td height="50" align="center">
                                Copyright 2023. All Rights Reserved By Restoap.
                            </td>
                        </tr>
                        <tr>
                            <td height="35"></td>
                        </tr>
                    </table>
    </body>
    
    </html>`;
};

module.exports = SubscriptionDowngrade;
