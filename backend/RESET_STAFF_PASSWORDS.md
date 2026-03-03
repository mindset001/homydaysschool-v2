# Reset Staff Passwords to Phone Numbers

## Issue
Existing staff members were created with the default password "Staff@123". They need to be updated to use their phone numbers as passwords.

## Solution
A migration endpoint has been created to reset all staff passwords to their phone numbers.

## Steps to Reset Passwords

### Option 1: Using cURL (Command Line)

1. **Login as Admin first** to get your access token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_admin_password"
  }'
```

2. **Copy the accessToken** from the response

3. **Call the reset endpoint**:
```bash
curl -X POST http://localhost:5000/api/staff/reset-passwords \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Option 2: Using Postman

1. **Login as Admin**:
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "your_admin_password"
     }
     ```
   - Copy the `accessToken` from response

2. **Reset Staff Passwords**:
   - Method: POST
   - URL: `http://localhost:5000/api/staff/reset-passwords`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer YOUR_ACCESS_TOKEN_HERE`

### Option 3: Using Browser Console

Open your browser's developer console on your admin dashboard and run:

```javascript
fetch('http://localhost:5000/api/staff/reset-passwords', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Expected Response

```json
{
  "message": "Staff passwords reset successfully",
  "updated": 5,
  "errors": 0,
  "total": 5
}
```

## After Running

All staff members can now login with:
- **Email**: Their registered email address
- **Password**: Their phone number (e.g., "08160071243")

## Note
This endpoint only needs to be run **ONCE** after deployment. Future staff members created will automatically use their phone numbers as passwords.
