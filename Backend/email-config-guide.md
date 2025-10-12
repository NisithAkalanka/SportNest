# Email Configuration Guide

## Admin Email Setup

To set up the admin email notification system, you need to configure the following environment variables:

### 1. Create a `.env` file in the Backend directory

Create a file named `.env` in the `Backend` folder with the following content:

```env
# Admin Email Configuration
ADMIN_EMAIL=nisithakalanka15@gmail.com

# Frontend URL for confirmation links
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sportnest

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=5002
NODE_ENV=development
```

### 2. Gmail App Password Setup

Since you're using Gmail, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in the `EMAIL_PASS` field

### 3. Email Configuration Variables

- `ADMIN_EMAIL`: The email address that will receive delivery confirmation notifications
- `EMAIL_USER`: Your Gmail address (the sender)
- `EMAIL_PASS`: Your Gmail app password (not your regular password)

### 4. Testing Email Functionality

The system includes a test endpoint to verify email configuration:
- Endpoint: `GET /api/deliveries/test-email`
- This will send a test email to verify the configuration

### 5. How It Works

When a driver confirms a delivery:
1. The delivery status is updated to "Delivered"
2. An email is automatically sent to `ADMIN_EMAIL` (nisithakalanka15@gmail.com)
3. The email contains all delivery details including:
   - Order ID
   - Customer information
   - Driver details
   - Delivery address
   - Confirmation timestamp

### 6. Troubleshooting

If emails are not being sent:
1. Check the console logs for email errors
2. Verify your Gmail app password is correct
3. Ensure 2FA is enabled on your Gmail account
4. Check that the `ADMIN_EMAIL` is set correctly

### 7. Security Notes

- Never commit the `.env` file to version control
- Use app passwords instead of your regular Gmail password
- Keep your email credentials secure
