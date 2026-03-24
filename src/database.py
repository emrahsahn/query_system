import sqlite3
from src.models import Describe
from backbone import DATA_DIR, DATABASE_DIR

class Library():

    def __init__(self):
        self.create_connect()

    def create_connect(self):
        '''This function allows to create data'''
        self.connect = sqlite3.connect(database=DATABASE_DIR)
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
            # result = ""
            # for i in accounts:
            #     account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
            #     # The upper line is allows to show smoothly to data
            #     result += str(account) + "\n"
            return [Describe(*account) for account in accounts]

################################
#    SORGULAMA ALANLARI
################################

    def query_animal_number(self,number, return_objects=False):
        '''This function allows querying number information in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE number=? "
        self.cursor.execute(query,(number,))    # this line allows to query to according to number

        accounts = self.cursor.fetchall()

        if len(accounts) == 0:
            return "Böyle bir müşteri bulunmuyor"
        else:
            if return_objects:
                return [Describe(*i) for i in accounts]
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_whose(self,whose, return_objects=False):
        '''This function allows querying whose information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(whose)=? COLLATE NOCASE"

        self.cursor.execute(query,(whose.lower(),))         # this line allows to query to according to whose

        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir müşteri bulunmuyor"
        else:
            if return_objects:
                return [Describe(*i) for i in accounts]
            result = ""
            for i in accounts:
                account = Describe(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_whose_and_number(self,whose,number, return_objects=False):
        '''This function allows querying number and whose information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(whose)=? AND number = ? COLLATE NOCASE"

        self.cursor.execute(query,(whose.lower(),number,))     # this line allows to query to according to whose and number

        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir kişi ve numara bulunmuyor"
        else:
            if return_objects:
                return [Describe(*i) for i in accounts]
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_type(self,type, return_objects=False):
        '''This function allows querying type information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(type)=? COLLATE NOCASE"

        self.cursor.execute(query,(type.lower(),))     # this line allows to query to according to type

        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir müşteri bulunmuyor"
        else:
            if return_objects:
                return [Describe(*i) for i in accounts]
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

    def query_animal_phone_number(self,phone_number, return_objects=False):
        '''This function allows querying phone_number information of animals in data'''
        query = "SELECT * FROM kurbanlık_hesap WHERE LOWER(phone_number)=? COLLATE NOCASE"

        self.cursor.execute(query,(phone_number,))      # this line allows to query to according to phone_number
        accounts = self.cursor.fetchall()

        if(len(accounts) == 0):
            return "Böyle bir müşteri bulunmuyor"
        else:
            if return_objects:
                return [Describe(*i) for i in accounts]
            result = ""
            for i in accounts:
                account = Describe(i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8],i[9])
                result += str(account) + "\n"
            return result

################################
#       EKLEME ALANLARI
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
            # Geçmişteki hatalı kayıtlardan (boş veya harf içeren fiyatlar) dolayı çökmemesi için
            try:
                price_str = str(i[7]).replace(',', '.')
                summ += float(price_str)
            except (ValueError, TypeError):
                continue
        return summ

################################
#      GÜNCELLEME ALANLARI
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
#       SİLME ALANLARI
################################


    def delete_data_from_ID(self, personelID):
        delete_query = "DELETE FROM kurbanlık_hesap WHERE number = ?"
        self.cursor.execute(delete_query, (personelID,))
        self.connect.commit()


################################
#   Bütün (ALL) İşlemleri ALANLARI
################################



    def get_select_all_from_ID(self):
        select_query = "SELECT * FROM kurbanlık_hesap"
        self.cursor.execute(select_query)
        return self.cursor.fetchall()









