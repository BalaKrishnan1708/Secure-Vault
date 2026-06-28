import os
import sys
from dotenv import load_dotenv

# Add backend to path to import app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import supabase

try:
    res = supabase.table("users").select("count", count="exact").execute()
    print(f"Supabase Connection Test: {res.count} users found.")
except Exception as e:
    print(f"Supabase Connection Test FAILED: {e}")
