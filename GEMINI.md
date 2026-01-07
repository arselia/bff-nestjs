# Kontrak Kerja Proyek

Berikut adalah aturan dan prinsip yang akan kita pegang selama pengerjaan proyek ini:

1.  **Tidak Ada Asumsi**: Saya tidak akan membuat asumsi. Jika ada sesuatu yang tidak jelas atau ambigu, saya akan selalu bertanya kepada Anda untuk klarifikasi.
2.  **Konsistensi dan Kebersihan Kode**: Saya akan selalu mengikuti gaya dan pola koding yang sudah ada di dalam proyek. Kode yang tidak perlu atau redundan akan langsung dihapus untuk menjaga kebersihan.
3.  **Solusi Praktis**: Saya akan selalu mengutamakan solusi yang paling praktis, relevan, dan efisien untuk menyelesaikan masalah yang ada.
4.  **Pencatatan Perubahan (Logging)**: Setiap perubahan akan dicatat di bagian bawah file `logsementara.md`.

---

# Penjelasan Proyek E-Commerce Microservices dengan BFF

## Judul Tugas Akhir
Implementasi Arsitektur Microservices Backend-For-Frontend pada Sistem E-Commerce Menggunakan NestJS.

## Abstrak & Tujuan
Proyek ini bertujuan untuk membangun backend sistem e-commerce dengan mengimplementasikan arsitektur *Microservices* dan pola *Backend-For-Frontend* (BFF). Tujuannya adalah untuk menciptakan sistem yang modular, skalabel, dan mampu menyesuaikan data yang dikirim ke berbagai jenis klien (misalnya, web dan mobile) secara efisien.

## Teknologi Utama
- **Framework:** NestJS
- **Database:** MongoDB
- **Arsitektur:** Microservices & Backend-For-Frontend (BFF)

## Alur Arsitektur
Alur permintaan data dari pengguna adalah sebagai berikut:
`Client (Frontend)` -> `API Gateway` -> `BFF (Backend-for-Frontend)` -> `Microservices`

- **Client**: Aplikasi yang digunakan oleh pengguna (misal: browser web, aplikasi mobile).
- **API Gateway (Port 8000)**: Pintu gerbang utama yang menerima semua permintaan dari client dan meneruskannya ke layanan yang sesuai.
- **BFF (Backend-for-Frontend)**: Layanan khusus yang bertindak sebagai perantara antara frontend dan microservices di belakangnya. BFF ini akan mengumpulkan data dari berbagai microservice dan menyusunnya menjadi format yang paling sesuai untuk kebutuhan spesifik client.
- **Microservices**: Kumpulan layanan independen yang menangani logika bisnis spesifik.

## Struktur Layanan (Setelah Refactoring)
Untuk mengurangi duplikasi kode dan meningkatkan efisiensi, beberapa layanan awal digabungkan menjadi layanan yang lebih terfokus:

1.  **API Gateway (`http://localhost:8000`)**
    *   **Fungsi**: Menerima dan merutekan semua permintaan masuk.

2.  **User Service (`http://localhost:8001`)**
    *   **Fungsi**: Mengelola semua data dan otentikasi pengguna (Admin dan User biasa).
    *   **Catatan**: Layanan ini bertanggung jawab untuk generate dan validasi token JWT.

3.  **Order Service (`http://localhost:8002`)**
    *   **Fungsi**: Menggabungkan fungsionalitas dari tiga layanan awal.
        *   **Manajemen Pesanan (Order)**: Mengelola produk yang sudah dibeli dan terhubung dengan layanan pembayaran.
        *   **Manajemen Keranjang (Cart)**: Mengelola produk yang akan dibeli oleh pengguna.
        *   **Manajemen Wishlist**: Mengelola produk yang disimpan oleh pengguna.

4.  **Product Service (`http://localhost:8003`)**
    *   **Fungsi**: Menggabungkan fungsionalitas terkait produk.
        *   **Manajemen Produk**: Mengelola data inti produk yang dijual.
        *   **Manajemen Kategori**: Mengelola kategori untuk setiap produk.
        *   **Manajemen Review & Rating**: Mengelola ulasan dan peringkat yang diberikan pengguna untuk produk.
    *   **Catatan**: Meskipun digabung, data untuk produk, kategori, dan review disimpan dalam tabel/collection yang berbeda di MongoDB.

5.  **Payment Service (`http://localhost:8004`)**
    *   **Fungsi**: Mengelola proses pembayaran.
    *   **Catatan**: Saat ini menggunakan implementasi dummy dan dirancang untuk dapat diintegrasikan dengan API pembayaran pihak ketiga di masa depan.

## Strategi Otentikasi
Otentikasi menggunakan **JSON Web Token (JWT)**. Token di-generate oleh `User Service` saat pengguna berhasil login. Untuk mengakses *endpoint* yang terproteksi pada layanan lain, client harus menyertakan token ini di *header* permintaan. API Gateway atau layanan terkait akan memvalidasi token ini sebelum memproses permintaan.

## File Pendukung
- **`CARA-MENJALANKAN.md`**: Berisi panduan langkah demi langkah untuk menjalankan setiap layanan di lingkungan pengembangan lokal.
- **`postman-collection.json`**: Koleksi API untuk Postman yang berisi contoh permintaan untuk setiap *endpoint*, memudahkan proses pengujian.
- **`user-service/ListAPI.txt`**: Daftar lengkap semua endpoint API yang ditemukan di setiap layanan, termasuk metode, jalur, dan deskripsi singkat.

## Daftar API Lengkap
Daftar lengkap semua endpoint API yang ditemukan di setiap layanan telah dikompilasi dan disimpan di `user-service/ListAPI.txt`. File ini mencakup metode, jalur, dan deskripsi singkat untuk setiap endpoint, memberikan gambaran menyeluruh tentang semua API yang tersedia di seluruh arsitektur microservices.

