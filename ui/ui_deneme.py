# app.py
import streamlit as st
from models import Describe
from database import Library

# Initialize database
library = Library()

st.set_page_config(page_title="Kurbanlık Program ", layout="wide")

st.title("🐐 Kurbanlık Takip Sistemi")

# Sidebar menu
menu = [
    "Müşterileri Göster",
    "Müşterileri Sorgula",
    "Müşteri Ekle",
    "Müşteri Sayısı",
    "Toplam Alacak",
    "Müşteri Güncelle",
    "Yapan Kişi"
]
choice = st.sidebar.selectbox("İşlem Seçin", menu)

if choice == "Müşterileri Göster":
    st.header("Kayıtlı Tüm Müşteriler")
    customers = library.exhibit_customer()
    if not customers:
        st.info("Kayıtlı müşteri bulunamadı.")
    else:
        for cust in customers:
            st.text(str(cust))

elif choice == "Müşterileri Sorgula":
    st.header("Müşteri Sorgulama")
    query_options = [
        "Numaraya Göre",
        "Sahibe Göre",
        "Numara ve Sahibe Göre",
        "Türe Göre",
        "Telefon Numarasına Göre"
    ]
    q_choice = st.selectbox("Sorgulama Yöntemi", query_options)

    # Form ile sorgulama: Enter tuşuna basıldığında otomatik submit
    with st.form(key="query_form"):
        if q_choice == "Numaraya Göre":
            num = st.text_input("Hayvan Numarası", key="num_input")
        elif q_choice == "Sahibe Göre":
            owner = st.text_input("Sahip İsmi", key="owner_input")
        elif q_choice == "Numara ve Sahibe Göre":
            num = st.text_input("Hayvan Numarası", key="num2_input")
            owner = st.text_input("Sahip İsmi", key="owner2_input")
        elif q_choice == "Türe Göre":
            kind = st.text_input("Hayvan Türü", key="kind_input")
        elif q_choice == "Telefon Numarasına Göre":
            phone = st.text_input("Telefon Numarası (Rakamlar)", key="phone_input")
        submit = st.form_submit_button("Sorgula")

    if submit:
        if q_choice == "Numaraya Göre":
            res = library.query_animal_number(num)
        elif q_choice == "Sahibe Göre":
            res = library.query_animal_whose(owner)
        elif q_choice == "Numara ve Sahibe Göre":
            res = library.query_animal_whose_and_number(owner, num)
        elif q_choice == "Türe Göre":
            res = library.query_animal_type(kind)
        elif q_choice == "Telefon Numarasına Göre":
            formatted = f"{phone[:4]} {phone[4:7]} {phone[7:9]} {phone[9:]}"
            res = library.query_animal_phone_number(formatted)
        st.text(res)

elif choice == "Müşteri Ekle":
    st.header("Yeni Müşteri Ekle")
    with st.form(key="add_form"):
        number = st.text_input("Numara")
        kind = st.text_input("Cins")
        special = st.text_input("Özellik")
        earring = st.text_input("Küpe Rengi")
        color = st.text_input("Hayvan Rengi")
        owner = st.text_input("Kime Ait")
        from_whom = st.text_input("Kimden Alındı")
        price = st.text_input("Fiyat (örn. 123.45)")
        phone = st.text_input("Telefon Numarası (Rakamlar)")
        payment = st.text_input("Ödeme Yöntemi ve Miktar")
        submit = st.form_submit_button("Ekle")
    if submit:
        try:
            customer = Describe(number, kind, special, earring, color, owner, from_whom, price, phone, payment)
            library.add(customer)
            st.success("Müşteri başarıyla eklendi.")
        except Exception as e:
            st.error(f"Hata: {e}")

elif choice == "Müşteri Sayısı":
    st.header("Kayıtlı Müşteri Sayısı")
    count = library.count_data()
    st.metric("Müşteri Sayısı", count)

elif choice == "Toplam Alacak":
    st.header("Toplam Alacak")
    total = library.sum_price()
    st.metric("Toplam Alacak (TL)", total)

elif choice == "Müşteri Güncelle":
    st.header("Müşteri Bilgisi Güncelle")
    update_fields = [
        "Numara",
        "Cins",
        "Özellik",
        "Küpe Rengi",
        "Hayvan Rengi",
        "Sahip",
        "Kimden",
        "Fiyat",
        "Telefon Numarası",
        "Ödeme Yöntemi"
    ]
    field = st.selectbox("Güncellenecek Alan", update_fields)
    old = st.text_input("Eski Numara (UNIQUE)")
    new = st.text_input("Yeni Değer")
    if st.button("Güncelle"):
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
            updater(old, new)
            st.success("Güncelleme başarılı.")
        except Exception as ex:
            st.error(f"Güncelleme hatası: {ex}")

elif choice == "Yapan Kişi":
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
