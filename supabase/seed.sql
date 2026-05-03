-- Test / ornek veri (payment_status, group_category, address, spray_paint_color dahil)
truncate table public."kurbanlık_hesap";

insert into public."kurbanlık_hesap" (
  number,
  type,
  special,
  color_of_earring,
  color_of_animal,
  whose,
  from_whom,
  price,
  agreed_total,
  phone_number,
  payment_method,
  payment_status,
  group_category,
  address,
  spray_paint_color
) values
  ('111111111111111111', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '   ', NULL, 'Belirsiz', '1.Gün Kesilecek Küçük Mallar', '', ''),
  ('12', 'kuzu', 'kuyruklu', 'sarı', 'siyah', 'mehmett şahin', 'kadirden', 12.345, 12.345, '0546 987 65 43', 'şuanlık belli değil', 'Belirsiz', '1.Gün Kesilecek Büyük Mallar', 'Yukarı Mah. Çiftlik Sk. No:3', 'Kırmızı'),
  ('134', 'öküz', 'kuyruksuz', 'siyah', 'siyah', 'dilek bademci', 'kadirden', 12.345, 12.345, '0543 054 56 78', 'çeyreği dilek şahin ibanına gitti gerisi sonra dükkana verilecek', 'Kısmi Ödeme', '2.Gün Kesilecek Küçük Mallar', 'Cumhuriyet Cad. No:12', 'Mavi'),
  ('14,15,16', 'kuzu,koyun,kuzu', 'hepsi beyaz', 'hepsi sarı', 'siyah', 'diloş', 'kadirden', 30, 30, '0657 478 39 59', 'dsjfsdf', 'Belirsiz', '2.Gün Kesilecek Büyük Mallar', 'Köy içi Yol üzeri', 'Sarı'),
  ('1788', 'sadasd', 'asdsad', 'adasd', 'asdasd', 'adads', 'asdasd', 1212, 1212, '2432   ', 'asdafsafa', 'Belirsiz', 'Pazardan Kendi Alacaklar', '', 'Turuncu'),
  ('2', 'kuzu', 'normal', 'siyah', 'siyah beyaz', 'mehmet şahin', 'mehmetten', 23.213, 23.213, '0543 567 89 09', '15 bini dilek şahin hesabında gerisi dükkana şu şu tarihte verilecek', 'Kısmi Ödeme', 'Köyden Kendi Alacaklar', 'Bahçeli Evler Sok.', 'Yeşil'),
  ('23', 'kuzu', 'kuyruksuz', 'sarı', 'siyah', 'Yusuf Bademci', 'mehmetten', 23.123, 23.123, '0765 765 87 67', NULL, 'Belirsiz', 'Çarşıya Dağıtılacaklar', 'Sanayi Sitesi 2. Blok', 'Beyaz'),
  ('3', 'koyun', 'normal', 'sarı', 'beyaz', 'sena', 'kadirden', 23.456, 23.456, '0567 890 34 23', '20 bin ödendi geri kalan 3 bin ise 2024 kurban bayramında ödenecek', 'Kısmi Ödeme', 'Köye Dağıtılacaklar', 'Yeni Mahalle 45', 'Kırmızı'),
  ('33', 'dgsdg', 'sgdsdg', 'sdgsdg', 'sgs', 'sgsg', 'sgs', 2143213, 2143213, '1232 13  ', 'sdgsdg', 'Belirsiz', 'Kesilip Dükkana Gönderilecekler', '', ''),
  ('4', 'kuzu', 'yağsız', 'sarı', 'siyah', 'ahmet ali', 'kadirden', 12.345, 12.345, '0564 567 89 09', NULL, 'Belirsiz', '1.Gün Kesilecek Küçük Mallar', 'Atatürk Bulvarı No:7', 'Mavi'),
  ('46', 'emrah', 'sdfsdf', 'sdfsd', 'sdfsdf', 'sdfsdf', 'sdfsd', 2154325, 2154325, '1242 3d  ', 'dsgsgsdg', 'Belirsiz', '1.Gün Kesilecek Büyük Mallar', 'Test Sokak', 'Sarı'),
  ('5', 'inek', '3 yaşında', 'sarı', 'siyah', 'sefa', 'mehmetten', 34.567, 34.567, '0545 678 93 24', 'yarısı ödendi yarısı sonra ödenecek', 'Kısmi Ödeme', '2.Gün Kesilecek Küçük Mallar', 'Hürriyet Cad. Dükkan:4', 'Yeşil'),
  ('6', 'koyun', 'kuyruksuz', 'pembe', 'beyaz', 'furkan bademci', 'mehmetten', 13.567, 13.567, '0324 789 56 45', '10 bin alındı geriye kalan dükkana şu şu tarihte getirilecek', 'Kısmi Ödeme', '2.Gün Kesilecek Büyük Mallar', 'Kırsal Mah. Ahır Yanı', 'Kırmızı'),
  ('7', 'öküz', '4 yaşında', 'beyaz', 'gri', 'Dilek Bademci', 'mehmetten', 123.456, 123.456, '0768 345 67 89', '20 bin ödendi geri kalanı 12.11.2023 tarihinde ödenecek denildi', 'Kısmi Ödeme', 'Pazardan Kendi Alacaklar', 'İstasyon Meydanı', 'Beyaz'),
  ('78888', 'asdasd', 'sdasd', 'asdasd', 'asdasd', 'asdasd', 'asdasd', 1212.212, 1212.212, '0532 366 33 33', 'fdsfdsf', 'Belirsiz', 'Köyden Kendi Alacaklar', '', 'Turuncu'),
  ('8', 'kuzu', 'yağlı', 'sarı', 'beyaz', 'leyla abla', 'kadirden', 34.546, 34.546, '0567 456 78 90', 'evet ödememizin tamamını aldık', 'Ödendi', 'Çarşıya Dağıtılacaklar', 'Çarşı Arkası Sok. No:1', 'Mavi');