## Konfigurasi Lingkungan
Setiap layanan memiliki file `.env` sendiri. File ini digunakan untuk menyimpan variabel lingkungan yang sensitif atau spesifik untuk setiap layanan (seperti koneksi database, port, dan kunci rahasia) agar tidak terekspos secara langsung di dalam kode.

---

# Analisis & Verifikasi Struktur Proyek (Otomatis)

Bagian ini berisi analisis otomatis dari struktur proyek saat ini, membandingkannya dengan deskripsi di atas dan mendokumentasikan semua *controller*, *service*, dan struktur data yang ada.

## Ringkasan Perbedaan & Potensi Masalah

*   **Inkonsistensi Kritis di `product-service`**: **RESOLVED**. Modul `products` dan `product-review` telah digabungkan dan distandarisasi.
*   **`bff-web` Tidak Sinkron**: **RESOLVED**. Layanan `bff-web` kini telah disinkronkan, URL layanan telah diperbarui, dan fitur ulasan produk telah diimplementasikan.
*   **`bff-mobile` Tidak Sinkron**: **RESOLVED**. Layanan `bff-mobile` telah diperiksa dan fungsionalitasnya sebagian besar telah diimplementasikan.
*   **Penggunaan `any` pada DTO**: Beberapa *controller* menerima DTO dengan tipe `any` (`@Body() createDto: any`), yang menghilangkan keuntungan validasi dan keamanan tipe data dari NestJS. Sebaiknya diganti dengan kelas DTO yang spesifik.
*   **Konfigurasi `api-gateway`**: **RESOLVED**. Masalah konfigurasi port, pencarian variabel lingkungan, parsing URL, dan penanganan header di API Gateway telah diselesaikan.

---

## Detail Implementasi per Layanan

### 1. `api-gateway`
*   **Controllers**:
    *   `ProxyController`: Menangani semua rute (`/api/:service/*path`) dan meneruskannya ke layanan mikro yang sesuai.
        *   `@All(':service/*path') proxy(...)`
*   **Services**:
    *   `ProxyService`: Logika untuk meneruskan permintaan (GET, POST, PUT, DELETE, PATCH) ke URL layanan yang diambil dari konfigurasi (`.env`).

### 2. `bff-web`
*   **Status:** **SELESAI** (URL layanan telah diperbarui ke port yang benar dan fitur ulasan produk telah diimplementasikan.)
*   **Controllers**:
    *   `BffController`: Menyediakan endpoint agregasi.
        *   `@Get('dashboard/:userId') getDashboard(...)`: Mengambil data dashboard untuk user tertentu.
        *   `@Post('products/:productId/reviews') createReview(...)`: Membuat ulasan produk dengan validasi pembelian.
        *   `@Get('account/my-reviews') getMyReviews(...)`: Mendapatkan semua ulasan yang dibuat oleh pengguna yang sedang login.
*   **Services**:
    *   `BffService`: Mengambil data dari berbagai layanan (user, order, wishlist, product, payment) dan menggabungkannya. URL layanan telah diperbarui ke port yang benar (8001, 8003, 8002, 8004).
*   **DTOs/Schemas**: Tidak ada.

### 3. `user-service`
*   **Controllers**:
    *   `UsersController` (`/users`):
        *   `@Post('register') register(...)`: Registrasi pengguna baru.
        *   `@Post('login') login(...)`: Login pengguna dan generate JWT.
        *   `@Post('forgot-password') forgotPassword(...)`: Memulai proses reset password.
        *   `@Post('reset-password/:token') resetPassword(...)`: Menyelesaikan proses reset password.
        *   `@Put('profile/update') updateProfile(...)`: Memperbarui profil pengguna yang sedang login.
        *   `@Get('profile') getProfile(...)`: Mendapatkan detail profil pengguna yang sedang login.
        *   `@Get('profile/addresses') getAddresses(...)`: Mendapatkan semua alamat pengguna yang sedang login.
        *   `@Post('profile/addresses') addAddress(...)`: Menambahkan alamat baru untuk pengguna yang sedang login.
        *   `@Put('profile/addresses/:addressId') updateAddress(...)`: Memperbarui alamat tertentu untuk pengguna yang sedang login.
        *   `@Delete('profile/addresses/:addressId') removeAddress(...)`: Menghapus alamat tertentu untuk pengguna yang sedang login.
        *   `@Put('profile/addresses/:addressId/default') setDefaultAddress(...)`: Menjadikan alamat tertentu sebagai alamat default untuk pengguna yang sedang login.
        *   `@Delete('profile') deleteProfile(...)`: Menghapus akun pengguna yang sedang login.
        *   `@Get('/all') findAll(...)`: Mendapatkan semua pengguna. **(Admin Only)**
        *   `@Get(':id') findById(...)`: Mendapatkan pengguna berdasarkan ID. **(Admin Only)**
        *   `@Put(':id') update(...)`: Memperbarui pengguna berdasarkan ID. **(Admin Only)**
        *   `@Delete(':id') delete(...)`: Menghapus pengguna berdasarkan ID. **(Admin Only)**
*   **Services**:
    *   `UsersService`: Mengelola logika untuk registrasi, login (membuat JWT), update, delete, dan pencarian pengguna. Menggunakan `bcrypt` untuk hashing password. Menambahkan metode untuk manajemen alamat (`addAddress`, `updateAddress`, `removeAddress`, `setDefaultAddress`) dan reset password (`forgotPassword`, `resetPassword`).
