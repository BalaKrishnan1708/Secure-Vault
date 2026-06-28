
from supabase import create_client
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
load_dotenv(env_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from security import hash_password

admin_user = {
    "username": "admin",
    "password": hash_password("123"), 
    "voter_id": "ADMIN",
    "role": "admin"
}

try:
    print("Creating Admin User...")
    existing = supabase.table("users").select("*").eq("username", "admin").execute()
    if not existing.data:
        supabase.table("users").insert(admin_user).execute()
        print("Admin user created (with hashed password).")
    else:
        # Update existing to be hashed if it's not
        print("Admin user already exists. Updating password to hash...")
        supabase.table("users").update({"password": hash_password("123")}).eq("username", "admin").execute()

except Exception as e:
    print(f"Error: {e}")
