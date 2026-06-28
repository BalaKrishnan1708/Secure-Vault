
from supabase import create_client
import os

url = "https://vvyuhplekvizscvovral.supabase.co"
# Key from SupabaseService.dart
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eXVocGxla3ZpenNjdm92cmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzQwNzEsImV4cCI6MjA4NDg1MDA3MX0.BugWw5SlEICo2UXDe-pBuvoLJbLSaUJjzKr4tilTnSc"

print(f"Testing JWT Key from Flutter app...")
try:
    supabase = create_client(url, key)
    res = supabase.table("users").select("*").limit(1).execute()
    print("JWT Key connection Successful!")
    print(f"Data count: {len(res.data)}")
except Exception as e:
    print(f"JWT Key connection Failed: {e}")
