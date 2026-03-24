
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
        # label_width = 100
        #
        # entries = [
        #     ("Hayvanın Numarası:",           self.number),
        #     ("Hayvanın CİNSİ(Kuzu,keçi,davar gibi):", self.type),
        #     ("Hayvanın ÖZELLİĞİ(Kuyruksuz,kuyruklu…):", self.special),
        #     ("Hayvanın KÜPE RENGİ:",         self.color_of_earring),
        #     ("Hayvanın RENGİ:",              self.color_of_animal),
        #     ("Hayvan KİME AİT:",             self.whose),
        #     ("Hayvan KİMDEN(Kadirden,Mehmetten gibi):", self.from_whom),
        #     ("Hayvanın FİYATI(Lütfen sayıyla ve noktayla giriniz):", self.price),
        #     ("Hayvan sahibinin TELEFON NUMARASI:", self.phone_number),
        #     ("Nasıl ve Ne Kadar Ödendi:",     self.payment_method),
        # ]
        #
        # # Her etiket label_width kadar sola yaslanır, ardından değer gelir
        # lines = [f"{label.ljust(label_width)} {value}" for label, value in entries]
        # return "\n".join(lines)



        changeable = "Hayvanın Numarası:                                                                    {}\n" \
                     "Hayvanın CİNSİ(Kuzu,keçi,davar gibi):                                {}\n" \
                     "Hayvanın ÖZELLİĞİ(Kuyruksuz,kuyruklu...):                     {}\n" \
                     "Hayvanın KÜPE RENGi:                                                               {}\n" \
                     "Hayvanın RENGİ:                                                                           {}\n" \
                     "Hayvan KİME AİT:                                                                          {}\n" \
                     "Hayvan KİMDEN(Kadirden,Mehmetten gibi):                   {}\n" \
                     "Hayvanın FİYATI(Lütfen sayıyla ve noktayla giriniz):     {}\n" \
                     "Hayvan sahibinin TELEFON NUMARASI:                             {}\n"\
                     "Nasıl ve Ne Kadar Ödendi:                                                        {}\n".\
                                                                        format(self.number,self.type,self.special,
                                                                      self.color_of_earring,self.color_of_animal,
                                                                      self.whose,self.from_whom,self.price
                                                                      ,self.phone_number,self.payment_method)

        return changeable