*   **DTOs**:
    *   `CreateUserDto`: `{ username, fullname?, email, password, phoneNumber? }`
    *   `UpdateUserDto`: `{ username?, fullname?, phoneNumber?, oldPassword?, newPassword?, role? }`
    *   `LoginDto`: `{ email, password }`
    *   `UserResponseDto`: `{ id, username, fullname, email, phoneNumber?, addresses? }` (Sekarang termasuk `addresses` array)
    *   `CreateAddressDto`: `{ label, recipientName, phoneNumber, street, city, province, postalCode, isDefault? }`
    *   `UpdateAddressDto`: `{ label?, recipientName?, phoneNumber?, street?, city?, province?, postalCode?, isDefault? }`
    *   `AddressResponseDto`: `{ _id, label, recipientName, phoneNumber, street, city, province, postalCode, isDefault }`
    *   `ForgotPasswordDto`: `{ email }`
    *   `ResetPasswordDto`: `{ password }`
*   **Schemas**:
    *   `UserSchema`: `{ username, fullname, email, password, phoneNumber, role, loginAttempts, addresses, resetPasswordToken, resetPasswordExpires }` (Diperbarui dengan `addresses` array, `resetPasswordToken`, `resetPasswordExpires`, dan `select: false` pada `password` dan `loginAttempts`).
    *   `AddressSchema`: Sub-dokumen di dalam `UserSchema`.
*   **Catatan Penting**:
    *   **Otentikasi & Otorisasi**: `JwtAuthGuard` sudah terintegrasi dengan logika pengecekan peran (`@Roles('admin')`). Ini berarti endpoint yang ditandai dengan `@Roles('admin')` secara otomatis hanya bisa diakses oleh pengguna dengan peran 'admin' dan token JWT yang valid.

### 4. `order-service`
*   **Status:** **SELESAI** (Semua fitur dan perbaikan telah diimplementasikan.)
*   **Fungsi Utama**: Mengelola semua data terkait keranjang belanja, daftar keinginan, dan pesanan.
*   **Controllers**:
    *   `CartController` (`/carts`):
        *   `POST /carts`: Menambahkan produk ke keranjang. Jika produk sudah ada, kuantitasnya akan ditambahkan.
        *   `GET /carts`: Mendapatkan semua item di dalam keranjang milik pengguna yang sedang login.
        *   `GET /carts/:id`: Mendapatkan satu item keranjang spesifik berdasarkan ID item.
        *   `PUT /carts/:id`: Memperbarui kuantitas satu item di dalam keranjang.
        *   `DELETE /carts/:id`: Menghapus satu item dari keranjang.
    *   `OrderController` (`/orders`):
        *   `POST /orders`: Membuat pesanan baru dari semua item yang ada di keranjang pengguna.
        *   `GET /orders/my-orders`: Mendapatkan riwayat semua pesanan yang pernah dibuat oleh pengguna yang sedang login.
        *   `GET /orders/:id`: Mendapatkan detail satu pesanan spesifik berdasarkan ID pesanan.
        *   `PUT /orders/:id/status`: Memperbarui status pesanan (misal: dari `processing` menjadi `shipped`). **(Admin Only)**
        *   `PUT /orders/:id/confirm-payment`: Mengonfirmasi pembayaran untuk sebuah pesanan (biasanya dipanggil oleh `payment-service`). Status berubah dari `pending` menjadi `processing`.
        *   `PUT /orders/:id/cancel`: Membatalkan pesanan yang dibuat oleh pengguna. Stok produk akan dikembalikan.
        *   `DELETE /orders/:id`: Menghapus data pesanan dari database. **(Admin Only)**
    *   `WishlistController` (`/wishlists`):
        *   `POST /wishlists`: Menambahkan sebuah produk ke dalam daftar keinginan (wishlist).
        *   `GET /wishlists`: Mendapatkan semua item di dalam wishlist milik pengguna yang sedang login.
        *   `GET /wishlists/:id`: Mendapatkan satu item wishlist spesifik berdasarkan ID item.
        *   `DELETE /wishlists/:id`: Menghapus satu item dari wishlist.
*   **Services**:
    *   `CartService`: Mengelola logika CRUD untuk `Cart`, termasuk penggabungan item, penguncian harga, dan validasi stok.
    *   `OrderService`: Mengelola logika CRUD untuk `Order`, termasuk pembuatan pesanan dari keranjang, snapshot data produk dan alamat, pembuatan nomor pesanan, dan manajemen status.
    *   `WishlistService`: Mengelola logika CRUD untuk `Wishlist`, termasuk validasi produk dan proteksi duplikasi.
*   **DTOs**:
    *   `CreateCartItemDto`: `{ productId, quantity }`
    *   `UpdateCartItemDto`: `{ quantity }`
    *   `CartResponseDto`: `{ id, userId, productId, quantity, price }`
    *   `CreateOrderDto`: `{ shippingAddressId? }`
    *   `OrderResponseDto`: `{ id, orderNumber, userId, items, totalAmount, status, paymentId?, shippingAddress }`
    *   `CreateWishlistItemDto`: `{ productId }`
    *   `WishlistResponseDto`: `{ id, userId, productId }`
*   **Schemas**:
    *   `CartSchema`: `{ userId, productId, quantity, price }`
        *   **Virtuals**: `id` (dari `_id`).
    *   `OrderSchema`: `{ orderNumber, userId, items: [{ productId, productName, productImageUrl, quantity, price }], totalAmount, status, paymentId?, shippingAddress }`
        *   **Virtuals**: `id` (dari `_id`).
    *   `WishlistSchema`: `{ userId, productId }`
        *   **Virtuals**: `id` (dari `_id`).
