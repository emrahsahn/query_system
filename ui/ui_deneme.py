# app.py
import os
import sys

import streamlit as st

# Streamlit komutu farklı klasörden çalıştırılsa da proje modülleri bulunabilsin.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from src.models import Describe
from src.database import Library

# Initialize database
library = Library()

st.set_page_config(page_title="Kurbanlık Program ", layout="wide")

st.title("🐐 Kurbanlık Takip Sistemi")


# Sidebar menu
menu = [
    "",
    "Müşterileri Göster",
    "Müşterileri Sorgula",
    "Müşteri Ekle",
    "Müşteri Sayısı",
    "Toplam Alacak",
    "Müşteri Güncelle",
    "Müşteri Silme"
]
choice = st.sidebar.selectbox("İşlem Seçin", menu)

x = st.sidebar.button("Yapan Kişi")
if x:
    st.header("Yapan Kişi Bilgileri")
    st.markdown(
        """
        **Adı:** Emrah ŞAHİN  
        **E-posta:** [sahinemrah3344@gmail.com](mailto:sahinemrah3344@gmail.com)  
        **GitHub:** [emrahsahn](https://github.com/emrahsahn)  
        **Telefon:** [0538-087-4885](tel:+905380874885)  
        **LinkedIn:** [emrah-şahin](https://www.linkedin.com/in/emrah-şahin-788799253)  
        """
    )

