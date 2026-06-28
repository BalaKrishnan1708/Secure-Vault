#!/usr/bin/env python3
"""
Test database connection and show current data
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_connection():
    try:
        print("Testing Supabase connection...")
        
        # Test users table
        users = supabase.table("users").select("username,voter_id,role").execute()
        print(f"\nUsers table: {len(users.data)} records")
        for user in users.data[:5]:  # Show first 5
            print(f"  - {user['username']} ({user['voter_id']}) - {user['role']}")
        
        # Test parties table
        parties = supabase.table("parties").select("name,symbol,votes").execute()
        print(f"\nParties table: {len(parties.data)} records")
        for party in parties.data:
            print(f"  - {party['name']} {party['symbol']} - {party['votes']} votes")
        
        # Test settings table
        settings = supabase.table("settings").select("*").execute()
        print(f"\nSettings table: {len(settings.data)} records")
        if settings.data:
            s = settings.data[0]
            print(f"  - Active: {s.get('is_active')}")
            print(f"  - Registration Open: {s.get('registration_open')}")
        
        # Test votes table
        votes = supabase.table("votes").select("user_id").execute()
        print(f"\nVotes table: {len(votes.data)} records")
        
        print("\n[OK] Database connection successful!")
        
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")

if __name__ == "__main__":
    test_connection()