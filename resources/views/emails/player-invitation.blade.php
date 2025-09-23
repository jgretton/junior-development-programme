<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invitation to Register</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', 'Helvetica Neue', sans-serif; color: #111827;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f9fafb; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);">
                    <!-- Heading -->
                    <tr>
                        <td style="text-align: left; padding-bottom: 24px;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">You're Invited to Register</h1>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="font-size: 16px; line-height: 1.6; color: #374151; padding-bottom: 24px;">
                            <p style="margin: 0;">Hi {{ $name }},</p>
                            <p style="margin: 16px 0 0 0;">
                                You've been invited to join our platform. Please click the button below to complete your registration.
                            </p>
                        </td>
                    </tr>

                    <!-- Call to Action -->
                    <tr>
                        <td align="center" style="padding: 32px 0;">
                            <a href="{{ $registration_url }}"
                               style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                Register Now
                            </a>
                        </td>
                    </tr>

                    <!-- Info text -->
                    <tr>
                        <td style="font-size: 14px; color: #6b7280; line-height: 1.5; padding-top: 16px;">
                            <p style="margin: 0;">
                                If you didn’t expect this invitation, you can safely ignore this email.
                            </p>
                            <p style="margin-top: 24px;">
                                Best regards,<br>
                                The {{ config('app.name') }} Team
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <p style="margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
