
import sqlite3
from PyQt5 import QtWidgets, QtGui, QtCore
from PyQt5.QtWidgets import QDialog, QVBoxLayout, QLabel, QFontDialog
from PyQt5.QtGui import QFont
import sys
import time


class Describe():
    def __init__(self,number, type,special,color_of_earring,color_of_animal,whose,from_whom,price,phone_number,payment_method):
        """
        Hayvanları tanımlamak ve ilgili özelliklerini saklamak için kullanılan sınıf.

        Attributes:
            number (int): Hayvan numarası.
            type (str): Hayvanın türü (Kuzu, keçi, vb.).
            special (str): Hayvanın özel bir özelliği (Kuyruksuz, vb.).
            color_of_earring (str): Küpe rengi.
            color_of_animal (str): Hayvanın rengi.
            whose (str): Hayvanın sahibi.
            from_whom (str): Hayvanın alındığı kişi.
            price (float): Hayvanın fiyatı.
            phone_number (str): Sahibinin telefon numarası.
            payment_method (str): Ödeme yöntemi.
        """

        self.number = number
        self.type = type
        self.special = special
        self.color_of_earring = color_of_earring
        self.color_of_animal = color_of_animal
        self.whose = whose
        self.from_whom = from_whom
        self.price = price
        self.phone_number = phone_number
        self.payment_method = payment_method

        self.large = 2

    def __str__(self):
        changeable = "Hayvanın Numarası:                                                           {}\n" \
                     "Hayvanın CİNSİ(Kuzu,keçi,davar gibi):                            {}\n" \
                     "Hayvanın ÖZELLİĞİ(Kuyruksuz,kuyruklu...):                 {}\n" \
                     "Hayvanın KÜPE RENGi:                                                   {}\n" \
                     "Hayvanın RENGİ:                                                              {}\n" \
                     "Hayvan KİME AİT:                                                           {}\n" \
                     "Hayvan KİMDEN(Kadirden,Mehmetten gibi):                {}\n" \
                     "Hayvanın FİYATI(Lütfen sayıyla ve noktayla giriniz):     {}\n" \
                     "Hayvan sahibinin TELEFON NUMARASI:                     {}\n"\
                     "Nasıl ve Ne Kadar Ödendi:                                               {}\n".\
                                                                        format(self.number,self.type,self.special,
                                                                      self.color_of_earring,self.color_of_animal,
                                                                      self.whose,self.from_whom,self.price
                                                                      ,self.phone_number,self.payment_method)

        return changeable

class Library():

    def __init__(self):
        self.create_connect()

    def create_connect(self):
        '''This function allows to create data'''
        self.connect = sqlite3.connect("kütüphane.db")
        self.cursor = self.connect.cursor()

        query = "Create table If not exists kurbanlık_hesap (number TEXT,type TEXT,special TEXT,color_of_earring TEXT" \
                ",color_of_animal TEXT,whose TEXT,from_whom TEXT,price FLOAT,phone_number TEXT)"

        self.cursor.execute(query)
        # self.cursor.execute("ALTER TABLE kurbanlık_hesap ADD COLUMN payment_method TEXT")
        self.connect.commit()

    def interrupt_connection(self):
        '''This function allows to stop to process'''
        self.connect.close()

    def exhibit_customer(self):
        query = "SELECT * FROM kurbanlık_hesap"

        self.cursor.execute(query)

        accounts = self.cursor.fetchall()

        if len(accounts) == 0:
            return "Kaydedilen hiçbir veri yoktur."
        else:
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                # The upper line is allows to show smoothly to data
                result += str(account) + "\n"
            return result

