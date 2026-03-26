# ------------------------------
from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent.parent.absolute()  # -> Ana proje klasörü
DATA_DIR = ROOT_DIR / "data"           # -> data klasörü
TEST_DIR = ROOT_DIR / "test"           # -> tests klasörü
SRC_DIR  = ROOT_DIR / "src"            # -> src klasörü
# -----------------------------

# .env dosyasını otomatik oku
BASE_DIR = Path(__file__).parent.parent
load_dotenv(BASE_DIR / "data" / "database" / ".env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
