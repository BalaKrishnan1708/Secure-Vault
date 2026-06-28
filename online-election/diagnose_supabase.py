import os
from dotenv import load_dotenv
from supabase import create_client

def diagnose():
    env_path = os.path.join(os.getcwd(), 'backend', '.env')
    load_dotenv(env_path)

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    print(f"URL: {url}")
    if key:
        print(f"Key Prefix: {key[:10]}...")
    else:
        print("Key is MISSING")

    if not url or not key:
        print("Missing credentials")
        return

    try:
        supabase = create_client(url, key)

        tables = ["users", "parties", "votes", "settings"]
        for table in tables:
            try:
                res = supabase.table(table).select("*").execute()
                print(f"Table '{table}': {len(res.data)} rows")
                if table == "settings":
                    print(f"Settings data: {res.data}")
            except Exception as e:
                print(f"Table '{table}' Error: {e}")
    except Exception as e:
        print(f"Supabase Client Error: {e}")

if __name__ == "__main__":
    diagnose()
