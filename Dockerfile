FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html iletisim.html /usr/share/nginx/html/
COPY urunler /usr/share/nginx/html/urunler
COPY en /usr/share/nginx/html/en
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
# Yalnızca sitede kullanılan görseller; ham ekran görüntüsü klasörleri (ascore/, aday-crm/, univerp-*/) imaja girmez
COPY assets/img/logos /usr/share/nginx/html/assets/img/logos
COPY assets/img/products /usr/share/nginx/html/assets/img/products
# Kaynak dosyaların izinleri ne olursa olsun nginx okuyabilsin
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
