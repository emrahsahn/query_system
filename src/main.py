# main.py
import os
import sys
import subprocess
from backbone import ROOT_DIR,SRC_DIR

def main():
    """
    Streamlit uygulamasını başlatır.
    """
    # Python yorumlayıcısı ile `streamlit run app.py` komutunu çalıştırıyoruz
    script_path = os.path.join(os.path.dirname(__file__), "..", "ui", "ui.py")
    script_path = os.path.abspath(script_path)
    cmd = [
        sys.executable,  # mevcut python yürütücüsü
        "-m", 
        "streamlit", 
        "run", 
        script_path         # Streamlit kodunun bulunduğu dosya
    ]
    subprocess.run(cmd, check=True)

if __name__ == "__main__":
    # Eğer kullanıcı terminale 'python main.py' yerine 'streamlit run main.py'
    # yazarsa uygulamanın kendi kendini ikinci kez (arka arkaya iki portta)
    # açmasını engelliyoruz.
    if "streamlit" in sys.argv[0]:
        print("UYARI: Bu dosyayı 'streamlit run main.py' ile çalıştırdınız.")
        print("main.py zaten otomatik olarak Streamlit'i başlatmak üzere ayarlanmıştır.")
        print("Lütfen bu scripti terminalde sadece: 'python main.py' yazarak çalıştırın.")
        # Ayrıca subprocess açmasını engellemek için kodun devam etmesini durduruyoruz
    else:
        main()