def display_customer_cards(customers):
    if not customers:
        st.info("Kayıtlı/Bulunan müşteri yok.")
        return
    if isinstance(customers, str):
        st.info(customers)
        return

    # Modern kart tasarımı için CSS
    st.markdown("""
        <style>
        .customer-card {
            background: linear-gradient(145deg, #1e1e2f, #2a2a42);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            color: #f7f9fc;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
            border: 1px solid #3c3c5a;
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            min-height: 290px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .customer-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
            border-color: #ff4757;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #edeff220;
            padding-bottom: 12px;
            margin-bottom: 12px;
        }
        .card-id {
            font-size: 1.3rem;
            font-weight: 800;
            color: #ff4757;
        }
        .card-type {
            background-color: #5352ed;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 700;
            box-shadow: 0 2px 5px rgba(83, 82, 237, 0.4);
        }
        .card-body {
            flex-grow: 1;
        }
        .card-body p {
            margin: 6px 0;
            font-size: 0.95rem;
            color: #dcdde1;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed #71809340;
            padding-bottom: 2px;
        }
        .card-body p:last-child {
            border-bottom: none;
        }
        .card-body strong {
            color: #7bed9f;
            font-weight: 600;
        }
        .price-tag {
            margin-top: 15px;
            font-size: 1.25rem;
            font-weight: 800;
            color: #ffa502;
            text-align: right;
            background: #ffa50215;
            padding: 8px;
            border-radius: 8px;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # Müşterileri satır başına n sütun olacak şekilde gösterelim (örn: 3 sütun)
    cols_per_row = 3
    for i in range(0, len(customers), cols_per_row):
        cols = st.columns(cols_per_row)
        for j in range(cols_per_row):
            idx = i + j
            if idx < len(customers):
                cust = customers[idx]
                
                card_html = f"""
                <div class="customer-card">
                    <div>
                        <div class="card-header">
                            <span class="card-id">#{cust.number}</span>
                            <span class="card-type">{cust.type}</span>
                        </div>
                        <div class="card-body">
                            <p><strong>✨ Özellik:</strong> <span>{cust.special}</span></p>
                            <p><strong>🏷️ Küpe:</strong> <span>{cust.color_of_earring}</span></p>
                            <p><strong>🎨 Renk:</strong> <span>{cust.color_of_animal}</span></p>
                            <p><strong>👤 Sahip:</strong> <span>{cust.whose}</span></p>
                            <p><strong>📦 Kimden:</strong> <span>{cust.from_whom}</span></p>
                            <p><strong>📞 Tlf:</strong> <span>{cust.phone_number}</span></p>
                            <p><strong>💳 Ödeme:</strong> <span>{cust.payment_method}</span></p>
                        </div>
                    </div>
                    <div class="price-tag">
                        💰 {cust.price} ₺
                    </div>
                </div>
                """
                cols[j].markdown(card_html, unsafe_allow_html=True)


if choice == "":
    st.subheader("Lütfen soldan İşlem seçin")

elif choice == "Müşterileri Göster":
    st.header("📋 Kayıtlı Tüm Müşteriler")
    
    col1, col2 = st.columns(2)
    with col1:
        sort_by = st.selectbox("Sıralama Ölçütü (Seçiniz)", ["Varsayılan", "Numara", "Fiyat", "Cins", "Kime Ait", "Kimden Alındı"])
    with col2:
        sort_order = st.radio("Sıralama Yönü", ["Artan", "Azalan"], horizontal=True)

    customers = library.exhibit_customer()
    
    if isinstance(customers, list):
        reverse = (sort_order == "Azalan")
        
        def safe_num_key(c):
            # Karışık harf-rakam (12A vs 12) olanlarda "TypeError: '<' not supported" hatasını engellemek için
            # eğer float'a çevrilebiliyorsa tip grubu 0, çevrilemiyorsa tip grubu 1 yapıyoruz.
            text = str(c.number).strip()
            try:
                return (0, float(text), "")
            except ValueError:
                return (1, 0.0, text.lower())

        def safe_price_key(c):
            text = str(c.price).strip()
            try:
                return (0, float(text), "")
            except ValueError:
                return (1, 0.0, text.lower())

        if sort_by == "Numara":
            customers.sort(key=safe_num_key, reverse=reverse)
        elif sort_by == "Fiyat":
            customers.sort(key=safe_price_key, reverse=reverse)
        elif sort_by == "Cins":
            customers.sort(key=lambda c: str(c.type).lower(), reverse=reverse)
        elif sort_by == "Kime Ait":
            customers.sort(key=lambda c: str(c.whose).lower(), reverse=reverse)
        elif sort_by == "Kimden Alındı":
            customers.sort(key=lambda c: str(c.from_whom).lower(), reverse=reverse)
        elif sort_by == "Varsayılan" and reverse:
            customers.reverse()

    display_customer_cards(customers)

elif choice == "Müşterileri Sorgula":
    st.markdown("<h2 style='color: #70a1ff;'>🔍 Müşteri Sorgulama</h2><hr>", unsafe_allow_html=True)
    query_options = [
        "Numaraya Göre",
        "Sahibe Göre",
        "Numara ve Sahibe Göre",
        "Türe Göre",
        "Telefon Numarasına Göre"
    ]
    q_choice = st.selectbox("Sorgulama Yöntemi Seçin:", query_options)

    # Form ile sorgulama: Enter tuşuna basıldığında otomatik submit
    with st.form(key="query_form"):
        if q_choice == "Numaraya Göre":
            num = st.text_input("🔢 Hayvan Numarası", key="num_input")
        elif q_choice == "Sahibe Göre":
            owner = st.text_input("👤 Sahip İsmi", key="owner_input")
        elif q_choice == "Numara ve Sahibe Göre":
            colA, colB = st.columns(2)
            with colA: num = st.text_input("🔢 Hayvan Numarası", key="num2_input")
            with colB: owner = st.text_input("👤 Sahip İsmi", key="owner2_input")
        elif q_choice == "Türe Göre":
            kind = st.text_input("🐑 Hayvan Türü/Cinsi", key="kind_input")
        elif q_choice == "Telefon Numarasına Göre":
            phone = st.text_input("📞 Telefon Numarası (Rakamlar)", key="phone_input")
            
        submit = st.form_submit_button("🔍 Sistemi Sorgula", use_container_width=True)

    if submit:
        if q_choice == "Numaraya Göre":
            res = library.query_animal_number(num, return_objects=True)
        elif q_choice == "Sahibe Göre":
            res = library.query_animal_whose(owner, return_objects=True)
        elif q_choice == "Numara ve Sahibe Göre":
            res = library.query_animal_whose_and_number(owner, num, return_objects=True)
        elif q_choice == "Türe Göre":
            res = library.query_animal_type(kind, return_objects=True)
        elif q_choice == "Telefon Numarasına Göre":
            formatted = f"{phone[:4]} {phone[4:7]} {phone[7:9]} {phone[9:]}"
            res = library.query_animal_phone_number(formatted, return_objects=True)
        
        display_customer_cards(res)

elif choice == "Müşteri Ekle":
    st.markdown("<h2 style='text-align: center; color: #ff4757;'>✨ Yeni Müşteri Kaydı</h2><hr>", unsafe_allow_html=True)
    with st.form(key="add_form"):
        st.markdown("#### Lütfen Hayvan ve Müşteri Bilgilerini Doldurun")
        col1, col2 = st.columns(2)
        with col1:
            number = st.text_input("🔢 Hayvan Numarası")
            kind = st.text_input("🐑 Cinsi")
            special = st.text_input("✨ Ekstra Özellik")
            earring = st.text_input("🏷️ Küpe Rengi")
            color = st.text_input("🎨 Hayvan Rengi")
        with col2:
            owner = st.text_input("👤 Kime Ait (Müşteri)")
            from_whom = st.text_input("📦 Kimden Alındı")
            
            st.markdown("<p style='margin-bottom:-10px; font-size:14px;'>💰 Fiyat (TL)</p>", unsafe_allow_html=True)
            c_m, c_d, c_k = st.columns([5, 1, 3])
            with c_m: price_main = st.text_input("Tam Kısım", placeholder="15400", label_visibility="collapsed")
            with c_d: st.markdown("<h3 style='text-align: center; margin-top: -3px;'>.</h3>", unsafe_allow_html=True)
            with c_k: price_dec = st.text_input("Küsürat", placeholder="00", max_chars=2, label_visibility="collapsed")

            phone = st.text_input("📞 Telefon Numarası", placeholder="Örn: 0532 123 45 67")
            payment = st.text_input("💳 Nasıl / Ne Kadar Ödendi?")
            
        st.markdown("<br>", unsafe_allow_html=True)
        submit = st.form_submit_button("✅ Sisteme Ekle", use_container_width=True)
        
    if submit:
        valid_number = True
        if not number or not number.strip().isdigit():
            st.error("❌ Hata: Hayvan numarası zorunludur ve SADECE RAKAMLARDAN oluşmalıdır (Örnek: 101).")
            valid_number = False

        phone_clean = phone.replace(" ", "").replace("-", "")
        
        # Fiyatı birleştirme: Tam ve küsürat
        p_main = price_main.strip()
        p_dec = price_dec.strip()
        if p_main:
            if not p_dec:
                p_dec = "00"
            price_clean = f"{p_main}.{p_dec}"
        else:
            price_clean = ""

        # Validasyon ve Hata Kontrolü
        valid_phone = True
        if phone_clean:
            if not phone_clean.isdigit():
                st.error("❌ Hata: Telefon numarası harf içeremez, sadece rakam kullanın.")
                valid_phone = False
            elif len(phone_clean) == 10 and not phone_clean.startswith("0"):
                phone_clean = "0" + phone_clean  # Unutursa 0 ekle
            elif len(phone_clean) == 11 and phone_clean.startswith("0"):
                pass
            else:
                st.error("❌ Hata: Telefon numarası geçersiz. Lütfen 0532 222 45 45 formatında giriniz.")
                valid_phone = False

        if valid_phone and valid_number:
            valid_price = True
            if price_clean:
                try:
                    float(price_clean)
                except ValueError:
                    st.error("❌ Hata: Fiyat alanına geçersiz karakter girdiniz! Sadece sayı kullanın.")
                    valid_price = False
            
            if valid_price:
                try:
                    customer = Describe(number, kind, special, earring, color, owner, from_whom, price_clean, phone_clean, payment)
                    library.add(customer)
                    st.success("🎉 Müşteri başarıyla eklendi.")
                except Exception as e:
                    st.error(f"❌ Kayıt sırasında hata oluştu: {e}")

elif choice == "Müşteri Sayısı":
    count = library.count_data()
    st.markdown(f"""
        <div style="background: linear-gradient(145deg, #1e1e2f, #2a2a42); border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 8px 16px rgba(0,0,0,0.3); border: 2px solid #5352ed; margin: 40px auto; max-width: 500px;">
            <p style="font-size: 1.8rem; color: #dcdde1; margin-bottom: 10px;">📊 Kayıtlı Toplam Müşteri</p>
            <h1 style="font-size: 5rem; color: #7bed9f; margin: 0;">{count}</h1>
            <p style="color: #ff4757; font-size: 1.2rem; margin-top: 10px;">Kişi / Hayvan</p>
        </div>
    """, unsafe_allow_html=True)

elif choice == "Toplam Alacak":
    total = library.sum_price()
    formatted_total = f"{total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    st.markdown(f"""
        <div style="background: linear-gradient(145deg, #2f3640, #353b48); border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.4); border: 2px solid #ffa502; margin: 40px auto; max-width: 500px;">
            <p style="font-size: 1.8rem; color: #dcdde1; margin-bottom: 10px;">💰 Beklenen Toplam Alacak</p>
            <h1 style="font-size: 4rem; color: #ffa502; margin: 0;">{formatted_total} ₺</h1>
            <p style="color: #7bed9f; font-size: 1.2rem; margin-top: 15px;">Türk Lirası (TL)</p>
        </div>
    """, unsafe_allow_html=True)

elif choice == "Müşteri Güncelle":
    st.markdown("<h2 style='text-align: center; color: #7bed9f;'>🔄 Müşteri Bilgisi Güncelle</h2><hr>", unsafe_allow_html=True)
    update_fields = [
        "Numara", "Cins", "Özellik", "Küpe Rengi", "Hayvan Rengi",
        "Sahip", "Kimden", "Fiyat", "Telefon Numarası", "Ödeme Yöntemi"
    ]
    
    with st.container():
        col1, col2 = st.columns([1, 1])
        with col1:
            st.markdown("### 🎯 İşlem Detayları")
            field = st.selectbox("Güncellenecek Alan", update_fields)
            old = st.text_input("🔑 Mevcut Hayvan Numarası (ID)")
        with col2:
            st.markdown("### ✏️ Yeni Veri")
            # Değiştirilecek alana göre dinamik özel UI gösterelim
            if field == "Telefon Numarası":
                new = st.text_input("Yeni Değer", placeholder="Örn: 0532 123 45 67")
            elif field == "Fiyat":
                st.markdown("<p style='margin-bottom:-10px; font-size:14px;'>Yeni Fiyat (TL)</p>", unsafe_allow_html=True)
                c_m, c_d, c_k = st.columns([5, 1, 3])
                with c_m: price_main = st.text_input("Tam Kısım", placeholder="15400", label_visibility="collapsed")
                with c_d: st.markdown("<h3 style='text-align: center; margin-top: -3px;'>.</h3>", unsafe_allow_html=True)
                with c_k: price_dec = st.text_input("Küsürat", placeholder="00", max_chars=2, label_visibility="collapsed")
                new = None
            elif field == "Numara":
                new = st.text_input("Yeni Değer (Sadece Rakam)", placeholder="Örn: 101")
            else:
                new = st.text_input("Yeni Değer")
                
            st.markdown("<br>", unsafe_allow_html=True)
            update_btn = st.button("🔄 Bilgileri Güncelle", use_container_width=True)

    if update_btn:
        has_error = False
        new_clean = ""

        # Eğer Form Fiyat güncellemesindeyse fiyatları kendimiz birleştiririz.
        if field == "Fiyat":
            p_main = price_main.strip()
            p_dec = price_dec.strip()
            if not p_dec: p_dec = "00"
            if p_main:
                new_clean = f"{p_main}.{p_dec}"
            else:
                new_clean = ""
        else:
            new_clean = new.strip()

        # Doğrulamalar (Validation)
        if field == "Numara":
            if not new_clean.isdigit():
                st.error("❌ Hata: Hayvan ID'si (Numara) yalnızca rakamlardan oluşmalıdır!")
                has_error = True
        elif field == "Telefon Numarası" and new_clean:
            new_clean = new_clean.replace(" ", "").replace("-", "")
            if not new_clean.isdigit():
                st.error("❌ Hata: Telefon numarası sadece rakamlardan oluşmalıdır.")
                has_error = True
            elif len(new_clean) == 10 and not new_clean.startswith("0"):
                new_clean = "0" + new_clean
            elif len(new_clean) == 11 and new_clean.startswith("0"):
                pass
            else:
                st.error("❌ Hata: Lütfen geçerli bir numara girin. Örn: 0532 222 45 45")
                has_error = True
            
        elif field == "Fiyat" and new_clean:
            try:
                float(new_clean)
            except ValueError:
                st.error("❌ Hata: Fiyat alanına geçersiz karakter girdiniz! Sadece sayı kullanın.")
                has_error = True

        if not has_error:
            try:
                func_map = {
                    "Numara": library.upgrade_data_number,
                    "Cins": library.upgrade_data_type,
                    "Özellik": library.upgrade_data_feature,
                    "Küpe Rengi": library.upgrade_data_color_of_earring,
                    "Hayvan Rengi": library.upgrade_data_color_of_animal,
                    "Sahip": library.upgrade_data_whose,
                    "Kimden": library.upgrade_data_from_whom,
                    "Fiyat": library.upgrade_data_price,
                    "Telefon Numarası": library.upgrade_data_phone_number,
                    "Ödeme Yöntemi": library.upgrade_data_payment_method
                }
                updater = func_map[field]
                updater(old, new_clean)
                st.success("✅ Güncelleme işlemi başarıyla tamamlandı.")
            except Exception as ex:
                st.error(f"❌ Güncelleme hatası: {ex}")

elif choice == "Müşteri Silme":
    st.markdown("<h2 style='text-align: center; color: #ff6b81;'>🗑️ Müşteri Kaydı Silme</h2><hr>", unsafe_allow_html=True)
    number = library.get_select_all_from_ID()
    
    if not number:
        st.warning("Kayıtlı hiçbir numara bulunamadı.")
    else:
        st.markdown("<p style='text-align: center; font-size: 1.1rem; color: #dfe6e9;'>Sistemden silmek istediğiniz kişiyi veya hayvanı aşağıdan seçin.<br><b style='color: #ff4757;'>Bu işlem geri alınamaz!</b></p>", unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)
        
        numbers_map = {u[0]: f"#{u[0]}  —  Sahibi: {u[5]}  —  Cins: {u[1]}" for u in number}

        col1, col2, col3 = st.columns([1,2,1])
        with col2:
            selected_number = st.selectbox(
                "❌ Silinecek Kayıt:",
                options=list(numbers_map.keys()),
                format_func=lambda x: numbers_map[x]
            )

            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("Kalıcı Olarak Sil", type="primary", use_container_width=True):
                try:
                    library.delete_data_from_ID(selected_number)
                    st.success("✅ Müşteri kaydı veritabanından başarıyla silinmiştir.")
                except Exception as err:
                    st.error(f"❌ Hata: {err}")