*   **Catatan Penting**:
    *   **Keamanan**: Semua endpoint yang memerlukan otentikasi/otorisasi dilindungi oleh `JwtAuthGuard` dan `RolesGuard`.
    *   **Serialisasi Respons**: `MongooseClassSerializerInterceptor` diaktifkan pada controller untuk memastikan semua respons API diformat secara bersih sesuai dengan DTO, menyembunyikan field internal Mongoose (`_id`, `__v`) dan menampilkan *virtual properties* (`id`).
    *   **Keranjang (Cart)**:
        *   **Penguncian Harga**: Harga produk disimpan di keranjang saat ditambahkan, memastikan harga tidak berubah jika harga produk asli diubah.
        *   **Penggabungan Item Otomatis**: Jika produk yang sama ditambahkan, kuantitasnya akan diperbarui secara otomatis.
        *   **Validasi Stok**: Stok produk divalidasi saat menambah atau memperbarui item keranjang.
    *   **Pesanan (Order)**:
        *   **Alur Checkout Penuh**: Pesanan dibuat dari semua item di keranjang pengguna.
        *   **Snapshot Data**: Detail produk (`productName`, `productImageUrl`, `price`) dan alamat pengiriman (`shippingAddress`) disimpan sebagai snapshot dalam dokumen pesanan, memastikan integritas data historis.
        *   **Nomor Pesanan Unik**: Setiap pesanan memiliki `orderNumber` yang unik dan mudah dibaca (`ORD-YYYYMMDD-XXXX`).
        *   **Pengosongan Keranjang Otomatis**: Keranjang pengguna dikosongkan setelah pesanan berhasil dibuat.
        *   **Pembaruan Stok Atomik**: Stok produk diperbarui secara atomik saat pesanan dibuat atau dibatalkan.
    *   **Wishlist**:
        *   **Output API Standar**: Menggunakan `WishlistResponseDto` untuk output API yang konsisten.
        *   **Validasi Produk**: Memastikan produk yang ditambahkan ke wishlist adalah valid.

### 5. `product-service`
*   **Status:** **SELESAI** (Semua inkonsistensi dan bug telah diperbaiki, modul digabungkan, dan fungsionalitas distandarisasi.)
*   **Fungsi Utama**: Mengelola semua data terkait produk, kategori, dan ulasan/rating.
*   **Controllers**:
    *   `ProductsController` (`/products`):
        *   `GET /products`: Mendapatkan semua produk.
        *   `GET /products/:id`: Mendapatkan produk berdasarkan ID.
        *   `POST /products`: Membuat produk baru. **(Hanya Admin)**
        *   `PUT /products/:id`: Memperbarui produk berdasarkan ID. **(Hanya Admin)**
        *   `DELETE /products/:id`: Menghapus produk berdasarkan ID. **(Hanya Admin)**
        *   `PUT /products/:id/stock`: Memperbarui stok produk secara atomik. **(Hanya Admin)**
        *   `GET /products/:productId/reviews`: Mendapatkan semua ulasan untuk produk tertentu.
        *   `POST /products/:productId/reviews`: Membuat ulasan baru untuk produk. **(Memerlukan token)**
        *   `GET /products/reviews/me`: Mendapatkan semua ulasan yang dibuat oleh pengguna yang sedang login. **(Memerlukan token)**
        *   `GET /products/reviews/:id`: Mendapatkan ulasan berdasarkan ID.
                    *   `DELETE /products/reviews/:id`: Menghapus ulasan berdasarkan ID. **(Pemilik ulasan atau Admin)**
                *   `CategoryController` (`/categories`):
                    *   `GET /categories`: Mendapatkan semua kategori.
                    *   `GET /categories/:id`: Mendapatkan kategori berdasarkan ID.
                    *   `GET /categories/:categoryId/products`: Mendapatkan semua produk aktif dalam kategori tertentu.
                    *   `POST /categories`: Membuat kategori baru. **(Hanya Admin)**
                    *   `PUT /categories/:id`: Memperbarui detail kategori. **(Hanya Admin)**
                    *   `DELETE /categories/:id`: Menghapus kategori (hanya jika tidak ada produk yang menggunakannya). **(Hanya Admin)***   **Services**:
    *   `ProductsService`: Mengelola logika CRUD untuk produk, termasuk validasi kategori, penanganan gambar, dan update stok atomik.
    *   `CategoryService`: Mengelola logika CRUD untuk kategori, termasuk validasi duplikasi nama.
    *   `ReviewService`: Mengelola logika CRUD untuk ulasan, termasuk validasi keberadaan produk dan otorisasi penghapusan.
*   **DTOs**:
    *   `CreateProductDto`: `{ name, price, stock, description?, categoryId, imageUrl? }`
    *   `UpdateProductDto`: `{ name?, price?, stock?, description? }`
    *   `ProductResponseDto`: `{ id, name, description, price, stock, categoryName, imageUrl }`
    *   `UpdateStockDto`: `{ quantity: number, type: 'increase' | 'decrease' }`
    *   `CreateCategoryDto`: `{ name, description? }`
    *   `UpdateCategoryDto`: `{ name?, description? }`
    *   `CategoryResponseDto`: `{ id, name, description }`
    *   `CreateReviewDto`: `{ rating, comment }` (productId diambil dari URL, userId dari token)
    *   `ReviewResponseDto`: `{ id, productId, userId, rating, comment }`
*   **Schemas**:
    *   `ProductSchema`: `{ name, description, price, stock, categoryId, images }`
        *   **Virtuals**: `id` (dari `_id`), `category` (nama kategori dari `categoryId` yang terpopulasi), `imageUrl` (gambar pertama dari `images`).
    *   `CategorySchema`: `{ name, description }`
        *   **Virtuals**: `id` (dari `_id`).
    *   `ReviewSchema`: `{ productId, userId, rating, comment }`
        *   **Virtuals**: `id` (dari `_id`), `product` (ID produk dari `productId`).
*   **Catatan Penting**:
    *   **Keamanan**: Semua endpoint yang memerlukan otentikasi/otorisasi dilindungi oleh `JwtAuthGuard` dan `RolesGuard`.
    *   **Serialisasi Respons**: `MongooseClassSerializerInterceptor` diaktifkan pada controller untuk memastikan semua respons API diformat secara bersih sesuai dengan DTO, menyembunyikan field internal Mongoose (`_id`, `__v`) dan menampilkan *virtual properties* (`id`).
    *   **Penanganan Gambar**: `imageUrl` di `CreateProductDto` secara otomatis dipetakan ke array `images` di skema.
    *   **Validasi Kategori**: Penamaan kategori unik dijamin saat pembuatan dan pembaruan.
    *   **Update Stok Atomik**: Metode `updateStock` menggunakan operasi atomik MongoDB untuk mencegah *race condition* dan memastikan integritas stok.
    *   **Validasi Review**: Memastikan produk yang diulas benar-benar ada.
    *   **Otorisasi Review**: Hanya pemilik ulasan atau Admin yang dapat menghapus ulasan.

