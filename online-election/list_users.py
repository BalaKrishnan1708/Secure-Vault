import os
from dotenv import load_dotenv
from supabase import create_client

def list_creds():
    env_path = os.path.join(os.getcwd(), 'backend', '.env')
    load_dotenv(env_path)
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(url, key)
    
    users = supabase.table("users").select("username,password,role,voter_id").execute().data
    for u in users:
        print(f"User: {u['username']}, Pass: {u['password']}, Role: {u['role']}, VoterID: {u['voter_id']}")

if __name__ == "__main__":
    list_creds()
