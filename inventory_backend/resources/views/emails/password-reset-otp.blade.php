<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .otp-box {
            background-color: #f0f9ff;
            border: 2px dashed #4F46E5;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #4F46E5;
            margin: 20px 0;
            border-radius: 8px;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            @if($userName)
                <p>Hello {{ $userName }},</p>
            @else
                <p>Hello,</p>
            @endif
            
            <p>You have requested to reset your password for the Inventory Management System.</p>
            <p>Use the following One-Time Password (OTP) to reset your password:</p>
            
            <div class="otp-box">
                {{ $otp }}
            </div>
            
            <div class="warning">
                <strong>Important:</strong>
                <ul>
                    <li>This OTP is valid for {{ $expiryMinutes }} minutes only</li>
                    <li>Do not share this OTP with anyone</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                </ul>
            </div>
            
            <p>Enter this OTP in the password reset page to proceed with resetting your password.</p>
            
            <p>Best regards,<br>
            Inventory Management System Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} Inventory Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>