### 6. `payment-service`
*   **Status:** **SELESAI** (Semua fitur dan perbaikan telah diimplementasikan.)
*   **Fungsi Utama**: Mengelola semua data terkait pembayaran.
*   **Controllers**:
    *   `PaymentController` (`/payments`):
        *   `@Post() create(...)`: Membuat pembayaran baru untuk pesanan pengguna.
        *   `@Get('all') findAll(...)`: Mendapatkan semua pembayaran. **(Admin Only)**
        *   `@Get('me') findMyPayments(...)`: Mendapatkan semua pembayaran milik pengguna yang sedang login.
        *   `@Get(':id') findOne(...)`: Mendapatkan detail pembayaran berdasarkan ID. **(Pemilik pembayaran atau Admin)**
        *   `@Put(':id/status') updateStatus(...)`: Memperbarui status pembayaran. **(Admin Only)**
*   **Services**:
    *   `PaymentService`: Mengelola logika CRUD untuk `Payment`, termasuk validasi pesanan, pembuatan pembayaran, dan manajemen status.
*   **DTOs**:
    *   `CreatePaymentDto`: `{ orderId, method }`
    *   `PaymentResponseDto`: `{ id, orderId, userId, status, method }`
    *   `UpdatePaymentStatusDto`: `{ status }`
*   **Schemas**:
    *   `PaymentSchema`: `{ orderId, userId, method, status }`
        *   **Virtuals**: `id` (dari `_id`).
*   **Catatan Penting**:
    *   **Keamanan**: Semua endpoint yang memerlukan otentikasi/otorisasi dilindungi oleh `JwtAuthGuard` dan `RolesGuard`.
    *   **Serialisasi Respons**: `MongooseClassSerializerInterceptor` diaktifkan pada controller untuk memastikan semua respons API diformat secara bersih sesuai dengan DTO, menyembunyikan field internal Mongoose (`_id`, `__v`) dan menampilkan *virtual properties* (`id`).
    *   **Validasi Enum**: Properti `method` dan `status` menggunakan `enum` untuk memastikan hanya nilai yang valid yang dapat disimpan.
    *   **Komunikasi Antar-Service**: `PaymentService` berkomunikasi dengan `OrderService` untuk memvalidasi pesanan dan mengkonfirmasi pembayaran.

---

# Catatan Tambahan: Pola Otentikasi di Arsitektur Microservices

Bagian ini menjelaskan beberapa pendekatan umum untuk menangani otentikasi (JWT) dalam arsitektur microservices seperti proyek ini.

### Endpoint Publik vs. Privat

Tidak semua endpoint membutuhkan token. Akses ditentukan oleh logika bisnis:
- **Endpoint Publik**: Untuk aksi anonim, tidak memerlukan token. Contoh: `GET /products`, `POST /users/register`, `POST /users/login`.
- **Endpoint Privat**: Untuk aksi yang terikat pada akun pengguna, **wajib** memerlukan token. Contoh: `POST /orders`, `GET /users/profile`.

### Pola Penanganan Token

Ada beberapa cara di mana token yang dikirim oleh client dapat divalidasi dalam arsitektur `Gateway -> BFF -> Service`.

**Pola 1: Validasi di Setiap Service (Pola Saat Ini)**
- **Alur**: Gateway dan BFF hanya meneruskan request. Setiap microservice (`user-service`, `order-service`, dll.) yang memiliki endpoint privat bertanggung jawab untuk memvalidasi token itu sendiri.
- **Implementasi**: Setiap service yang butuh proteksi harus memiliki `JwtAuthGuard` dan dependensi `@nestjs/jwt`.
- **Kelebihan**: Service bersifat mandiri (*self-contained*).
- **Kekurangan**: Duplikasi logika otentikasi, validasi token bisa terjadi berulang kali.

**Pola 2: Validasi Terpusat di BFF**
- **Alur**: Gateway meneruskan request ke BFF. **BFF memvalidasi token.** Jika valid, BFF memanggil service-service di belakangnya. Panggilan dari BFF ke microservice lain terjadi di jaringan internal yang aman dan tidak lagi memerlukan token.
- **Analisis**: Ini adalah pola yang kuat. Logika otentikasi terpusat di lapisan yang paling dekat dengan client, dan microservice di belakangnya bisa fokus murni pada logika bisnis. Ini menyederhanakan service internal.

**Pola 3: Pola Sidecar (dengan Service Mesh)**
- **Alur**: Ini adalah pola yang lebih canggih. Request yang masuk ke sebuah service (misal: `order-service`) akan dicegat oleh "Sidecar Proxy" yang berjalan di sampingnya. Sidecar inilah yang bertugas memvalidasi token sebelum request menyentuh kode aplikasi.
- **Analisis**: Memisahkan logika otentikasi sepenuhnya dari kode aplikasi, tapi menambah kompleksitas infrastruktur.

**Status Proyek Saat Ini**: Proyek ini menggunakan **Pola 1**. Untuk konsistensi, kita akan melanjutkan dengan pola ini, di mana setiap service yang memerlukan proteksi akan mengimplementasikan `JwtAuthGuard`-nya sendiri.

---

# Catatan Tambahan: Komunikasi Antar Service

Dalam arsitektur microservices, komunikasi antar service internal (contoh: `order-service` memanggil `product-service`) sebaiknya dilakukan **secara langsung**. Service memanggil alamat IP/hostname dari service lain di dalam jaringan internal yang aman.

