import os
from dotenv import load_dotenv
from supabase import create_client

env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.table("users").select("username,password,role").execute()
print(res.data)
