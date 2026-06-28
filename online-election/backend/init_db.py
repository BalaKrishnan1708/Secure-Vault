#!/usr/bin/env python3
"""
Database initialization script for Supabase
Creates all necessary tables and initial data
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Missing Supabase credentials in .env file")
    exit(1)

print(f"Connecting to Supabase: {SUPABASE_URL}")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def init_tables():
    """Initialize all required tables"""
    try:
        # Test connection
        result = supabase.table("users").select("count", count="exact").execute()
        print("[OK] Connected to Supabase successfully")
        
        # Initialize settings table with default values
        try:
            settings_data = {
                "id": 1,
                "is_active": False,
                "registration_open": True,
                "start_time": None,
                "end_time": None,
                "min_voting_age": 18
            }
            supabase.table("settings").upsert(settings_data).execute()
            print("[OK] Settings table initialized")
        except Exception as e:
            print(f"[WARN] Settings table: {e}")

        # Add default admin users
        try:
            admin_users = [
                {"username": "admin", "password": "admin123", "voter_id": "ADMIN001", "role": "admin"},
                {"username": "se1", "password": "se123", "voter_id": "SE", "role": "admin"},
                {"username": "se2", "password": "se123", "voter_id": "SE-2", "role": "admin"},
                {"username": "observer", "password": "ob123", "voter_id": "OB", "role": "admin"},
                {"username": "admin_key", "password": "adm123", "voter_id": "ADM", "role": "admin"}
            ]
            
            for user in admin_users:
                try:
                    supabase.table("users").upsert(user).execute()
                    print(f"[OK] Added user: {user['username']}")
                except:
                    print(f"[WARN] User {user['username']} already exists")
                    
        except Exception as e:
            print(f"[WARN] Users setup: {e}")

        # Add sample parties
        try:
            parties = [
                {
                    "name": "DMK",
                    "symbol": "🌅",
                    "description": "Dravida Munnetra Kazhagam",
                    "manifesto": "Social justice and development",
                    "votes": 0,
                    "image_url": ""
                },
                {
                    "name": "AIADMK", 
                    "symbol": "🌿",
                    "description": "All India Anna Dravida Munnetra Kazhagam",
                    "manifesto": "Welfare and progress",
                    "votes": 0,
                    "image_url": ""
                },
                {
                    "name": "BJP",
                    "symbol": "🪷", 
                    "description": "Bharatiya Janata Party",
                    "manifesto": "Development and nationalism",
                    "votes": 0,
                    "image_url": ""
                }
            ]
            
            for party in parties:
                try:
                    supabase.table("parties").upsert(party).execute()
                    print(f"[OK] Added party: {party['name']}")
                except:
                    print(f"[WARN] Party {party['name']} already exists")
                    
        except Exception as e:
            print(f"[WARN] Parties setup: {e}")

        print("\n[OK] Database initialization completed!")
        print("\nDefault admin credentials:")
        print("Username: admin, Password: admin123")
        
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")

if __name__ == "__main__":
    init_tables()