**Alasan:**
- **Efisiensi**: Jauh lebih cepat dan memiliki latensi lebih rendah daripada harus keluar ke jaringan publik dan masuk kembali melalui API Gateway.
- **Keamanan**: Menjaga lalu lintas data internal tetap di dalam lingkungan yang terproteksi dan tidak mengeksposnya ke internet atau ke API Gateway yang bersifat publik.
- **Pemisahan Peran**: Peran API Gateway adalah untuk client eksternal, bukan untuk lalu lintas data internal.
---

# Catatan Tambahan: Peran Response DTO dan `ClassSerializerInterceptor`

Bagian ini menjelaskan bagaimana NestJS menggunakan Data Transfer Objects (DTOs) untuk membentuk respons API secara otomatis dan aman.

### Masalah: Data Mentah dari Database

Saat kita mengambil data dari database (misalnya MongoDB), objek yang kita dapatkan sering kali berisi informasi internal yang tidak relevan atau tidak boleh dilihat oleh pengguna akhir. Contohnya:
- `_id`: ID internal MongoDB.
- `__v`: Nomor versi dokumen dari Mongoose.
- Properti sensitif lainnya seperti password yang mungkin tidak sengaja terambil.

Mengirim data mentah ini langsung ke client adalah praktik yang buruk karena:
1.  **Tidak Aman**: Mengekspos struktur internal dan data sensitif.
2.  **Tidak Konsisten**: Struktur respons bisa berubah-ubah tergantung pada data di database.
3.  **Tidak Efisien**: Mengirim data yang tidak perlu.

### Solusi: Response DTO sebagai "Cetakan"

Untuk mengatasi ini, kita menggunakan **Response DTO** yang dikombinasikan dengan library `class-transformer` dan `ClassSerializerInterceptor` dari NestJS.

**1. Response DTO dengan `@Expose()`**

Kita membuat sebuah `class` (misalnya `OrderResponseDto`) yang mendefinisikan struktur data final yang ingin kita kirim. Di dalam kelas ini:
- **`@Expose()`**: Decorator ini digunakan untuk menandai properti mana saja yang boleh **ditampilkan** dalam respons API. Ini berfungsi sebagai "daftar putih" (whitelist). Properti tanpa `@Expose()` akan otomatis diabaikan.

**2. Constructor Praktis**

Sering kali, DTO ini memiliki `constructor` seperti ini:
```typescript
constructor(partial: Partial<OrderResponseDto>) {
  Object.assign(this, partial);
}
```
Ini adalah jalan pintas untuk membuat instance DTO dari objek data mentah yang kita dapat dari service, tanpa harus mengisi setiap properti satu per satu.

**3. `ClassSerializerInterceptor` (Bagian Otomatis)**

Ini adalah "sihir" di balik layar.
- **Cara Kerja**: Interceptor ini diaktifkan secara global di `main.ts`. Ia akan mencegat setiap respons yang dikirim oleh controller.
- **Transformasi**: Ia memeriksa tipe data yang seharusnya dikembalikan oleh sebuah endpoint (misalnya `Promise<OrderResponseDto>`). Kemudian, ia mengambil data mentah yang dikembalikan oleh service dan menggunakan kelas DTO (`OrderResponseDto`) sebagai **cetakan**.
- **Hasil**: Ia menciptakan objek baru yang bersih, yang hanya berisi properti yang ditandai `@Expose()` di DTO, lalu mengirimkannya sebagai respons JSON ke client.

### Alur Lengkap

1.  **`Service`**: Mengambil data mentah dari database (misal: `orderFromDb`).
2.  **`Controller`**: Memanggil service dan mengembalikan hasilnya.
    ```typescript
    `@Get(':id')
    findOne(@Param('id') id: string): Promise<Order> { // Tipe data mentah
      return this.orderService.findOne(id);
    }`
    ```
3.  **`Interceptor`**: Mencegat objek `Order` mentah.
4.  **Transformasi**: Jika endpoint di-dekorasi untuk menggunakan DTO, interceptor akan mengubah objek `Order` mentah menjadi `OrderResponseDto`.
5.  **Client**: Menerima objek JSON yang bersih dan aman, sesuai dengan struktur `OrderResponseDto`.
---

# Catatan Tambahan: Alur Implementasi Lupa Password untuk Frontend

Fitur "Lupa Password" (Forgot Password) yang sudah diimplementasikan di backend (`user-service`) sebenarnya cukup sederhana dari sisi frontend. Anda hanya perlu membuat **dua halaman** dan masing-masing melakukan **satu panggilan API**. Backend sudah mengurus semua kompleksitas token, validasi, dan keamanan.

## 1. Halaman/Form "Lupa Password"

**Tujuan**: Memulai proses reset password dengan mengirimkan email pengguna.

*   **URL Frontend**: Contoh: `/forgot-password` atau `/lupa-password`
*   **Komponen UI**:
    *   Satu input field untuk `email` pengguna.
    *   Satu tombol "Kirim" atau "Reset Password".
*   **Logika Frontend**:
    1.  Ketika pengguna memasukkan email dan mengklik tombol:
    2.  Lakukan panggilan API `POST` ke endpoint backend:
        *   **Method**: `POST`
        *   **URL Backend**: `http://localhost:8001/users/forgot-password`
        *   **Request Body (JSON)**:
            ```json
            {
                "email": "email_pengguna_yang_lupa@example.com"
            }
            ```
    3.  Tampilkan pesan kepada pengguna bahwa instruksi telah dikirim (misal: "Jika email Anda terdaftar, Anda akan menerima email reset password."). Ini dilakukan untuk alasan keamanan (agar tidak terdeteksi email mana yang terdaftar atau tidak).

## 2. Halaman/Form "Reset Password Baru"

**Tujuan**: Mengatur password baru setelah pengguna mengklik link reset.

