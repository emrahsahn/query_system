# ------------------------------
from pathlib import Path


ROOT_DIR = Path(__file__).parent.parent.absolute()  # -> Ana proje klasörü
DATA_DIR = rf'{ROOT_DIR}\data'  # -> data klasörü
TEST_DIR = rf'{ROOT_DIR}\test'  # -> tests klasörü
SRC_DIR = rf'{ROOT_DIR}\src'    # -> src klasörü
DATABASE_DIR = rf'{DATA_DIR}\database\kütüphane.db'
# -----------------------------
