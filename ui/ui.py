import sys
import sqlite3
from PyQt5 import QtWidgets, QtCore, QtGui
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QDialog, QVBoxLayout, QHBoxLayout,
    QLabel, QScrollArea, QWidget, QFrame, QGridLayout, QSizePolicy
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QColor, QPalette
from src.database import Library
from src.models import Describe

class LibraryApp(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()

        self.initUI()


    def initUI(self):
        self.setWindowTitle("Kurbanlık Program")
        self.setGeometry(0, 0, 1100, 1000)

        self.library = Library()

        self.text_edit = QtWidgets.QTextEdit(self)
        self.text_edit.setStyleSheet('background-color: rgb(255, 255, 255);'
                                        'border-color: rgb(18, 18, 18);'
                                        'color: rgb(0, 0, 0);'
                                        'font: bold 11pt "Times New Roman";'
                                        )
        self.text_edit.setGeometry(0, 0, 800, 1000)

        self.button_show_customers = QtWidgets.QPushButton("Müşterileri Göster", self)  # the button name was "Müşterileri Göster" created
        self.button_show_customers.setGeometry(850, 10, 230, 30)
        self.button_show_customers.clicked.connect(self.show_customers)

        self.button_query_customers = QtWidgets.QPushButton("Müşterileri Sorgula", self)  # the button name was "Müşterileri Sorgula" created
        self.button_query_customers.setGeometry(850, 60, 230, 30)
        self.button_query_customers.clicked.connect(self.query_customers)

        self.button_add_customer = QtWidgets.QPushButton("Müşteri Ekle", self)  # the button name was "Müşteri Ekle" created
        self.button_add_customer.setGeometry(850, 110, 230, 30)
        self.button_add_customer.clicked.connect(self.add_customer)

        self.button_count_customers = QtWidgets.QPushButton("Kayıtlı Olan Müşteri Sayısı", self)  # the button name was "Kayıtlı Olan Müşteri Sayısı" created
        self.button_count_customers.setGeometry(850, 160, 230, 30)
        self.button_count_customers.clicked.connect(self.count_customers)

        self.button_sum_price = QtWidgets.QPushButton("Kayıtlı Olan Müşterilerden Toplam ALACAK", self)  # the button name was "Kayıtlı Olan Müşterilerden Toplam ALACAK" created
        self.button_sum_price.setGeometry(850, 210, 230, 30)
        self.button_sum_price.clicked.connect(self.sum_price1)

        self.button_update_customer = QtWidgets.QPushButton("Düzeltilmek İstenen Müşteri Kaydı", self)  # the button name was "Düzeltilmek İstenen Müşteri Kaydı" created
        self.button_update_customer.setGeometry(850, 260, 230, 30)
        self.button_update_customer.clicked.connect(self.update_customer)

        self.button_quit = QtWidgets.QPushButton("Çıkış",self)    # the button name was "Çıkış" created
        self.button_quit.setGeometry(850, 310, 230, 30)
        self.button_quit.clicked.connect(self.quit)

        self.button_person_who_does = QtWidgets.QPushButton("!! Emrah ŞAHİN !!",self)    # the button name was "!! Emrah ŞAHİN !!" created
        self.button_person_who_does.setGeometry(850, 950, 230, 30)
        self.button_person_who_does.clicked.connect(self.person_who_does)

    def person_who_does(self):
        '''The function is show that information of the preson who made'''
        self.my_info_window = QDialog(self)  # this line allows create the new window
        self.my_info_window.setWindowTitle("Yapan Kişi Bilgileri")
        self.my_info_window.setGeometry(100, 100, 200, 200)

        layout = QVBoxLayout()

        information = QLabel()
        information.setText("<html>Kişi Bilgileri<br><br>"
                            "Adı: Emrah ŞAHİN <br>"
                            "E-posta: <a href='mailto:sahinemrah3344@gmail.com'>sahinemrah3344@gmail.com</a><br>"
                            "Github:<a href='https://github.com/emrahsahn'> WebSite </a><br>"
                            "Telefon Numarası:<a href='tel:+905380874885'>0538-087-4885</a><br>"
                            "Linkedln:<a href='www.linkedin.com/in/emrah-şahin-788799253'>WebSite</a></html>")

        information.setGeometry(0, 0, 50, 100)
        information.setOpenExternalLinks(True)  # this will allow the links to open in the browser
        layout.addWidget(information)

        self.my_info_window.setLayout(layout)
        self.my_info_window.exec_()  # this line is show like modal to new window


    def show_customers(self):
        result = self.library.exhibit_customer()
        if isinstance(result, str):
            # Hata veya boş mesaj durumunda eski davranış
            self.text_edit.clear()
            self.text_edit.append(result)
        else:
            # Müşteri kartları dialog penceresini aç
            dialog = CustomerCardsDialog(result, self)
            dialog.exec_()


class CustomerCardsDialog(QDialog):
    """Müşterileri modern kart grid düzeninde gösteren dialog penceresi."""

    # Renk paleti
    BG_COLOR       = "#1a1a2e"
    CARD_BG        = "#16213e"
    CARD_BORDER    = "#0f3460"
    ACCENT         = "#e94560"
    ACCENT2        = "#533483"
    TEXT_PRIMARY   = "#eaeaea"
    TEXT_SECONDARY = "#a0a0c0"
    TAG_BG         = "#0f3460"

    LABELS = [
        ("🔢", "Numara"),
        ("🐑", "Cins"),
        ("✨", "Özellik"),
        ("🏷️", "Küpe Rengi"),
        ("🎨", "Hayvan Rengi"),
        ("👤", "Kime Ait"),
        ("📦", "Kimden"),
        ("💰", "Fiyat"),
        ("📞", "Telefon"),
        ("💳", "Ödeme Yöntemi"),
    ]

    def __init__(self, customers, parent=None):
        super().__init__(parent)
        self.customers = customers
        self._build_ui()

    def _build_ui(self):
        self.setWindowTitle("Müşteri Listesi")
        self.setMinimumSize(1050, 750)
        self.setStyleSheet(f"background-color: {self.BG_COLOR}; color: {self.TEXT_PRIMARY};")

        # Ana layout
        outer = QVBoxLayout(self)
        outer.setContentsMargins(20, 20, 20, 20)
        outer.setSpacing(14)

        # Başlık
        title = QLabel(f"📋  Kayıtlı Müşteriler  —  {len(self.customers)} Kayıt")
        title.setAlignment(Qt.AlignCenter)
        title.setFont(QFont("Segoe UI", 16, QFont.Bold))
        title.setStyleSheet(f"""
            color: {self.TEXT_PRIMARY};
            padding: 8px 0;
            border-bottom: 2px solid {self.ACCENT};
            margin-bottom: 4px;
        """)
        outer.addWidget(title)

        # Kaydırılabilir alan
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet(f"""
            QScrollArea {{ border: none; background: transparent; }}
            QScrollBar:vertical {{
                background: {self.CARD_BG}; width: 10px; border-radius: 5px;
            }}
            QScrollBar::handle:vertical {{
                background: {self.ACCENT2}; border-radius: 5px;
            }}
        """)

        container = QWidget()
        container.setStyleSheet("background: transparent;")
        grid = QGridLayout(container)
        grid.setContentsMargins(8, 8, 8, 8)
        grid.setSpacing(14)

        COLS = 3  # Her satırda 3 kart
        for idx, customer in enumerate(self.customers):
            card = self._make_card(customer)
            grid.addWidget(card, idx // COLS, idx % COLS)

        # Grid'in son satırdan sonra boşluk bırakmasın
        grid.setRowStretch(len(self.customers) // COLS + 1, 1)

        scroll.setWidget(container)
        outer.addWidget(scroll)

        # Kapat butonu
        close_btn = QtWidgets.QPushButton("✖  Kapat")
        close_btn.setCursor(Qt.PointingHandCursor)
        close_btn.setFixedHeight(38)
        close_btn.setFont(QFont("Segoe UI", 10, QFont.Bold))
        close_btn.setStyleSheet(f"""
            QPushButton {{
                background: {self.ACCENT};
                color: white;
                border: none;
                border-radius: 8px;
                padding: 0 24px;
            }}
            QPushButton:hover {{
                background: #c73652;
            }}
        """)
        close_btn.clicked.connect(self.close)
        outer.addWidget(close_btn, alignment=Qt.AlignRight)

    def _make_card(self, customer):
        """Tek bir müşteri için kart widget'ı oluşturur."""
        card = QFrame()
        card.setFrameShape(QFrame.StyledPanel)
        card.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Minimum)
        card.setStyleSheet(f"""
            QFrame {{
                background-color: {self.CARD_BG};
                border: 1px solid {self.CARD_BORDER};
                border-radius: 12px;
            }}
            QFrame:hover {{
                border: 1.5px solid {self.ACCENT};
            }}
        """)

        layout = QVBoxLayout(card)
        layout.setContentsMargins(14, 12, 14, 14)
        layout.setSpacing(6)

        # Kart başlığı: Numara + Cins
        header = QHBoxLayout()
        num_label = QLabel(f"#{customer.number}")
        num_label.setFont(QFont("Segoe UI", 13, QFont.Bold))
        num_label.setStyleSheet(f"color: {self.ACCENT}; background: transparent;")

        type_badge = QLabel(f"  {customer.type}  ")
        type_badge.setFont(QFont("Segoe UI", 9, QFont.Bold))
        type_badge.setStyleSheet(f"""
            background: {self.ACCENT2};
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
        """)
        header.addWidget(num_label)
        header.addStretch()
        header.addWidget(type_badge)
        layout.addLayout(header)

        # Ayırıcı çizgi
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setStyleSheet(f"background: {self.CARD_BORDER}; border: none; max-height: 1px; margin: 2px 0;")
        layout.addWidget(line)

        # Alanlar
        values = [
            customer.number,
            customer.type,
            customer.special,
            customer.color_of_earring,
            customer.color_of_animal,
            customer.whose,
            customer.from_whom,
            customer.price,
            customer.phone_number,
            customer.payment_method,
        ]

        # Numara ve Cins zaten başlıkta gösterildi, diğerlerini listele
        for (icon, label_text), value in zip(self.LABELS[2:], values[2:]):
            row = QHBoxLayout()
            row.setSpacing(6)

            lbl = QLabel(f"{icon} {label_text}:")
            lbl.setFont(QFont("Segoe UI", 8))
            lbl.setStyleSheet(f"color: {self.TEXT_SECONDARY}; background: transparent;")
            lbl.setFixedWidth(120)

            val = QLabel(str(value) if value is not None else "—")
            val.setFont(QFont("Segoe UI", 9, QFont.Bold))
            val.setWordWrap(True)
            val.setStyleSheet(f"color: {self.TEXT_PRIMARY}; background: transparent;")

            row.addWidget(lbl)
            row.addWidget(val, 1)
            layout.addLayout(row)

        return card



    def query_customers(self):
        options = ["Seçiniz", "Müşterinin hayvan numarası ile sorgulama:".title(),
                   "Hayvanın kime ait olduğu ile sorgulama:".title(),
                   "Hayvanın kime ait olduğu ve numarası ile sorgulama:".title(),
                   "Hayvanın türü ile sorgulama:".title(),
                   "Hayvan sahibinin telefon numarası ile sorgulama:".title()]

        selected_option, okPressed = QtWidgets.QInputDialog.getItem(self, "Müşteri Sorgulama",
                                                                    "Sorgulama Yöntemi Seçin:", options, 0, False)

        if okPressed and selected_option:
            if selected_option == "Seçiniz":
                return  # Exit without taking any action

            elif selected_option == "Müşterinin hayvan numarası ile sorgulama:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                 "Müşterinin hayvan numarasını girin:".title())
                if okPressed and text != "":
                    result = self.library.query_animal_number(text)
                    self.text_edit.clear()
                    self.text_edit.append(result)

            elif selected_option == "Hayvanın kime ait olduğu ile sorgulama:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                 "Hayvanının sahibinin ismini girin:".title())
                if okPressed and text != "":
                    result = self.library.query_animal_whose(text)
                    self.text_edit.clear()
                    self.text_edit.append(result)

            elif selected_option == "Hayvanın kime ait olduğu ve numarası ile sorgulama:".title():
                text_number, okPressed1 = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                         "Hayvanın numarasını girin:".title())
                text_whose, okPressed2 = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                        "Hayvan sahibinin ismini girin:".title())

                if (okPressed1 and okPressed2) and (text_number != "" or text_whose != ""):
                    result = self.library.query_animal_whose_and_number(text_whose, text_number)
                    self.text_edit.clear()
                    self.text_edit.append(result)

            elif selected_option == "Hayvanın türü ile sorgulama:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                 "Hayvanının türünü girin:".title())
                if okPressed and text != "":
                    result = self.library.query_animal_type(text)
                    self.text_edit.clear()
                    self.text_edit.append(result)

            elif selected_option == "Hayvan sahibinin telefon numarası ile sorgulama:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                 "Hayvan sahibinin telefon numarasını girin:".title())
                if okPressed and text != "":
                    text = text.strip()
                    text = f"{text[:4]} {text[4:7]} {text[7:9]} {text[9:]}"
                    result = self.library.query_animal_phone_number(text)
                    self.text_edit.clear()
                    self.text_edit.append(result)


    def add_customer(self):
        customer_data = []  # create a list to hold customer data

        # get information from the user individually
        fields = ["numara", "cins", "özellik", "küpe rengi", "renk", "kime ait", "kimden", "fiyat", "telefon numarası", "ödeme yöntemi"]
        for field in fields:
            text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Ekle", f"Hayvanın {field} girin:")
            if okPressed and text != "":
                customer_data.append(text)
            else:
                self.text_edit.clear()
                self.text_edit.append("Hatalı giriş. Müşteri eklenemedi.")
                return  # ıf the user entered any information incompletely,terminate the process

        try:
            customer = Describe(*customer_data)
            # üstteki satır kullanıcının girdiği verilere dayalı olarak yeni bir müşteri nesnesi oluşturur
            # ve bu nesneyi daha sonra veritabanına eklemek veya başka işlemler yapmak için kullanabilirsiniz.
            self.library.add(customer)
            self.text_edit.clear()
            self.text_edit.append("Müşteri başarıyla eklendi.")
        except sqlite3.Error as err:
            print("HATANIN NEDENİ", err)



    def count_customers(self):
        '''This function allows connectt to count_data func when picked the button'''
        count = self.library.count_data()
        self.text_edit.clear()
        self.text_edit.append(f"Kütüphanemizdeki kayıtlı müşteri sayısı sayısı: {count}")

    def sum_price1(self):
        '''This function allows connectt to sum_price func when picked the button'''
        total_price = self.library.sum_price()
        self.text_edit.clear()
        self.text_edit.append(f"Kütüphanemizdeki kayıtlı olan müşterilerden toplam ALINACAK: {total_price}")

    def update_customer(self):

        options = ["Verinin hangi kısmını düzeltmek istiyorsunuz", "Hayvanın numarası için düzenleme:".title(),
                   "Hayvanın cinsi için düzenleme:".title(),
                   "Hayvanın özelliği için düzenleme:".title(),
                   "Hayvanın Küpe Rengi için düzenleme:".title(),
                   "Hayvanın rengi için düzenleme:".title(),
                   "Hayvanın kime ait olduğunu değiştirmek için düzenleme: ".title(),
                   "Hayvanın kimden olduğunu değiştirmek için düzenleme:".title(),
                   "Hayvanın fiyatı için düzenleme:".title(),
                   "Hayvanın sahibinin telefon numarasını değiştirmek için düzenleme:".title(),
                   "Ödeme Yöntemi ve ne kadar ödendi:".title()]

        selected_option, okPressed = QtWidgets.QInputDialog.getItem(self, "Müşteri Hataları Düzenleme"
                                                                    ,"Düzenleme Yöntemi Seçin:", options, 0, False)

        if okPressed and selected_option:
            if selected_option == "Seçiniz":
                return  # Exit without taking any action

            elif selected_option == "Hayvanın numarası için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                        ,"Hayvanın yeni numarasını girin:(eski numara,yeni numara)şeklinde giriniz ")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        try:
                            # update made here
                            self.library.upgrade_data_number(info[0], info[1])
                            # it can continue in the same way for another update processes.

                            self.text_edit.clear()
                            self.text_edit.append("Müşteri başarıyla güncellendi.")
                            self.library.connect.commit()  # changes to save

                        except Exception as e:
                            self.text_edit.clear()
                            self.text_edit.append(f"Hata oluştu: {str(e)}")



            elif selected_option == "Hayvanın cinsi için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                                        , "Hayvanın cinsini girin:(numara, yeni cins) şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_type(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                        self.library.connect.commit()
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")



            elif selected_option == "Hayvanın özelliği için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                                , "Hayvanın özelliğini girin:(numara,yeni_özellik) şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_feature(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                        self.library.connect.commit()
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")

            elif selected_option == "Hayvanın küpe rengi için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                            , "Hayvanın küpe rengini girin: (numara, yeni küpe rengi) şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_color_of_earring(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                        self.library.connect.commit()
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")


            elif selected_option == "Hayvanın rengi için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                            , "Hayvanın rengini girin: (numara, yeni rengi) şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_color_of_earring(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                        self.library.connect.commit()
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")



            elif selected_option == "Hayvanın kime ait olduğunu değiştirmek için düzenleme: ".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                                        , "Hayvanın sahibini girin: (numara, yeni sahibi) şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_whose(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                        self.library.connect.commit()
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")



            elif selected_option == "Hayvanın kimden olduğunu değiştirmek için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                                         , "Hayvan kimden olduğunu girin:(numara, yeni) şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_from_whom(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")

            elif selected_option == "Hayvanın fiyatı için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                                         , "Hayvan yeni fiyatını girin:(numara, yeni fiyat) şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_price(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")

            elif selected_option == "Hayvanın sahibinin telefon numarasını değiştirmek için düzenleme:".title():
                text, okPressed = QtWidgets.QInputDialog.getText(self, "Müşteri Güncelle"
                                                         , "Hayvan kimden olduğunu girin:(numara, yeni telefon numarası) "
                                                           "şeklinde giriniz")

                if okPressed and text != "":
                    info = text.split(',')
                    if len(info) == 2:
                        self.library.upgrade_data_phone_number(info[0], info[1])
                        self.text_edit.clear()
                        self.text_edit.append("Müşteri başarıyla güncellendi.")
                    else:
                        self.text_edit.clear()
                        self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.")


            elif selected_option == "Ödeme Yöntemi ve ne kadar ödendi:".title():
                text_number, okPressed1 = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                         "Hayvanın numarasını girin:".title())
                text_payment_method, okPressed2 = QtWidgets.QInputDialog.getText(self, "Müşteri Sorgula",
                                                                        "Ödeme şekli ve ne kadar ödendiğini girin:".title())
                if (okPressed1 and okPressed2) and (text_number != "" or text_payment_method != ""):
                    self.library.upgrade_data_payment_method(text_number,text_payment_method)
                    self.text_edit.clear()
                    self.text_edit.append("Müşteri başarıyla güncellendi.\n")
                    # result = self.library.query_animal_whose(text_number)
                    # self.text_edit.append(result)
                    # here I tried changes to show but I did not
                else:
                    self.text_edit.clear()
                    self.text_edit.append("Hatalı giriş. Müşteri güncellenemedi.\n")
                    # result = self.library.query_animal_whose(text_number)
                    # self.text_edit.append(result)

    def quit(self):
        self.close()