*   **URL Frontend**: Contoh: `/reset-password/TOKEN_RESET_DARI_EMAIL`
*   **Komponen UI**:
    *   Dua input field untuk `Password Baru` dan `Konfirmasi Password Baru`.
    *   Satu tombol "Setel Password Baru".
*   **Logika Frontend**:
    1.  Saat halaman dimuat:
        *   Ekstrak `TOKEN_RESET_DARI_EMAIL` dari path URL.
        *   Pastikan `token` tersedia. Jika tidak, tampilkan pesan error (misal: "Token tidak valid").
    2.  Ketika pengguna memasukkan password baru (dan konfirmasi passwordnya cocok) serta mengklik tombol:
    3.  Lakukan panggilan API `POST` ke endpoint backend:
        *   **Method**: `POST`
        *   **URL Backend**: `http://localhost:8001/users/reset-password/TOKEN_YANG_DIDAPAT_DARI_URL`
        *   **Request Body (JSON)**:
            ```json
            {
                "password": "passwordBaruPengguna"
            }
            ```
    4.  Jika panggilan API berhasil:
        *   Tampilkan pesan sukses (misal: "Password Anda telah berhasil diatur ulang.").
        *   Arahkan pengguna ke halaman Login.
    5.  Jika panggilan API gagal (misal: token sudah kedaluwarsa atau tidak valid):
        *   Tampilkan pesan error yang sesuai dari respons backend.

---

# Ringkasan Proposal Tugas Akhir

Proposal ini adalah tentang **membangun sebuah sistem backend untuk aplikasi e-commerce yang modern, fleksibel, dan berperforma tinggi** dengan menggunakan arsitektur *Microservices* dan pola *Backend-for-Frontend* (BFF) menggunakan teknologi NestJS.

### Rincian per Bab:

**1. Latar Belakang (Masalah Utama)**
*   **Masalah:** Aplikasi modern seperti e-commerce harus bisa diakses dari berbagai jenis perangkat (HP, tablet, desktop). Setiap perangkat punya kebutuhan data yang berbeda. Misalnya, aplikasi di HP butuh data yang ringkas dan cepat, sementara halaman admin di web butuh data yang sangat lengkap.
*   **Problem Teknis:** Jika hanya ada satu API backend umum, seringkali data yang dikirim tidak efisien. Entah terlalu banyak data untuk HP (boros kuota & lambat), atau terlalu sedikit untuk web (harus memanggil API berkali-kali). Ini membebani aplikasi frontend.

**2. Rumusan Masalah & 3. Tujuan Penelitian (Solusi yang Ditawarkan)**
*   **Solusi:** Mengimplementasikan pola arsitektur **Backend-for-Frontend (BFF)**.
*   **Cara Kerja BFF:** Anda tidak membuat satu backend untuk semua, tapi **satu backend spesifik untuk setiap jenis frontend**. Jadi, akan ada:
    *   `BFF-Web` yang khusus melayani aplikasi web.
    *   `BFF-Mobile` yang khusus melayani aplikasi mobile.
*   **Tugas BFF:** BFF ini bertindak sebagai "perantara cerdas". Ia akan mengambil data dari semua layanan mikro lainnya (`user-service`, `product-service`, `order-service`), lalu **mengolah, menggabungkan, dan menyusun ulang data tersebut** agar formatnya pas dan sempurna untuk kebutuhan frontend yang dilayaninya.
*   **Tujuan Akhir:** Membuat sistem e-commerce yang pengiriman datanya bisa disesuaikan secara efisien untuk perangkat apa pun, sehingga performa aplikasi menjadi lebih baik.

**4. Tinjauan Pustaka (Dasar Teori)**
*   Proposal ini didukung oleh penelitian-penelitian sebelumnya yang membuktikan bahwa:
    *   Arsitektur *Microservices* memang cocok untuk e-commerce karena membuat sistem lebih tangguh dan mudah dikembangkan.
    *   Pola *BFF* terbukti dapat meningkatkan performa dan pengalaman pengguna dengan menyediakan data yang "pas" untuk setiap antarmuka.
*   Proposal Anda mengisi celah di mana penelitian sebelumnya seringkali hanya fokus pada satu jenis platform (misalnya mobile saja), sedangkan Anda akan membangun arsitektur yang lebih terstruktur untuk melayani berbagai platform.

**5. Metode Penelitian (Cara Mengerjakan)**
*   Anda akan menggunakan metodologi **Agile**, yang berarti proses pengerjaannya fleksibel dan bertahap.
*   **Tahapannya:**
    1.  **Perancangan:** Mendesain arsitektur microservices dan BFF.
    2.  **Pembangunan:** Membuat layanan-layanan inti (`User`, `Product`, `Order`) dan layanan BFF itu sendiri menggunakan **NestJS**.
    3.  **Integrasi:** Menghubungkan BFF dengan layanan-layanan mikro lainnya.
    4.  **Pengujian:** Menggunakan Postman untuk memastikan semua API berjalan sesuai harapan.
    5.  **Evaluasi:** Menilai apakah arsitektur BFF yang dibangun berhasil menyelesaikan masalah penyesuaian data yang diangkat di awal.

### Kesimpulan Sederhana:

Anda akan membangun "otak" dari sebuah sistem e-commerce. "Otak" ini terdiri dari banyak bagian kecil (microservices). Anda akan membuat "asisten pribadi" (BFF) untuk setiap jenis "pelanggan" (aplikasi web & mobile). Asisten ini akan memastikan setiap pelanggan mendapatkan informasi yang mereka butuhkan dengan cara yang paling efisien, tanpa membuat pelanggan kebingungan dengan informasi yang tidak relevan.
# Catatan Tambahan: Proteksi Layanan Mikro (Internal)

**Mengapa Perlu Proteksi?**

