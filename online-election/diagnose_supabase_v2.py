import os
from dotenv import load_dotenv
from supabase import create_client

def diagnose():
    env_path = os.path.join(os.getcwd(), 'backend', '.env')
    load_dotenv(env_path)

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    supabase = create_client(url, key)
    tables = ["users", "parties", "votes", "settings"]
    for table in tables:
        try:
            res = supabase.table(table).select("*").execute()
            print(f"TABLE_{table}_COUNT:{len(res.data)}")
        except Exception as e:
            print(f"TABLE_{table}_ERROR:{str(e)}")

if __name__ == "__main__":
    diagnose()
