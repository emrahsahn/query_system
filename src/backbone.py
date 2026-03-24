# ------------------------------
from pathlib import Path


ROOT_DIR = Path(__file__).parent.parent.absolute()  # -> Ana proje klasörü
DATA_DIR = ROOT_DIR / "data"           # -> data klasörü
TEST_DIR = ROOT_DIR / "test"           # -> tests klasörü
SRC_DIR  = ROOT_DIR / "src"            # -> src klasörü
DATABASE_DIR = DATA_DIR / "database" / "kütüphane.db"
# -----------------------------