Meskipun semua permintaan dari frontend diarahkan melalui API Gateway, secara default, layanan mikro (`user-service`, `product-service`, dll.) masih dapat diakses secara langsung jika seseorang mengetahui alamat dan port-nya. Ini dapat menimbulkan beberapa masalah:

*   **Melewatkan Aturan Gateway:** Kebijakan keamanan, *rate limiting*, atau *logging* terpusat yang diterapkan di API Gateway dapat dilewati.
*   **Peningkatan Risiko Keamanan:** Setiap layanan mikro harus sepenuhnya mengamankan dirinya sendiri dari akses eksternal yang tidak sah, yang bisa menjadi beban duplikasi.

**Bagaimana Cara Melindungi Layanan Mikro dari Akses Langsung?**

Ada dua strategi utama:

**1. Secret Header (Rekomendasi untuk Proyek Ini)**

Ini adalah metode yang relatif sederhana dan efektif untuk memastikan bahwa permintaan yang diterima oleh layanan mikro berasal dari API Gateway yang sah.

*   **Cara Kerja:**
    1.  **Di API Gateway:** API Gateway telah dikonfigurasi untuk menambahkan *header* `X-Internal-Secret` dengan nilai rahasia ke setiap permintaan yang diteruskan.
    2.  **Di Setiap Layanan Mikro:** Setiap layanan mikro (termasuk semua BFF) kini memiliki `InternalAuthGuard` global yang secara otomatis memvalidasi *header* `X-Internal-Secret` pada setiap permintaan masuk. Jika *header* tidak ada atau tidak valid, permintaan akan ditolak.
*   **Keuntungan:** Mudah diimplementasikan, efektif mencegah akses langsung dari luar.
*   **Kekurangan:** Jika nilai rahasia bocor, proteksi ini bisa dilewati.
*   **Status Implementasi:** **SELESAI**. Strategi ini telah diimplementasikan di seluruh arsitektur. Semua layanan mikro sekarang hanya menerima permintaan yang berasal dari API Gateway.

**2. Jaringan Internal (Pendekatan Produksi yang Lebih Aman)**

Ini adalah pendekatan yang lebih kuat dan umum digunakan di lingkungan produksi dengan orkestrasi kontainer (misalnya Docker Compose, Kubernetes).

*   **Cara Kerja:**
    1.  **API Gateway** adalah satu-satunya layanan yang terekspos ke jaringan eksternal (internet).
    2.  **Semua Layanan Mikro** lainnya dikonfigurasi untuk hanya berjalan di dalam jaringan privat virtual (VPC) atau jaringan internal yang tidak dapat diakses langsung dari luar. Mereka tidak memiliki alamat IP publik.
    3.  API Gateway, karena berada di dalam jaringan yang sama, dapat berkomunikasi dengan layanan mikro menggunakan nama layanan internal mereka (misalnya, `http://user-service:8001`).
*   **Keuntungan:** Memberikan isolasi jaringan yang kuat, secara fisik mencegah akses langsung dari luar.
*   **Kekurangan:** Membutuhkan konfigurasi infrastruktur yang lebih kompleks (misalnya, Docker, Kubernetes).

Untuk proyek tugas akhir ini, implementasi **Strategi 1 (Secret Header)** akan menunjukkan pemahaman yang baik tentang keamanan arsitektur microservices dan akan secara efektif memaksa semua lalu lintas untuk melewati API Gateway.

---
# Alur Pengujian End-to-End (Post-Fix)

Berikut adalah alur pengujian yang direkomendasikan untuk memvalidasi semua perbaikan. Lakukan pengujian melalui **API Gateway** (`http://localhost:8000/api/...`) untuk mensimulasikan alur pengguna yang sebenarnya.

### Langkah 1: Registrasi & Login
- **`POST /api/user-service/users/register`**: Buat akun pengguna baru.
- **`POST /api/user-service/users/login`**: Login dengan akun tersebut untuk mendapatkan **JWT (JSON Web Token)**. Simpan token ini untuk permintaan selanjutnya.

### Langkah 2: Manajemen Keranjang (Cart)
- **`POST /api/bff-web/cart`**: Tambahkan produk ke keranjang.
  - **Body**: `{ "productId": "ID_PRODUK_VALID", "quantity": 1 }`
  - **Headers**: Sertakan JWT dari Langkah 1.
  - **Tujuan**: Memvalidasi alur `bff-web` -> `order-service` -> `product-service` dengan `X-Internal-Secret`.
- **`GET /api/bff-web/cart`**: Lihat isi keranjang.
  - **Headers**: Sertakan JWT.
  - **Tujuan**: Memastikan alur yang sebelumnya gagal sekarang berhasil.

### Langkah 3: Persiapan Checkout
- **`POST /api/user-service/users/profile/addresses`**: Tambahkan alamat pengiriman baru untuk pengguna.
  - **Headers**: Sertakan JWT.
  - **Body**: Isi data alamat yang valid.
- **`GET /api/bff-web/checkout`**: Dapatkan data agregat untuk halaman checkout.
  - **Headers**: Sertakan JWT.
  - **Tujuan**: Membuktikan BFF mampu mengagregasi data dari `order-service` dan `user-service`.

### Langkah 4: Buat Pesanan (Order)
- **`POST /api/bff-web/orders`**: Buat pesanan dari keranjang.
  - **Headers**: Sertakan JWT.
  - **Body**: `{ "shippingAddressId": "ID_ALAMAT_DARI_LANGKAH_3", "paymentMethod": "credit_card" }`
  - **Tujuan**: Menguji alur kompleks `bff-web` -> `order-service` -> `payment-service`.

### Langkah 5: Uji BFF Mobile (Opsional)
- Ulangi Langkah 2-4 menggunakan endpoint `bff-mobile` (contoh: `GET /api/bff-mobile/checkout`).
  - **Tujuan**: Memastikan perbaikan di `bff-mobile` juga berhasil dan konsisten.
