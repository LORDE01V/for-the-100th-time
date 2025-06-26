from flask_jwt_extended import create_access_token
import os

# Use a fixed secret key for testing
SECRET_KEY = "your-secret-key-for-testing"
JWT_SECRET_KEY = "your-jwt-secret-key-for-testing"

# Create a test user ID
user_id = 1  # This should match a user ID in your database

# Create the token
token = create_access_token(identity=user_id)

print("\nGenerated JWT Token:")
print("-------------------")
print(token)
print("\nTo use this token in your requests, add this header:")
print(f"Authorization: Bearer {token}")