################################

    def query_animal_number(self,number):
        '''This function allows querying number information in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE number=? "
        self.cursor.execute(query,(number,))    # this line allows to query to according to number

        accounts = self.cursor.fetchall()

        if len(accounts) == 0:
            return "Kaydedilen hiçbir veri yoktur."
        else:
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_whose(self,whose):
        '''This function allows querying whose information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(whose)=? COLLATE NOCASE"

        self.cursor.execute(query,(whose.lower(),))         # this line allows to query to according to whose

        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir müşteri bulunmuyor"
        else:
            result = ""
            for i in accounts:
                account = Describe(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_whose_and_number(self,whose,number):
        '''This function allows querying number and whose information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(whose)=? AND number = ? COLLATE NOCASE"

        self.cursor.execute(query,(whose.lower(),number,))     # this line allows to query to according to whose and number

        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir kişi ve numara bulunmuyor"
        else:
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_type(self,type):
        '''This function allows querying type information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(type)=? COLLATE NOCASE"

        self.cursor.execute(query,(type.lower(),))     # this line allows to query to according to type

        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir müşteri bulunmuyor"
        else:
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_phone_number(self,phone_number):
        '''This function allows querying phone_number information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(phone_number)=? COLLATE NOCASE"

        self.cursor.execute(query,(phone_number,))      # this line allows to query to according to phone_number
        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir müşteri bulunmuyor"
        else:
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

################################

    def add(self,customer):
        '''This funciton allows adding new data to the data'''
        query = "INSERT INTO kurbanlık_hesap VALUES(?,?,?,?,?,?,?,?,?,?)"

        new_phone_number = f"{customer.phone_number[:4]} {customer.phone_number[4:7]} {customer.phone_number[7:9]} " \
                           f"{customer.phone_number[9:]}"   # this line allows to save in data how ı want
        self.cursor.execute(query,(customer.number,customer.type,customer.special,customer.color_of_earring,
                                   customer.color_of_animal,
                                   customer.whose,customer.from_whom,customer.price,new_phone_number,customer.payment_method))
        self.connect.commit()     # this line allows to save in data

    def count_data(self):
        '''This function is count the data'''
        query = "SELECT * FROM kurbanlık_hesap"

        self.cursor.execute(query)

        accounts = self.cursor.fetchall()    # Makes us throw all the books in a tuple

        return len(accounts)

    def sum_price(self):
        '''This function is sum all prices in the data'''
        query = "SELECT * FROM kurbanlık_hesap"

        self.cursor.execute(query)
        accounts = self.cursor.fetchall()
        summ = 0
        for i in accounts:
            summ += float(i[7])
        return summ

################################

    def upgrade_data_number(self,number_to_update,new_number):
        '''This function is allows us to update number data'''
        update_query = "UPDATE kurbanlık_hesap SET number = ? WHERE number = ?"
        self.cursor.execute(update_query, (new_number, number_to_update))    # this line allows to update
        self.connect.commit()

    def upgrade_data_type(self, number_to_update, new_kind):
        '''This function is allows us to update type data'''
        try:
            update_query = "UPDATE kurbanlık_hesap SET type = ? WHERE number = ?"
            self.cursor.execute(update_query, (new_kind, number_to_update))    # this line allows to update new_kind
            self.connect.commit()
            print("Veriler başarıyla güncellendi.")
        except sqlite3.Error as e:
            self.connect.rollback()  # undo process
            print("Veri güncelleme hatası:", str(e))

    def upgrade_data_feature(self,number_to_update,new_special):
        '''This function is allows us to update special data'''
        try:
            update_query = "UPDATE kurbanlık_hesap SET speacial = ? WHERE number = ?"
            self.cursor.execute(update_query, (new_special, number_to_update))    # this line allows to update new_special
            self.connect.commit()
        except sqlite3.Error as e:
            self.connect.rollback()
            print("Veri güncelleme hatası:", str(e))

    def upgrade_data_color_of_earring(self,number_to_update,new_color_of_earring):
        '''This function is allows us to update color_of_earring data'''
        update_query = "UPDATE kurbanlık_hesap SET color_of_earring = ? WHERE number = ?"
        self.cursor.execute(update_query, (new_color_of_earring, number_to_update))     # this line allows to update new_color_of_earring
        self.connect.commit()

    def upgrade_data_color_of_animal(self,number_to_update,new_color_of_animal):
        '''This function is allows us to update color_of_animal data'''
        update_query = "UPDATE kurbanlık_hesap SET color_of_animal = ? WHERE number = ?"
        self.cursor.execute(update_query, (new_color_of_animal, number_to_update))    # this line allows to update new_color_of_animal
        self.connect.commit()

    def upgrade_data_whose(self,number_to_update,new_whose):
        '''This function is allows us to update whose data'''
        update_query = "UPDATE kurbanlık_hesap SET whose = ? WHERE number = ?"
        self.cursor.execute(update_query, (new_whose, number_to_update))       # this line allows to update new_whose
        self.connect.commit()

    def upgrade_data_from_whom(self,number_to_update,new_from_whom):
        '''This function is allows us to update from_whom data'''
        update_query = "UPDATE kurbanlık_hesap SET from_whom = ? WHERE number = ?"
        self.cursor.execute(update_query, (new_from_whom, number_to_update))    # this line allows to update new_from_whom
        self.connect.commit()

    def upgrade_data_price(self,number_to_update,new_price):
        '''This function is allows us to update price data'''
        update_query = "UPDATE kurbanlık_hesap SET price = ? WHERE number = ?"
        self.cursor.execute(update_query, (new_price, number_to_update))     # this line allows to update new_price
        self.connect.commit()

    def upgrade_data_phone_number(self,number_to_update,new_phone_number):
        '''This function is allows us to update phone_number data'''
        update_query = "UPDATE kurbanlık_hesap SET phone_number = ? WHERE number = ?"
        new_phone_number = f"{new_phone_number[:4]} {new_phone_number[4:7]} {new_phone_number[7:9]} {new_phone_number[9:]}"
        self.cursor.execute(update_query, (new_phone_number, number_to_update))    # this line allows to update new_phone_number
        self.connect.commit()

    def upgrade_data_payment_method(self,number_to_update,new_payment_method):
        '''This function is allows us to update payment_data data'''
        update_query = "UPDATE kurbanlık_hesap SET payment_method = ? WHERE number = ?"
        self.cursor.execute(update_query, (new_payment_method,number_to_update))    # this line allows to update new_payment_method
        self.connect.commit()


################################

library = Library()
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
        self.text_edit.clear()   # this line allows to clear previously process
        self.text_edit.append(result)



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




def main():
    app = QtWidgets.QApplication(sys.argv)
    window = LibraryApp()
    window.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()




































































