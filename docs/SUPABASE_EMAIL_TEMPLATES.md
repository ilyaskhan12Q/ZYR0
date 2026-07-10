# Zyro Supabase Auth Email Templates

This document provides beautifully styled, responsive HTML email templates configured specifically for the **Zyro Platform**. These templates can be copied and pasted directly into the Supabase Dashboard under **Project Settings -> Authentication -> Email Templates**.

---

## 🎨 Design System for Zyro Emails
*   **Primary Accent**: `#2563eb` (Royal Blue)
*   **Background**: `#f8fafc` (Light Slate)
*   **Card Background**: `#ffffff` (White)
*   **Primary Text**: `#0f172a` (Slate-900)
*   **Secondary Text**: `#475569` (Slate-600)
*   **Muted Footer Text**: `#94a3b8` (Slate-400)
*   **Fonts**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`

---

## 1. Confirm Signup (Confirmation Email)

### Configuration Path
> **Supabase Dashboard** -> **Authentication** -> **Email Templates** -> **Confirm Signup**

### Template Body (HTML)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Zyro Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">ZYRO</h1>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Accelerating Professional Growth</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 32px; text-align: left;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Welcome to Zyro!</h2>
              <p style="color: #475569; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">Thank you for signing up. Please confirm your email address to activate your account and access your personalized student, mentor, or company dashboard.</p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s ease;">Confirm Email Address</a>
                  </td>
                </tr>
              </table>

              <!-- Warning / Note -->
              <p style="color: #64748b; margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; border-left: 3px solid #e2e8f0; padding-left: 12px;">This confirmation link will expire in 24 hours. If you did not sign up for a Zyro account, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;"><div style="border-top: 1px solid #f1f5f9; height: 1px; width: 100%;"></div></td>
          </tr>

          <!-- Fallback Link -->
          <tr>
            <td style="padding: 24px 32px; text-align: left;">
              <p style="color: #94a3b8; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Trouble clicking the button?</p>
              <p style="color: #475569; margin: 0; font-size: 12px; word-break: break-all; line-height: 1.5;"><a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: underline;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafcff; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 12px;">© 2026 Zyro. All rights reserved.</p>
              <p style="color: #b4c2d4; margin: 0; font-size: 11px;">You are receiving this because you initiated registration on Zyro.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Confirm Signup (OTP Code / Token Email)

If your app prompts students/users to input a 6-digit confirmation code instead of clicking a direct confirmation link, use the template below.

### Configuration Path
> **Supabase Dashboard** -> **Authentication** -> **Email Templates** -> **Confirm Signup**

### Template Body (HTML)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Zyro Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">ZYRO</h1>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Verification Code</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Confirm Your Registration</h2>
              <p style="color: #475569; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; text-align: left;">Thank you for signing up for Zyro. Please use the verification code below in the registration portal to complete your activation.</p>
              
              <!-- OTP Display Box -->
              <div style="display: inline-block; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 48px; letter-spacing: 0.15em; font-size: 32px; font-weight: 800; color: #1e3a8a; font-family: Courier, monospace;">
                {{ .Token }}
              </div>

              <!-- Warning / Note -->
              <p style="color: #64748b; margin: 32px 0 0 0; font-size: 13px; line-height: 1.5; border-left: 3px solid #e2e8f0; padding-left: 12px; text-align: left;">This verification code is valid for 24 hours. If you did not sign up for a Zyro account, please ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafcff; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 12px;">© 2026 Zyro. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Reset Password Email

### Configuration Path
> **Supabase Dashboard** -> **Authentication** -> **Email Templates** -> **Reset Password**

### Template Subject
```text
Reset Your Zyro Account Password
```

### Template Body (HTML)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">ZYRO</h1>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Password Recovery</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 32px; text-align: left;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Reset Your Password</h2>
              <p style="color: #475569; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">We received a request to reset the password for your Zyro account. Click the button below to establish a new password.</p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s ease;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <!-- Warning / Note -->
              <p style="color: #64748b; margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; border-left: 3px solid #f59e0b; padding-left: 12px;">If you did not request a password reset, you can ignore this email. Your current password will remain secure and unchanged.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;"><div style="border-top: 1px solid #f1f5f9; height: 1px; width: 100%;"></div></td>
          </tr>

          <!-- Fallback Link -->
          <tr>
            <td style="padding: 24px 32px; text-align: left;">
              <p style="color: #94a3b8; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Trouble clicking the button?</p>
              <p style="color: #475569; margin: 0; font-size: 12px; word-break: break-all; line-height: 1.5;"><a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: underline;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafcff; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 12px;">© 2026 Zyro. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Magic Link / Sign-In Email

### Configuration Path
> **Supabase Dashboard** -> **Authentication** -> **Email Templates** -> **Magic Link**

### Template Subject
```text
Sign in to your Zyro Account
```

### Template Body (HTML)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Zyro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">ZYRO</h1>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Secure Login Link</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 32px; text-align: left;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Instant Access</h2>
              <p style="color: #475569; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">Click the button below to sign in instantly without typing your password.</p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s ease;">Log In to Zyro</a>
                  </td>
                </tr>
              </table>

              <!-- Warning / Note -->
              <p style="color: #64748b; margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; border-left: 3px solid #e2e8f0; padding-left: 12px;">This login link is valid for a single use and will expire in 24 hours.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;"><div style="border-top: 1px solid #f1f5f9; height: 1px; width: 100%;"></div></td>
          </tr>

          <!-- Fallback Link -->
          <tr>
            <td style="padding: 24px 32px; text-align: left;">
              <p style="color: #94a3b8; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Trouble clicking the button?</p>
              <p style="color: #475569; margin: 0; font-size: 12px; word-break: break-all; line-height: 1.5;"><a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: underline;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafcff; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 12px;">© 2026 Zyro. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Change Email Address Email

### Configuration Path
> **Supabase Dashboard** -> **Authentication** -> **Email Templates** -> **Change Email Address**

### Template Subject
```text
Confirm New Email Address for your Zyro Account
```

### Template Body (HTML)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your New Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">ZYRO</h1>
              <p style="color: rgba(255, 255, 255, 0.8); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Email Re-verification</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 32px; text-align: left;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Confirm Email Change</h2>
              <p style="color: #475569; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">You requested to change your email address. Please click below to confirm your new email: <strong>{{ .NewEmail }}</strong></p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s ease;">Confirm New Email</a>
                  </td>
                </tr>
              </table>

              <!-- Warning / Note -->
              <p style="color: #64748b; margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; border-left: 3px solid #f59e0b; padding-left: 12px;">If you did not request this email change, please contact administration or reset your password immediately.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;"><div style="border-top: 1px solid #f1f5f9; height: 1px; width: 100%;"></div></td>
          </tr>

          <!-- Fallback Link -->
          <tr>
            <td style="padding: 24px 32px; text-align: left;">
              <p style="color: #94a3b8; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Trouble clicking the button?</p>
              <p style="color: #475569; margin: 0; font-size: 12px; word-break: break-all; line-height: 1.5;"><a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: underline;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafcff; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 12px;">© 2026 Zyro. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🛠️ Step-by-Step Dashboard Setup

1.  **Configure Custom SMTP**
    *   To prevent emails from landing in **Spam**, configure custom SMTP using a validated sending domain (e.g. Resend, Mailgun, SendGrid, Amazon SES) in **Supabase Dashboard -> Settings -> Authentication -> SMTP Settings**.
    *   Ensure **SMTP Enabled** is toggled ON, and specify the **Sender Email** as `noreply@yourdomain.com` matching your SPF/DKIM DNS settings.

2.  **Toggle Confirmation Method (Link vs. OTP)**
    *   **Direct Link (Recommended)**: Under **Authentication -> Provider -> Email**, turn **OFF** `Confirm email (OTP)` and keep `Confirm email` **ON**. Paste the **Confirm Signup (Confirmation Email)** HTML into the template.
    *   **One-Time Password (OTP)**: Turn **ON** `Confirm email (OTP)`. Paste the **Confirm Signup (OTP Code / Token Email)** HTML into the template.
