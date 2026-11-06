# Log Perubahan Sementara

File ini mencatat semua perubahan yang dilakukan untuk mengembalikan fungsionalitas dari `LOG02102025` ke arsitektur saat ini.

## Product Service

- **Tujuan:** Mengkonsolidasikan modul `products` dan `product-review`, mengembalikan logika bisnis yang hilang, dan menghapus kode yang berlebihan.
- **Status: SELESAI**
- **Ringkasan Perubahan:**
    - Memvalidasi dan memfinalisasi skema untuk `Product`, `Category`, dan `Review` di dalam direktori `src/products/schema`.
    - Memperbaiki `ProductsService`:
        - Logika `create` disesuaikan untuk menyimpan `categoryId` dengan benar dan mengembalikan objek produk.
        - Metode `update` dan `remove` diubah untuk mengembalikan objek yang dimodifikasi/dihapus.
        - Metode `findAll` dioptimalkan untuk menyertakan data kategori (populate).
    - Memvalidasi `CategoryService` yang sudah memiliki proteksi duplikasi nama.
    - Memvalidasi `ReviewService` yang sudah memiliki proteksi duplikasi review per user/produk.
    - Memastikan `products.module.ts` terkonfigurasi dengan benar.
    - Menghapus direktori `src/product-review` yang redundan.

---

## User Service

- **Tanggal:** 09 Oktober 2025
- **Tujuan:** Memperbaiki celah keamanan dan menambahkan fungsionalitas update profil mandiri.
- **Status: SELESAI**
- **Ringkasan Perubahan:**
    - **Analisis Ulang:** Ditemukan bahwa `LogFile.md` tidak akurat. Fungsionalitas berbasis token dan proteksi admin sudah ada. Namun, ditemukan celah keamanan baru.
    - **Perbaikan Keamanan:** Endpoint `PUT /users/:id` diamankan dengan `JwtAuthGuard` dan `@Roles('admin')` untuk mencegah pengguna biasa mengubah data pengguna lain.
    - **Penambahan Fitur:** Endpoint `PUT /users/profile/update` ditambahkan, memungkinkan pengguna untuk memperbarui data profil mereka sendiri menggunakan token otentikasi.

---

## Product Service - Perbaikan (Bug Fixing)

- **Tanggal:** 09 Oktober 2025
- **Tujuan:** Memperbaiki error TypeScript yang muncul setelah proses refactoring awal.
- **Status: SELESAI**
- **Ringkasan Masalah:**
    - Ditemukan beberapa error akibat ketidaksinkronan antara *Controller Layer* dan *Service Layer*.
    - `products.service`: Menerima `categoryId` yang mungkin `undefined`.
    - `products.controller`: Tipe kembalian (return type) tidak cocok dengan data yang dikembalikan oleh service.
    - `review.controller`: Memanggil metode service yang sudah tidak ada (`findAll`, `update`).
- **Ringkasan Perbaikan:**
    - `create-product.dto.ts`: Properti `categoryId` dijadikan wajib (dihapus `?`).
    - `products.controller.ts`: Tipe kembalian untuk `create`, `update` dan `remove` diubah menjadi `Promise<Product>`.
    - `review.controller.ts`: Disesuaikan dengan service, metode `update` dan `findAll` generik dihapus, dan endpoint `GET /product/:productId` ditambahkan.

---

## Order Service

- **Tujuan:** Mengimplementasikan kembali semua logika bisnis yang hilang untuk manajemen Keranjang (Cart), Pesanan (Order), dan Wishlist.
- **Status: SELESAI**
- **Ringkasan Masalah:**
    - Service ini hanya merupakan kerangka CRUD dasar tanpa logika bisnis.
    - Tidak ada validasi stok atau harga produk ke `product-service`.
    - Total harga tidak dihitung, dan stok tidak dikelola.
    - Tidak ada DTO yang spesifik, sehingga rawan error dan tidak aman.
- **Ringkasan Perbaikan:**
    1.  **DTOs Dibuat**: Membuat DTOs spesifik (`CreateCartItemDto`, `UpdateCartItemDto`, `CreateWishlistItemDto`, `CreateOrderDto`) untuk semua operasi.
    2.  **Komunikasi Service Diaktifkan**: `HttpModule` dan `ConfigModule` diimpor untuk komunikasi antar-service.
    3.  **`WishlistService` Diperbaiki**: Logika proteksi duplikasi item ditambahkan.
    4.  **`CartService` Diperbaiki**: Logika validasi stok ke `product-service` saat menambah/mengubah item diimplementasikan.
    5.  **`OrderService` Diperbaiki**: Alur kerja `createOrder` (validasi, kalkulasi, update stok) dan `updateStatus` (termasuk pengembalian stok saat batal) diimplementasikan sepenuhnya.

---

## Order Service - Perbaikan (Bug Fixing)

- **Tanggal:** 10 Oktober 2025
- **Tujuan:** Memperbaiki error, menambah validasi, dan meningkatkan kualitas output API.
- **Status: SELESAI**
- **Ringkasan Perbaikan:**
    1.  **Variabel Lingkungan Diperbaiki**: Memastikan `PRODUCT_SERVICE_URL` dan `USER_SERVICE_URL` tersedia di file `.env` dan di-load dengan aman menggunakan `OnModuleInit`.
    2.  **Validasi User Dikonfirmasi**: Pengecekan `userId` ke `user-service` sudah ada di dalam logika service terkait (`CartService`, `OrderService`).
    3.  **Response DTOs Diimplementasikan**: `CartItemResponseDto` dan `OrderResponseDto` dibuat dan diterapkan pada `CartController` dan `OrderController`.
    4.  **Interceptor Global Diaktifkan**: `ClassSerializerInterceptor` diaktifkan secara global di `main.ts` untuk memastikan semua respons dari controller diformat secara konsisten sesuai DTO.

---

## Order Service - Analisis Error Lanjutan

- **Tanggal:** 11 Oktober 2025
- **Tujuan:** Menganalisis secara mendalam semua file di dalam `order-service` untuk menemukan error dan inkonsistensi.
- **Status: BELUM SELESAI**
- **Ringkasan Temuan:**
    1.  **Interceptor Global Hilang (`main.ts`)**:
        -   **Masalah**: `ClassSerializerInterceptor` tidak diaktifkan.
        -   **Dampak**: Response DTO (`OrderResponseDto`, `CartItemResponseDto`) tidak berfungsi, menyebabkan API mengembalikan data mentah dari database.
    2.  **Tipe Kembalian Controller Salah (`cart.controller.ts`)**:
        -   **Masalah**: Metode di `CartController` di-type untuk mengembalikan model `Cart` mentah, bukan `CartItemResponseDto`.
        -   **Dampak**: Interceptor tidak akan tahu cara memformat respons, bahkan jika sudah diaktifkan.
    3.  **Tipe Kembalian Controller Salah (`order.controller.ts`)**:
        -   **Masalah**: Sama seperti `CartController`, metode di `OrderController` mengembalikan model `Order` mentah, bukan `OrderResponseDto`.
        -   **Dampak**: Respons API untuk order juga tidak akan terformat sesuai DTO.
    4.  **Inkonsistensi pada Wishlist**:
        -   **Masalah**: Belum ada `WishlistResponseDto` yang dibuat dan diimplementasikan untuk `wishlist.controller.ts`.
        -   **Dampak**: Output API untuk wishlist tidak konsisten dengan standar modul Cart dan Order.

## 11 Oktober 2025

### Perbaikan Tipe dan Bug di `order-service`

Hari ini, saya melakukan serangkaian perbaikan penting pada `order-service` untuk mengatasi beberapa error TypeScript kritis yang menghalangi fungsionalitas utama terkait pesanan dan keranjang.

**Perubahan Utama:**

1.  **Pengetikan yang Benar pada Mongoose Document (`OrderService` & `CartService`):**
    *   Mengubah return type dari `findOne` di kedua service menjadi `Promise<OrderDocument>` dan `Promise<CartDocument>`. Ini memastikan bahwa objek yang dikembalikan adalah instance Mongoose Document yang memiliki method seperti `.save()`.
    *   Memperbaiki method `updateStatus` di `OrderService` yang sebelumnya gagal karena objek `order` tidak memiliki method `.save()`. Dengan pengetikan yang benar, masalah ini teratasi.

2.  **Inisialisasi Array yang Aman (`OrderService`):**
    *   Saat membuat pesanan, array `orderItems` sekarang diinisialisasi dengan tipe eksplisit (`{ productId: string; quantity: number; price: number }[]`). Ini memperbaiki error `Argument of type '{...}' is not assignable to parameter of type 'never'`.

3.  **Penghapusan Item Keranjang yang Aman (`OrderService`):**
    *   Memperbaiki bug saat menghapus item keranjang setelah pesanan dibuat. Sebelumnya, kode mencoba mengakses `item._id` yang tidak ada pada tipe `Cart`. Sekarang, saya menggunakan `item.id` yang disediakan oleh virtual Mongoose, memastikan operasi penghapusan berjalan lancar.

4.  **Inisialisasi URL Service yang Robust (`CartService` & `OrderService`):**
    *   Memperbaiki cara `productServiceUrl` dan `userServiceUrl` diinisialisasi di dalam `onModuleInit`. Kode sekarang memeriksa apakah variabel lingkungan ada sebelum menetapkannya, mencegah error `string | undefined`.

Dengan perbaikan ini, `order-service` sekarang jauh lebih stabil, aman secara tipe, dan bebas dari bug kritis yang dilaporkan sebelumnya.

---

## Payment Service - Analisis dan Rencana Perbaikan

- **Tanggal:** 11 Oktober 2025
- **Tujuan:** Memperbaiki `payment-service` agar berfungsi dan sesuai dengan arsitektur microservices saat ini.
- **Status: SELESAI**

### Ringkasan Temuan

1.  **URL Layanan Kedaluwarsa (Kritis):** URL di `payment.service.ts` di-hardcode ke port lama (`5504`, `5500`) dan tidak menggunakan variabel dari `.env`.
2.  **Dependensi Hilang:** `HttpModule` dan `ConfigModule` tidak diimpor, menyebabkan service tidak bisa membaca `.env` atau melakukan HTTP request dengan benar.
3.  **Tidak Ada Response DTO:** API mengembalikan data mentah dari database, tidak konsisten dengan service lain.
4.  **Logika Endpoint Salah:** Logika dan penamaan endpoint untuk mencari pembayaran (`findByOrderId`) keliru.

### Ringkasan Perbaikan

1.  **Konfigurasi Modul:** `ConfigModule` dan `HttpModule` telah diimpor ke dalam `payment.module.ts` dan `app.module.ts`.
2.  **Koneksi Database Dinamis:** `app.module.ts` diubah untuk memuat `MONGO_URI` dari `.env` menggunakan `ConfigService`, menghilangkan hardcoded string.
3.  **Refactor Service:** `PaymentService` telah di-refactor sepenuhnya untuk meng-inject `ConfigService` dan `HttpService`, memuat URL dari `.env` via `onModuleInit`, dan mengganti `axios` dengan `HttpService`.
4.  **Implementasi DTO:** `PaymentResponseDto` telah dibuat dan diimplementasikan di `PaymentController` untuk memastikan output API yang bersih dan konsisten.
5.  **Aktivasi Interceptor:** `ClassSerializerInterceptor` telah diaktifkan secara global di `main.ts` untuk transformasi DTO otomatis.
6.  **Perbaikan Controller:** Metode `findByOrderId` diubah namanya menjadi `findByPaymentId` dan semua return type di-update untuk menggunakan `PaymentResponseDto`.

---

## Order Service - Refactor Create Order Logic

- **Tanggal:** 14 Oktober 2025
- **Tujuan:** Mengubah alur pembuatan pesanan (order) agar sesuai permintaan: satu pesanan dibuat dari satu `cartId`.
- **Status: SELESAI**
- **Ringkasan Perubahan:**
    1.  **Analisis Kode:** Membaca `order.controller.ts`, `create-order.dto.ts`, dan `order.service.ts`. Ditemukan bahwa DTO dan controller sudah benar, namun service `create` mengabaikan `cartId` dan memproses seluruh keranjang pengguna.
    2.  **Refactor `OrderService.create()`:** Logika metode `create` diubah total untuk:
        -   Mengambil `userId` dan `cartId` dari DTO.
        -   Mencari item keranjang yang spesifik menggunakan `cartService.findOne(cartId)`.
        -   Memvalidasi bahwa `cartItem.userId` cocok dengan `userId` yang diberikan untuk keamanan.
        -   Menghitung `totalAmount` dan `orderItems` hanya dari satu item keranjang tersebut.
        -   Membuat pesanan baru.
        -   Mengurangi stok hanya untuk produk yang dipesan.
        -   Menghapus hanya item keranjang yang bersangkutan (`cartService.remove(cartId)`), bukan seluruh keranjang pengguna.

---

## User Service - Refactor & Bug Fix

- **Tanggal:** 15 Oktober 2025
- **Tujuan:** Memperbaiki beberapa masalah kritis terkait output API yang tidak bersih dan celah logika pada proses update data.
- **Status: SELESAI**

### Ringkasan Masalah
1.  **Output API Kotor**: Semua endpoint mengembalikan data mentah dari database, termasuk field internal seperti `_id`, `__v`, dan `password`. Field `id` yang seharusnya ada justru tidak muncul.
2.  **Update Profil Membingungkan**: Endpoint `PUT /users/profile/update` memberikan respons "sukses" meskipun tidak ada data yang berubah jika client mengirim field yang tidak ada di DTO (misalnya, mengirim `{ "password": "..." }` bukannya `{ "oldPassword": "...", "newPassword": "..." }`).

### Strategi & Perbaikan
1.  **Implementasi Pola Interceptor Kustom untuk Mongoose**:
    -   Membuat `MongooseClassSerializerInterceptor` baru yang secara spesifik dirancang untuk menangani serialisasi dokumen Mongoose. Interceptor ini secara otomatis memanggil `.toJSON()` pada dokumen sebelum transformasi, yang merupakan langkah kunci yang hilang dari `ClassSerializerInterceptor` bawaan.
    -   Memperbarui `UserResponseDto` dengan decorator `@Transform` untuk mengubah `_id` dari Mongoose menjadi `id` string yang bersih di output JSON.
    -   Menerapkan interceptor baru ini secara spesifik pada `UsersController`, menggantikan interceptor global yang kurang efektif.
    -   Menyederhanakan `UsersService` dengan menghapus semua pemanggilan manual `plainToInstance`, karena transformasi kini ditangani secara otomatis oleh interceptor.

2.  **Memperketat Validasi DTO**:
    -   Mengkonfigurasi `ValidationPipe` global di `main.ts` dengan opsi `{ forbidNonWhitelisted: true }`.
    -   Perubahan ini membuat NestJS secara otomatis menolak request yang berisi properti yang tidak didefinisikan di dalam DTO. Hasilnya, request yang salah (misalnya, mengirim `password` di `UpdateUserDto`) sekarang akan langsung gagal dengan error `400 Bad Request`, memberikan feedback yang jelas dan mencegah "kegagalan sunyi" (silent failure).

Dengan perbaikan ini, `user-service` sekarang memiliki output API yang bersih, aman, dan konsisten, serta alur validasi yang lebih kuat.

---

## User Service - Perbaikan Tipe TypeScript

- **Tanggal:** 18 Oktober 2025
- **Tujuan:** Memperbaiki error kompilasi TypeScript di `user-service`.
- **Status: SELESAI**
- **Ringkasan Masalah:**
    -   Terjadi error `TS2322: Type 'User[]' is not assignable to type 'UserResponseDto[]'` pada method `findAll` di `UsersController`.
    -   Masalah ini disebabkan karena `usersService.findAll()` mengembalikan array `User` (dari Mongoose), sementara controller secara eksplisit mendeklarasikan akan mengembalikan array `UserResponseDto`. TypeScript tidak mengetahui bahwa `MongooseClassSerializerInterceptor` akan melakukan transformasi saat runtime.
- **Ringkasan Perbaikan:**
    -   Menghapus anotasi tipe eksplisit `Promise<UserResponseDto[]>` dari method `findAll` di `users.controller.ts`.
    -   Dengan membiarkan TypeScript menyimpulkan tipe kembaliannya, error kompilasi berhasil dihilangkan tanpa mengganggu fungsi interceptor yang berjalan saat runtime.

---

## User Service - Perbaikan Output API Get Profile

- **Tanggal:** 19 Oktober 2025
- **Tujuan:** Memastikan endpoint profil pengguna mengembalikan data yang bersih dan aman sesuai DTO.
- **Status: SELESAI**
- **Ringkasan Masalah:**
    -   Endpoint `GET /users/profile` mengembalikan objek `User` mentah dari database, yang mengekspos data sensitif (`password`) dan field internal (`_id`, `__v`).
- **Ringkasan Perbaikan:**
    -   **Refactor Logika Serialisasi**: Pola serialisasi diubah menjadi lebih eksplisit.
    -   **Service Layer**: Metode `findById` di `users.service.ts` diubah untuk secara manually mengubah dokumen Mongoose menjadi `UserResponseDto`.
    -   **Controller Layer**: `users.controller.ts` disederhanakan dengan menghapus `@UseInterceptors` yang tidak lagi diperlukan, karena transformasi sudah ditangani di dalam service.
    -   **DTO Layer**: `response-dto.dto.ts` disempurnakan dengan decorator `@Transform` untuk menangani nilai `null` atau `undefined` secara konsisten.
    *   **Hasil**: Output dari `GET /users/profile` sekarang sepenuhnya sesuai dengan `UserResponseDto`, menyajikan data yang bersih dan aman.

---

## 20 Oktober 2025: Refactoring dan Perbaikan Product Service

Berdasarkan isu yang terdokumentasi di `testing.md`, dilakukan serangkaian perbaikan besar pada `product-service` untuk meningkatkan keamanan, memperbaiki bug, dan menstandarisasi respons API.

### Problem yang Diatasi:

1.  **Keamanan Endpoint**: Sebagian besar endpoint (khususnya `POST`, `PUT`, `DELETE`) tidak memiliki proteksi, sehingga siapa pun dapat memodifikasi data. Endpoint yang seharusnya hanya untuk Admin dapat diakses secara publik.
2.  **Otentikasi User**: Proses pembuatan ulasan (`review`) mengharuskan `userId` dikirim secara manual di dalam *body*, yang tidak aman dan tidak praktis.
3.  **Format Respons API**: Respons dari semua endpoint masih mengekspos data internal database seperti `_id`, `__v`, `createdAt`, dan `updatedAt`, yang merupakan praktik buruk.
4.  **Bug Logika Stok**: Fungsi untuk memperbarui stok produk mengalami bug di mana operasi penjumlahan dianggap sebagai penggabungan string (misalnya, stok `25` ditambah `5` menjadi `255`).
5.  **Respons Operasi Hapus**: Endpoint `DELETE` mengembalikan seluruh objek data yang baru dihapus, bukan pesan konfirmasi sederhana.
6.  **Validasi Input**: Beberapa metode controller masih menggunakan tipe `any` untuk *request body*, yang menonaktifkan mekanisme validasi bawaan NestJS.

### Solusi dan Perubahan yang Diimplementasikan:

1.  **Implementasi Keamanan (Role-Based Access Control)**:
    *   Menyalin `jwt-auth.guard.ts` dari `user-service` yang sudah memiliki logika validasi token dan peran (role).
    *   Mengonfigurasi `JwtModule` di `product-service` dengan `JWT_SECRET` yang sama untuk memastikan token dapat diverifikasi.
    *   Menerapkan `UseGuards(JwtAuthGuard)` dan decorator `@Roles('Admin')` pada semua endpoint yang memerlukan hak akses Admin (di `ProductsController`, `CategoryController`, dan `ReviewController`).
    *   Endpoint untuk membuat ulasan (`POST /reviews`) diamankan agar hanya bisa diakses oleh pengguna yang sudah login.

2.  **Pengambilan `userId` dari Token**:
    *   Metode `create` pada `ReviewController` diubah untuk mengambil `userId` secara otomatis dari payload token JWT (`req.user.sub`), bukan lagi dari *body*.

3.  **Standarisasi Respons dengan Response DTO**:
    *   Membuat DTO khusus untuk respons: `ProductResponseDto`, `CategoryResponseDto`, dan `ReviewResponseDto`.
    *   DTO ini menggunakan decorator `@Expose` dari `class-transformer` untuk memilih field mana saja yang boleh ditampilkan ke client.
    *   Mengaktifkan `ClassSerializerInterceptor` secara global di `main.ts` untuk memfilter semua respons API secara otomatis.
    *   Semua metode controller diperbarui untuk mengembalikan DTO respons ini, memastikan format data yang bersih dan konsisten.

4.  **Perbaikan Bug Stok**:
    *   Logika pada metode `updateStock` di `ProductsService` diperbaiki dengan menambahkan konversi eksplisit ke `Number()` sebelum melakukan operasi matematika. Ini memastikan perhitungan stok berjalan akurat.

5.  **Perbaikan Respons `DELETE`**:
    *   Semua metode `remove` di setiap controller diubah agar mengembalikan objek pesan konfirmasi standar, contoh: `{ "message`: `"Produk berhasil dihapus" }`.

6.  **Implementasi DTO untuk Validasi Input**:
    *   Membuat DTO baru (`CreateCategoryDto`, `UpdateCategoryDto`, `CreateReviewDto`) dengan `class-validator` untuk menggantikan penggunaan tipe `any`.

---

### Peningkatan Validasi dan Stabilitas di `product-service`

- **Problem:** Saat membuat ulasan (`review`), tidak ada validasi untuk memeriksa apakah `productId` yang diberikan benar-benar ada di database. Ini bisa menyebabkan data ulasan menjadi "yatim" (orphaned) dan tidak valid.
- **Solusi:**
    -   Mengimplementasikan validasi keberadaan produk di `ReviewService`.
    -   Sebelum sebuah ulasan dibuat, service sekarang akan memanggil `productsService.getProductById()` untuk memastikan produk tersebut valid. Jika tidak ditemukan, proses akan gagal dengan error `404 Not Found`.
    -   Untuk memungkinkan komunikasi antar service di dalam modul yang sama (`ReviewService` memanggil `ProductsService`), injeksi dependensi di-refactor menggunakan `forwardRef`. Ini adalah praktik terbaik di NestJS untuk mencegah masalah *circular dependency`.
---
**Tanggal:** 21 Oktober 2025

**Analisis & Perbaikan: Error 401 Unauthorized pada `product-service`**

**1. Analisis Masalah:**
-   **Penyebab Utama:** Konfigurasi `JwtModule` di `product-service` (`products.module.ts`) salah. Modul tersebut didaftarkan dengan `signOptions`, yang seharusnya hanya digunakan saat *membuat* token, bukan saat *memvalidasi*. Hal ini menyebabkan proses validasi token dari `user-service` gagal.
-   **Inkonsistensi Tambahan:** Ditemukan juga ketidakkonsistenan masa berlaku token (`expiresIn`) antara konfigurasi di `user.module.ts` ('5h'), implementasi di `user.service.ts` ('1h'), dan `product.module.ts` ('1d').

**2. Strategi & Eksekusi:**
-   **Tindakan Utama:** Menghapus properti `signOptions` dari konfigurasi `JwtModule.registerAsync` di dalam file `product-service/src/products/products.module.ts`. Service validator hanya memerlukan `secret` untuk verifikasi.
-   **Rekomendasi:** Menyarankan untuk menghapus `expiresIn` yang di-hardcode di `user.service.ts` agar masa berlaku token konsisten dengan yang didefinisikan di `user.module.ts`.

---

### Perubahan pada `product-service` (Lanjutan)

**Tanggal:** 21 Oktober 2025

**1. File: `product-service/src/products/schema/product.schema.ts`**
   - **Deskripsi:** Mengkonfigurasi skema produk untuk mengelola transformasi data dan properti virtual agar sesuai dengan `ProductResponseDto`.
   - **Detail Perubahan:**
     - Menambahkan opsi `toJSON` dan `toObject` ke decorator `@Schema` untuk mengaktifkan virtual dan mentransformasi `_id` menjadi `id`.
     - Menambahkan properti virtual `id` yang mengembalikan `_id.toHexString()`.
     - Memodifikasi properti virtual `category` untuk langsung mengembalikan `this.categoryId.name` (jika terpopulasi) alih-alih objek `Category` lengkap.
     - Menambahkan properti virtual `imageUrl` yang mengembalikan gambar pertama dari array `images` (jika ada).

**2. File: `product-service/src/products/products.service.ts`**
   - **Deskripsi:** Memperbaiki logika validasi kategori dan memastikan output method `create` sesuai dengan `ProductResponseDto`.
   - **Detail Perubahan:**
     - Memperbaiki logika validasi kategori di method `create` (dari `if (validationCategory)` menjadi `if (!validationCategory)`).
     - Memodifikasi method `create` untuk melakukan populasi `categoryId` setelah menyimpan produk.
     - Mengubah tipe kembalian method `create` menjadi `Promise<ProductResponseDto>`.
     - Menggunakan `plainToInstance(ProductResponseDto, populatedProduct.toJSON(), { excludeExtraneousValues: true })` untuk secara eksplisit mentransformasi output ke DTO.
     - Menambahkan `import { plainToInstance } from 'class-transformer';`.

**3. File: `product-service/src/products/dto/product-response.dto.ts`**
   - **Deskripsi:** Menghapus decorator `@Transform` pada properti `category` karena transformasi sekarang ditangani langsung oleh properti virtual di skema Mongoose.
   - **Detail Perubahan:**
     - Menghapus `@Transform(({ value }) => value ? value.name : null)` dari properti `category`.

---

### Perbaikan Product Service (Lanjutan - 22 Oktober 2025)

Berdasarkan klarifikasi dan instruksi terbaru, serangkaian perbaikan dan standarisasi telah dilakukan pada `product-service`.

**Ringkasan Perubahan:**

1.  **`create-product.dto.ts`**: Menambahkan dekorator `@IsMongoId()` pada properti `categoryId` untuk validasi format ID MongoDB.
2.  **`response-product.dto.ts`**: Properti `category` diubah menjadi `categoryName: string` untuk menampilkan nama kategori saja. Dekorator `@Transform` disesuaikan untuk mengekstrak nama kategori dari properti virtual skema. Properti `createdAt` dihapus dari DTO.
3.  **`products.controller.ts`**: Menerapkan `@UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))` pada kelas controller untuk serialisasi respons otomatis. Menambahkan `@UseGuards(JwtAuthGuard)` dan `@Roles('Admin')` pada metode `create` untuk otentikasi dan otorisasi.
4.  **`category.controller.ts`**: Memastikan `MongooseClassSerializerInterceptor` diterapkan pada kelas controller. Memastikan metode `remove` mengembalikan pesan konfirmasi `{ message: 'Kategori berhasil dihapus' }`.
5.  **`category-response.dto.ts`**: Membuat DTO ini untuk mengekspos `id`, `name`, dan `description` pada respons kategori.
6.  **`create-category.dto.ts`**: Menambahkan dekorator validasi (`@IsNotEmpty()`, `@IsString()`) pada properti `name` dan `description`.
7.  **`update-category.dto.ts`**: Membuat DTO ini dengan dekorator validasi (`@IsOptional()`, `@IsString()`) untuk properti `name` dan `description`.
8.  **`review.controller.ts`**: Menerapkan `MongooseClassSerializerInterceptor` pada kelas controller. Memastikan metode `create` mengambil `userId` dari token otentikasi (`req.user.sub`). Memastikan metode `remove` mengembalikan pesan konfirmasi `{ message: 'Review berhasil dihapus' }` dan dilindungi oleh `JwtAuthGuard` serta `Roles('Admin')`.
9.  **`review.service.ts`**: Memastikan metode `remove` memiliki tipe kembalian `Promise<void>`.
10. **`review-response.dto.ts`**: Membuat DTO ini untuk mengekspos `id`, `productId`, `userId`, `rating`, dan `comment` pada respons ulasan.
11. **`create-review.dto.ts`**: Menambahkan dekorator validasi (`@IsNotEmpty()`, `@IsMongoId()`, `@IsNumber()`, `@Min(1)`, `@Max(5)`, `@IsString()`) pada properti `productId`, `rating`, dan `comment`. Memastikan properti `userId` tidak ada di DTO ini.

---

### Perbaikan Product Service (Refactor & Bug Fix Lanjutan)

- **Tanggal:** 23 Oktober 2025
- **Tujuan:** Memperbaiki masalah serialisasi respons API, menstandarkan output, dan memastikan semua endpoint berfungsi sesuai dokumentasi.
- **Status:** SELESAI

### Ringkasan Masalah
1.  **Error Kompilasi**: Ditemukan error TypeScript pada beberapa DTO (`create-product.dto.ts`, `create-review.dto.ts`) karena decorator dari `class-validator` tidak diimpor.
2.  **Output API Kotor**: Respons dari semua endpoint di `product-service` masih mengembalikan data mentah dari database, termasuk field internal (`_id`, `__v`, `createdAt`, `updatedAt`, `categoryId` object) meskipun sudah ada `MongooseClassSerializerInterceptor`.
3.  **Transformasi Ganda**: Terjadi kebingungan antara transformasi manual di dalam *service* dan transformasi otomatis oleh *interceptor*, yang menyebabkan interceptor tidak berfungsi dengan benar.

### Strategi & Perbaikan
1.  **Perbaikan Error Kompilasi**:
    -   Menambahkan impor `IsMongoId` di `create-product.dto.ts`.
    -   Menambahkan impor `IsString` di `create-review.dto.ts`.

2.  **Perbaikan Interceptor dan DTO**:
    -   **Analisis**: Ditemukan bahwa `MongooseClassSerializerInterceptor` tidak menyertakan opsi `{ excludeExtraneousValues: true }` saat memanggil `plainToClass`. Akibatnya, properti yang tidak memiliki decorator `@Expose` di DTO tetap ikut terkirim.
    -   **Tindakan**: Memperbaiki `mongoose-class-serializer.interceptor.ts` dengan menambahkan opsi tersebut.

3.  **Menghapus Interceptor Global yang Konflik**:
    -   **Analisis**: Ditemukan adanya `ClassSerializerInterceptor` global yang didaftarkan di `main.ts`. Interceptor global ini berjalan lebih dulu dan tidak kompatibel dengan dokumen Mongoose, sehingga `MongooseClassSerializerInterceptor` yang spesifik di controller tidak pernah bekerja sebagaimana mestinya.
    -   **Tindakan**: Menghapus `app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));` dari `main.ts`.

4.  **Standarisasi Service dan Controller**:
    -   **`products.service.ts`**: Disederhanakan dengan menghapus semua pembuatan DTO manual (`new ProductResponseDto()`). Service sekarang mengembalikan `Promise<ProductDocument>` (objek Mongoose mentah).
    -   **`products.controller.ts`**: Tipe kembalian diubah menjadi `Promise<Product>` untuk disesuaikan dengan service. Transformasi respons kini sepenuhnya ditangani oleh `MongooseClassSerializerInterceptor`.
    -   **`response-product.dto.ts`**: Disederhanakan dengan menghapus decorator `@Transform` yang tidak perlu, karena transformasi sudah ditangani oleh *virtual properties* di skema Mongoose.

5.  **Pembaruan Dokumentasi Testing**:
    -   Memperbarui file `testing_fix1.md` untuk mencerminkan output API yang sudah bersih dan benar pada `product-service`.
    -   Menambahkan `BEARER TOKEN XXX` pada endpoint yang memerlukan otentikasi.
    -   Memperbarui status "Catatan & Error" untuk menandai bahwa semua masalah yang teridentifikasi telah diperbaiki.

---

### Perubahan 28 Oktober 2025

**Layanan: Order Service**

**Tujuan:** Memperbaiki dan merapikan fungsionalitas **Review**.

**1. Refactoring & Perbaikan Routing Review:**
-   **Penggabungan Controller**: `review.controller.ts` dihapus dan semua logikanya diintegrasikan ke dalam `products.controller.ts`. Ini menyatukan semua endpoint yang berhubungan dengan produk dan turunannya dalam satu tempat.
-   **Struktur URL (RESTful)**: Rute untuk review diubah agar lebih logis dan mengikuti standar REST.
    -   Melihat review produk: `GET /products/:productId/reviews`.
    -   Membuat review: `POST /products/:productId/reviews`.
    -   Endpoint baru ditambahkan: `GET /products/reviews/me` (melihat review milik sendiri), `GET /products/reviews/:id` (melihat satu review), dan `DELETE /products/reviews/:id`.
-   **Perbaikan DTO & Service**: `create-review.dto.ts` dan `review.service.ts` disesuaikan agar `productId` diambil dari URL, bukan dari body request, menghilangkan duplikasi dan potensi error.

**2. Perbaikan Output Data (Serialisasi):**
-   **Masalah**: Endpoint review menghasilkan output "kotor" (data mentah dari database, `Buffer`, dll.).
-   **Solusi**: Masalah dilacak ke `review.schema.ts` yang tidak memiliki konfigurasi `toJSON` dan properti virtual yang benar.
    -   Menambahkan opsi `{ toJSON: { virtuals: true } }` pada skema.
    -   Mendefinisikan properti virtual untuk `id` dan `productId` (`product`) yang secara eksplisit mengubah `ObjectId` menjadi `string` menggunakan `.toHexString()`.
    -   DTO (`review-response.dto.ts`) disesuaikan untuk menggunakan properti virtual ini.

**3. Perbaikan Keamanan & Otorisasi:**
-   **Otentikasi (Memperbaiki Lubang Keamanan)**: Ditemukan dan diperbaiki bug kritis di `jwt-auth.guard.ts` yang membiarkan request tanpa token lolos. Logika `if (err || !user)` ditambahkan untuk memastikan request tanpa token/token tidak valid akan selalu ditolak dengan error `401 Unauthorized`.
-   **Otorisasi Hapus Review**: Endpoint `DELETE /products/reviews/:id` sekarang memiliki logika otorisasi di `review.service.ts`.
    -   Hanya **pemilik review** atau pengguna dengan role **'Admin'** yang dapat menghapus sebuah review.
    -   Pengguna lain akan mendapatkan error `403 Forbidden`.

---

### Perubahan 29 Oktober 2025

**Layanan: Order Service**

**Tujuan:** Menganalisis dan memperbaiki fungsionalitas Keranjang (Cart) sesuai `testing.md`, menerapkan keamanan berbasis token, dan memperbaiki serangkaian error yang muncul.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Implementasi Fondasi Otentikasi (JWT):**
    *   Menambahkan dependensi `@nestjs/jwt`, `@nestjs/passport`, dan `passport-jwt` ke `package.json`.
    *   Membuat modul `auth` baru yang berisi `jwt.strategy.ts` (logika validasi token) dan `jwt-auth.guard.ts`.
    *   Mengonfigurasi `order-management.module.ts` untuk mengimpor `Pa
    SportModule` dan `JwtModule`, serta menyediakan `JwtStrategy`.
    *   Memperbaiki `jwt.strategy.ts` untuk memberikan error jika `JWT_SECRET` tidak ditemukan di environment.
    *   Menambahkan variabel `JWT_SECRET` ke dalam file `.env`.

2.  **Refactor Fungsionalitas Keranjang (Cart):**
    *   **Keamanan Controller (`cart.controller.ts`):**
        *   Menerapkan `JwtAuthGuard` untuk melindungi semua endpoint.
        *   Mengubah logika untuk mengambil `userId` dari token JWT yang aman, bukan dari *body` atau *param* URL.
    *   **Pembersihan DTO:**
        *   Membuat `cart-response.dto.ts` untuk standarisasi output API.
        *   Menghapus properti `userId` dari `create-cart-item.dto.ts`.
    *   **Penyesuaian Service (`cart.service.ts`):**
        *   Mengubah metode `create` untuk menerima `userId` dari controller.
        *   Mengubah metode `remove` untuk mengembalikan pesan konfirmasi, bukan data yang dihapus.
    *   **Serialisasi Respons (`cart.controller.ts`):**
        *   Menerapkan `ClassSerializerInterceptor` untuk secara otomatis mengubah data mentah dari service menjadi DTO yang bersih.

3.  **Perbaikan Error Runtime:**
    *   Memperbaiki `order-management.module.ts` dengan mengembalikan `ConfigModule.forRoot()` yang sempat terhapus, menyelesaikan error `JWT_SECRET` is not defined`.
    *   Mengubah `cart.service.ts` untuk melakukan *hardcode* pada `productServiceUrl` dan `userServiceUrl` sesuai permintaan pengguna untuk mengatasi error startup terakhir.

---

### Perubahan 5 November 2025

**Layanan: Order Service**

**Tujuan:** Memperbaiki bug kritis pada fungsionalitas Keranjang (Cart) dan Pesanan (Order) yang menyebabkan error kompilasi dan runtime karena argumen `userId` yang hilang.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **File: `order-service/src/order-management/cart.service.ts`**
    *   **Perbaikan:** Memperbaiki pemanggilan method `this.findOne()` di dalam method `update()` dan `remove()`.
    *   **Detail:** Argumen `userId` ditambahkan pada pemanggilan tersebut (menjadi `this.findOne(userId, id)`). Ini memastikan bahwa service selalu memeriksa kepemilikan item keranjang sebelum melakukan operasi update atau delete, sesuai dengan logika keamanan yang benar.

2.  **File: `order-service/src/order-management/order.service.ts`**
    *   **Perbaikan:** Memperbaiki pemanggilan method `this.cartService.findOne()` di dalam method `create()`.
    *   **Detail:** Argumen `userId` ditambahkan pada pemanggilan tersebut (menjadi `this.cartService.findOne(userId, cartId)`). Ini krusial untuk memastikan bahwa pesanan hanya dapat dibuat dari item keranjang yang dimiliki oleh pengguna yang membuat pesanan.

---

### Perubahan 5 November 2025 (Lanjutan)

**Layanan: Order Service (Wishlist)**

**Tujuan:** Memperbaiki fungsionalitas Wishlist secara menyeluruh, meliputi keamanan, validasi data, standarisasi API, dan perbaikan bug kompilasi.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Keamanan & Logika Service (`wishlist.service.ts`):**
    *   Method `findOne` dan `remove` sekarang memerlukan `userId` untuk memastikan pengguna hanya dapat mengakses data mereka sendiri.
    *   Logika `remove` dioptimalkan untuk menggunakan `deleteOne()` yang lebih efisien.

2.  **Validasi Data (`wishlist.service.ts`):**
    *   Mengimplementasikan method `validateProduct` yang berkomunikasi dengan `product-service` untuk memastikan produk ada sebelum ditambahkan ke wishlist.

3.  **Refactor Controller (`wishlist.controller.ts`):**
    *   Endpoint `GET /wishlists/user/:userId` diganti dengan `GET /wishlists` yang aman dan secara otomatis mengambil data untuk pengguna yang terotentikasi.
    -   Semua pemanggilan method di controller diperbarui untuk meneruskan `userId` dari token ke lapisan service.

4.  **Standarisasi API Output (`wishlist.schema.ts`):
    *   Skema diperbarui dengan `toJSON` virtuals untuk memastikan respons API bersih dan konsisten, dengan mengekspos `id` virtual.

5.  **Perbaikan Bug Kompilasi:**
    *   Memperbaiki error TypeScript `string | undefined` di `onModuleInit` (`wishlist.service.ts`) dengan memastikan penanganan variabel lingkungan yang aman.
---

### Perubahan 5 November 2025 (Sesi 2)

**Layanan: Order Service (Order)**

**Tujuan:** Memperbaiki celah keamanan, logika bisnis yang salah, dan alur pembuatan pesanan yang tidak standar sesuai dengan catatan di `testing.md`.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Peningkatan Keamanan Endpoint (`order.controller.ts`):**
    *   Mengganti endpoint `GET /user/:userId` yang tidak aman dengan `GET /my-orders`.
    *   Endpoint baru ini mengambil `userId` langsung dari token otentikasi, mencegah pengguna melihat riwayat pesanan pengguna lain.

2.  **Perbaikan Logika Status Pesanan (`order.service.ts`):**
    *   Menambahkan validasi di metode `updateStatus` untuk melempar `BadRequestException` jika ada upaya mengubah status pesanan yang sudah `completed` atau `cancelled`.

3.  **Refactor Total Logika Pembuatan Pesanan:**
    *   **`order.service.ts`**: Logika metode `create` dirombak sepenuhnya. Sekarang, metode ini membuat satu pesanan dari **semua item** di keranjang pengguna, bukan dari satu `cartId`. Alurnya: mengambil semua item, memvalidasi stok, menghitung total, membuat pesanan, mengurangi stok semua produk, dan mengosongkan keranjang.
    *   **`create-order.dto.ts`**: Disederhanakan menjadi kelas kosong karena `cartId` tidak lagi diperlukan.
    *   **`cart.service.ts`**: Menambahkan metode `clearCart(userId)` baru untuk mendukung logika pembuatan pesanan yang baru.

4.  **Peningkatan Efisiensi:**
    *   Menghapus panggilan `validateUser` yang redundan dari metode `create` di `order.service.ts` karena validasi sudah ditangani oleh `JwtAuthGuard`.

---

**PENGINGAT LOGGING:**
SETIAP perubahan pada SATU file akan SELALU dicatat di `logsementara.md`. Catatan akan menyertakan tanggal dan detail perubahan untuk memastikan riwayat kerja yang transparan dan meminimalkan error.
---

### Perubahan 7 November 2025

**Layanan: Order Service**

**Tujuan:** Memperbaiki logika bisnis pembuatan pesanan dan menutup celah keamanan kritis terkait kepemilikan data.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Refactor Logika Pembuatan Pesanan (Sesuai Klarifikasi):**
    *   **Masalah:** Alur pembuatan pesanan sebelumnya salah dipahami; sistem mengonversi seluruh isi keranjang menjadi satu pesanan.
    *   **Perbaikan:** Logika dirombak total sesuai permintaan. Sekarang, pesanan dibuat dari **satu item keranjang spesifik**.
    *   **`create-order.dto.ts`**: Diperbarui untuk menerima `cartId`, mengidentifikasi item mana yang akan di-*checkout*.
    *   **`order.service.ts`**: Metode `create` diubah untuk:
        *   Menggunakan `cartId` dari DTO untuk mengambil satu item dari `cart.service`.
        *   Membuat pesanan yang hanya berisi satu item tersebut.
        *   Menghapus hanya item keranjang yang sudah dipesan, bukan mengosongkan seluruh keranjang.

2.  **Penutupan Celah Keamanan Kritis (Validasi Kepemilikan):**
    *   **Masalah:** Ditemukan bahwa pengguna dapat melihat, mengubah, dan menghapus pesanan milik pengguna lain hanya dengan mengetahui `orderId`.
    *   **Perbaikan:** Implementasi pemeriksaan kepemilikan yang ketat di semua endpoint terkait.
    *   **`order.controller.ts`**: Diperbarui agar semua metode (`findOne`, `updateStatus`, `remove`) mengambil `userId` dari token JWT dan meneruskannya ke *service layer*.
    *   **`order.service.ts`**:
        *   Metode `findOne` diubah untuk mencari pesanan berdasarkan `_id` **DAN** `userId`.
        *   Metode `updateStatus` diubah untuk menggunakan `findOne` yang aman sebelum melakukan perubahan.
        -   Metode `remove` diubah untuk menggunakan `deleteOne({ _id: id, userId: userId })`, memastikan hanya pemilik yang bisa menghapus pesanannya.

---

### Perubahan 7 November 2025 (Sesi 2)

**Layanan: Order Service**

**Tujuan:** Meningkatkan penanganan error (error handling) pada API untuk memberikan pesan yang lebih informatif.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Peningkatan Error Handling pada `updateStatus`:**
    *   **Masalah:** Saat pengguna mengirim nilai status yang tidak valid (misalnya, "payment"), API mengalami crash di backend dan tidak memberikan respons yang jelas ke klien.
    *   **Perbaikan:** Metode `updateStatus` di `order.service.ts` sekarang memiliki blok `try...catch`.
    *   **Hasil:** Jika terjadi `ValidationError` pada status, API akan secara otomatis mengembalikan respons `400 Bad Request` dengan pesan JSON yang informatif, yang mencantumkan semua nilai status yang valid.

---

### Perubahan 7 November 2025 (Sesi 3)

**Layanan: Order Service**

**Tujuan:** Menerapkan kontrol akses berbasis peran (Role-Based Access Control) pada endpoint untuk mengubah status pesanan.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Pembatasan Akses `updateStatus` untuk Admin:**
    *   **Kebutuhan:** Diputuskan bahwa hanya pengguna dengan peran 'Admin' yang boleh mengubah status pesanan secara manual.
    *   **Implementasi:**
        *   Membuat `roles.decorator.ts` dan `roles.guard.ts` di dalam `order-service` untuk menyediakan fungsionalitas RBAC.
        *   Mendaftarkan `RolesGuard` sebagai *provider* di `order-management.module.ts`.
        *   Menerapkan decorator `@Roles('Admin')` dan `@UseGuards(RolesGuard)` pada metode `updateStatus` di `order.controller.ts`.
    *   **Hasil:** Endpoint `PUT /api/order-service/orders/:id/status` sekarang terlindungi dan hanya akan berhasil jika dipanggil oleh pengguna yang memiliki peran 'Admin'. Pengguna biasa akan menerima error `403 Forbidden`.

---

### Perubahan 7 November 2025 (Sesi 4)

**Layanan: Order Service**

**Tujuan:** Menyempurnakan alur kerja dan keamanan terkait pembatalan dan penghapusan pesanan.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Pengamanan Endpoint Hapus Pesanan (`DELETE /orders/:id`):**
    *   **Kebutuhan:** Sesuai diskusi, penghapusan permanen data pesanan harus dibatasi hanya untuk Admin demi integritas data.
    *   **Implementasi:** Menerapkan decorator `@Roles('Admin')` dan `@UseGuards(RolesGuard)` pada metode `remove` di `order.controller.ts`.
    *   **Hasil:** Pengguna biasa tidak bisa lagi menghapus riwayat pesanannya.

2.  **Penambahan Fitur Pembatalan Pesanan oleh Pengguna:**
    *   **Kebutuhan:** Memberikan pengguna kemampuan untuk membatalkan pesanannya sendiri tanpa menghapus data secara permanen.
    *   **Implementasi:**
        *   Membuat endpoint baru: `PUT /orders/:id/cancel`.
        *   Membuat metode `cancelOrder` di `order.controller.ts` dan `order.service.ts`.
        *   Logika di service memastikan hanya pemilik pesanan yang bisa membatalkan, dan hanya jika statusnya belum `completed` atau `cancelled`.
        *   Saat pesanan dibatalkan, stok produk yang dipesan akan dikembalikan secara otomatis.

---

**PENGINGAT LOGGING:**
SETIAP perubahan pada SATU file akan SELALU dicatat di `logsementara.md`. Catatan akan menyertakan tanggal dan detail perubahan untuk memastikan riwayat kerja yang transparan dan meminimalkan error.
---

### Perubahan 10 November 2025

**Layanan: Payment Service**

**Tujuan:** Memperbaiki berbagai masalah terkait otentikasi, otorisasi, validasi, dan format respons API.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Otentikasi & Otorisasi:**
    *   **Instalasi Dependensi:** Menambahkan `@nestjs/jwt`, `@nestjs/passport`, `passport`, dan `passport-jwt` ke `payment-service`.
    *   **Konfigurasi JWT:** Menambahkan `JWT_SECRET=secretrahasia1234567890` ke `.env` dan mengkonfigurasi `JwtModule` di `payment.module.ts`.
    *   **Modul Auth:** Membuat direktori `src/payment/auth` dengan `jwt-auth.guard.ts` (yang kemudian di-refactor), `jwt.strategy.ts`, dan `roles.decorator.ts`.
    *   **Penerapan Guard:** Menerapkan `@UseGuards(JwtAuthGuard)` pada `PaymentController`.
    *   **Pengambilan `userId` dari Token:** Mengubah metode `create` di `PaymentController` untuk mengambil `userId` dari payload JWT (`req.user.id`).
    *   **Validasi Kepemilikan:** Menambahkan logika di `PaymentController` untuk memastikan pengguna hanya dapat mengakses/membuat pembayaran untuk pesanan mereka sendiri (`findByPaymentId`, `findByUserId`).

2.  **Validasi Input:**
    *   **Enum `PaymentMethod`:** Membuat `src/payment/enum/payment-method.enum.ts` dengan nilai `BANK_TRANSFER`, `CREDIT_CARD`, `E_WALLET`.
    *   **`CreatePaymentDto`:** Mengubah `method` menjadi `@IsEnum(PaymentMethod)` dan menghapus `userId` (karena diambil dari token).

3.  **Format Respons API (Serialisasi):**
    *   **Interceptor Kustom:** Membuat `src/payment/mongoose-class-serializer.interceptor.ts` untuk menangani serialisasi dokumen Mongoose.
    *   **`PaymentResponseDto`:**
        *   Awalnya menggunakan `@Transform` untuk mengubah `_id` menjadi `id`.
        *   Kemudian disederhanakan menjadi `@Expose()` saja setelah perbaikan skema.
    *   **`PaymentSchema`:** Menambahkan opsi `toJSON` dan `toObject` dengan `virtuals: true` dan mendefinisikan *virtual property* `id` yang mengembalikan `_id.toHexString()`. Ini adalah solusi yang lebih robust untuk transformasi `_id` ke `id`.
    *   **`PaymentService`:** Mengubah metode `create` untuk mengembalikan Mongoose Document secara langsung (`savedPayment`) agar interceptor dapat bekerja dengan benar.

4.  **Komunikasi Antar-Service:**
    *   **Penghapusan Variabel Lingkungan:** Menghapus `API_PREFIX`, `USER_SERVICE_URL`, `ORDER_SERVICE_URL`, dan `PRODUCT_SERVICE_URL` dari `.env` (kecuali `ORDER_SERVICE_URL` yang kemudian di-hardcode).
    *   **Hardcode URL Service:** Mengubah `PaymentService` untuk meng-hardcode `orderServiceUrl` (`http://localhost:8002`) dan menghapus dependensi `ConfigService` untuk URL ini.
    *   **Penerusan Token:** Mengubah `PaymentController` dan `PaymentService` untuk meneruskan `Authorization` header (token JWT) saat memanggil `order-service`. Ini mengatasi error `403 Forbidden` sebelumnya.
    *   **Endpoint Konfirmasi Pembayaran Baru:**
        *   **`order-service`:** Menambahkan endpoint `PUT /orders/:id/confirm-payment` di `order.controller.ts` dan metode `confirmPayment` di `order.service.ts`. Endpoint ini hanya mengubah status dari `pending` ke `processing` dan tidak memerlukan peran Admin.
        *   **`payment-service`:** Mengubah `PaymentService` untuk memanggil endpoint `/confirm-payment` yang baru ini, bukan endpoint `/status` yang Admin-only.

5.  **Perbaikan Error TypeScript:**
    *   **`PaymentSchema`:** Menambahkan `createdAt: Date;` dan `updatedAt: Date;` secara eksplisit ke skema untuk mengatasi error TypeScript.
    *   **`PaymentService`:** Mengoreksi tipe kembalian metode (`create`, `findByUserId`, `findByPaymentId`) menjadi `Promise<Payment>` atau `Promise<Payment[]>` dan menghapus *type assertions* yang salah.
    *   **`PaymentController`:** Mengoreksi tipe kembalian metode (`create`, `findByPaymentId`, `findByUserId`) menjadi `Promise<Payment>` atau `Promise<Payment[]>` untuk menyelaraskan dengan service dan interceptor.

---

### Perubahan 11 November 2025

**Layanan: Payment Service**

**Tujuan:** Menambahkan fungsionalitas admin untuk melihat dan mengelola status pembayaran.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Implementasi `RolesGuard`:**
    *   Membuat `src/payment/auth/roles.guard.ts` untuk mengaktifkan kontrol akses berbasis peran.
    *   Mendaftarkan `RolesGuard` sebagai provider di `payment.module.ts`.

2.  **Endpoint `GET /payments/all` (Admin Only):**
    *   Menambahkan metode `findAll()` ke `payment.service.ts` untuk mengambil semua pembayaran.
    *   Menambahkan endpoint `GET /payments/all` ke `payment.controller.ts`, dilindungi oleh `@UseGuards(RolesGuard)` dan `@Roles('Admin')`.

3.  **Endpoint `PUT /payments/:id/status` (Admin Only):**
    *   Membuat `src/payment/enum/payment-status.enum.ts` dengan status `PENDING`, `SUCCESS`, `FAILED`.
    *   Membuat `src/payment/dto/update-payment-status.dto.ts` untuk validasi input status.
    *   Menambahkan metode `updateStatus()` ke `payment.service.ts` untuk memperbarui status pembayaran.
    *   Menambahkan endpoint `PUT /payments/:id/status` ke `payment.controller.ts`, dilindungi oleh `@UseGuards(RolesGuard)` dan `@Roles('Admin')`.

4.  **Peningkatan Endpoint yang Ada (Admin Override):**
    *   Memodifikasi `findByPaymentId` dan `findByUserId` di `payment.controller.ts` untuk memungkinkan pengguna dengan peran 'Admin' melihat data pembayaran apa pun, bukan hanya milik mereka sendiri.

---

## Crosscheck Services

### User Service
- **Refactor Service**: Menyederhanakan `UsersService` dengan menghapus transformasi data manual (`plainToInstance` dan `.lean()`). Service sekarang mengembalikan objek Mongoose mentah, dan tugas serialisasi diserahkan sepenuhnya kepada Interceptor di Controller.
- **Refactor Controller**: Memperbarui `UsersController` untuk menggunakan `MongooseClassSerializerInterceptor` secara konsisten. Tipe data kembalian pada method `findAll()` dan `findById()` diubah menjadi `Promise<User[]>` dan `Promise<User>` untuk mencerminkan bahwa mereka mengembalikan model Mongoose asli.
- **Optimasi Skema**: Menambahkan virtual `id` dan transformasi `toJSON` pada `UserSchema` untuk memastikan output API konsisten (mengubah `_id` menjadi `id` dan menghapus `__v`).
- **Verifikasi Validasi**: Memastikan bahwa `ValidationPipe` sudah diterapkan secara global di `main.ts`, sehingga validasi DTO berjalan sesuai harapan.

---

### Perubahan 17 November 2025

**Layanan: User Service**

**Tujuan:** Menambahkan fungsionalitas baru yang krusial (Manajemen Alamat & Reset Password), memperbaiki serangkaian bug, dan melakukan refactoring untuk meningkatkan kualitas kode.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Fitur Baru: Manajemen Alamat Pengguna:**
    *   **Skema:** Menambahkan `Address` sebagai sub-dokumen di `UserSchema`.
    *   **API:** Menambahkan serangkaian endpoint di `/profile/addresses` untuk menambah (`POST`), melihat (`GET`), memperbarui (`PUT`), dan menghapus (`DELETE`) alamat.
    *   **API Default:** Menambahkan endpoint `PUT /profile/addresses/:addressId/default` untuk menyetel alamat utama.

2.  **Fitur Baru: Reset Password:**
    *   **Skema:** Menambahkan field `resetPasswordToken` dan `resetPasswordExpires` di `UserSchema`.
    *   **API:**
        *   `POST /forgot-password`: Memulai proses lupa password, menghasilkan token, dan mensimulasikan pengiriman email di konsol.
        *   `POST /reset-password`: Menyelesaikan proses dengan menyetel password baru menggunakan token yang valid.

3.  **Perbaikan Bug & Refactoring:**
    *   **Refactoring DTO:** Memecah `address.dto.ts` yang ambigu menjadi `address-create.dto.ts` dan `address-update.dto.ts` untuk kejelasan. File `address.dto.ts` yang usang telah dihapus.
    *   **Perbaikan Validasi Sub-dokumen (Kritis):** Mengganti pola `read-modify-save` yang rawan error dengan operasi atomik MongoDB (`findOneAndUpdate` dengan `$set` dan `updateOne` dengan `$pull`) untuk `updateAddress`, `setDefaultAddress`, dan `removeAddress`. Ini memperbaiki bug validasi Mongoose yang persisten saat mengupdate sub-dokumen.
    *   **Integritas Alamat Default:** Menambahkan logika di `addAddress` dan `updateAddress` untuk memastikan hanya ada satu alamat yang bisa menjadi `default` pada satu waktu.
    *   **Pencegahan Penghapusan Alamat Default:** Menambahkan validasi di `removeAddress` untuk mencegah pengguna menghapus alamat yang sedang menjadi default.

4.  **Keamanan:**
    *   **Verifikasi `RolesGuard`:** Mengkonfirmasi bahwa `JwtAuthGuard` yang ada sudah memiliki logika pengecekan peran (`@Roles`) yang terintegrasi, sehingga tidak perlu membuat guard terpisah.
    *   **Penerapan Otorisasi:** Menerapkan decorator `@Roles(admin)` pada endpoint khusus admin (`GET /all`, `GET /:id`, `PUT /:id`, `DELETE /:id`) untuk memastikan hanya admin yang bisa mengakses.

5.  **Clean Code:**
    *   **Dokumentasi:** Memperbarui dokumentasi `GEMINI.md` untuk `user-service` agar sesuai dengan kondisi terbaru.
    *   **Pembersihan Kode:** Menghapus `import` dan komentar yang tidak perlu dari `users.controller.ts` dan `users.service.ts`.

---

### Perubahan 18 November 2025

**Layanan: User Service**

**Tujuan:** Melakukan refactoring pada alur "Reset Password" agar lebih intuitif.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Refactor Alur Reset Password:**
    *   **Masalah:** Endpoint `reset-password` sebelumnya menerima `token` di dalam *body* JSON, yang kurang intuitif bagi frontend.
    *   **Perbaikan:**
        *   Endpoint diubah dari `POST /reset-password` menjadi `POST /reset-password/:token`.
        *   `reset-password.dto.ts` disederhanakan dan sekarang hanya berisi `password`.
        *   `users.controller.ts` dan `users.service.ts` disesuaikan untuk mengambil token dari parameter URL.
        *   Simulasi email di `forgotPassword` diperbarui untuk menghasilkan URL dengan format yang benar.
    *   **Hasil:** Alur kerja frontend menjadi lebih sederhana; cukup ambil token dari URL dan kirim password baru di dalam *body*.

---

### Perbaikan `product-service` (Sesi 1 - 18 November 2025)

**Layanan: Product Service (Bagian: Products)**

**Tujuan:** Memperbaiki temuan dari hasil analisis.

**Status:** Berjalan

**Ringkasan Perubahan:**

1.  **Perbaikan Logika Gambar Produk (Kritis):**
    *   **Masalah:** Fitur gambar produk tidak berfungsi karena `imageUrl` dari DTO tidak disimpan dengan benar ke dalam array `images` di database.
    *   **Perbaikan:** Mengubah metode `create` di `products.service.ts` untuk secara eksplisit memetakan `imageUrl` ke dalam array `images` saat produk baru dibuat.
    *   **Hasil:** Gambar produk sekarang akan tersimpan dengan benar dan dapat ditampilkan melalui API.

---

### Perbaikan `product-service` (Sesi 2 - 18 November 2025)

**Layanan: Product Service (Bagian: Category & Products)**

**Tujuan:** Memperbaiki temuan dari hasil analisis.

**Status:** SELESAI

**Ringkasan Perubahan:**

2.  **Pencegahan Duplikasi Nama Kategori (`Category`)**:
    *   **Masalah:** Logika `update` pada `category.service.ts` tidak memeriksa apakah nama kategori yang baru sudah ada, sehingga memungkinkan adanya duplikasi nama.
    *   **Perbaikan:** Menambahkan validasi pada metode `update` untuk memastikan nama kategori yang baru tidak sama dengan nama kategori lain yang sudah ada. Tipe DTO pada metode juga diperbaiki untuk konsistensi.
    *   **Hasil:** Integritas data kategori terjaga; tidak akan ada dua kategori dengan nama yang sama.

3.  **Penguatan Logika Update Stok (`Products`)**:
    *   **Masalah:** Metode `updateStock` menggunakan pola "baca-lalu-tulis" yang rentan terhadap *race condition*, di mana stok bisa menjadi tidak akurat jika ada banyak permintaan bersamaan.
    *   **Perbaikan:** Mengganti logika `updateStock` untuk menggunakan operasi atomik `findOneAndUpdate` dengan operator `$inc`. Untuk pengurangan stok, ditambahkan kondisi `stock: { $gte: quantity }` langsung di dalam *query* untuk memastikan stok cukup sebelum operasi dilakukan.
    *   **Hasil:** Proses update stok sekarang aman dari *race condition*, mencegah overselling, dan lebih efisien.

4.  **Implementasi DTO untuk `updateStock`**:
    *   **Masalah:** Endpoint `updateStock` tidak menggunakan DTO, sehingga melewatkan validasi input otomatis dari NestJS.
    *   **Perbaikan:**
        *   Membuat file `update-stock.dto.ts` dengan validasi untuk `quantity` (harus angka positif) dan `type` (harus 'increase' atau 'decrease').
        *   Mengubah `products.controller.ts` dan `products.service.ts` untuk menggunakan `UpdateStockDto`.
    *   **Hasil:** Endpoint `updateStock` sekarang lebih aman karena input dari client divalidasi secara otomatis.

5.  **Pembersihan dan Konsistensi Kode**:
    *   **Masalah:** Ditemukan beberapa inkonsistensi: penamaan properti di `ProductResponseDto` dan `ReviewResponseDto` yang tidak jelas, `constructor` yang tidak digunakan di DTO, dan nilai kembalian yang tidak perlu di `ReviewService`.
    *   **Perbaikan:**
        *   Mengganti nama properti di `ProductResponseDto` (`category` -> `categoryName`) dan `ReviewResponseDto` (`product` -> `productId`) agar lebih jelas.
        *   Menghapus semua `constructor` yang tidak perlu dari file DTO terkait.
        *   Mengubah metode `remove` di `review.service.ts` agar mengembalikan `Promise<void>` dan menggunakan `deleteOne` yang lebih efisien.
    *   **Hasil:** Kode menjadi lebih bersih, konsisten, dan sedikit lebih optimal.

6.  **Perbaikan Regresi: `categoryName` Hilang pada Respons Produk**:
    *   **Masalah:** Perubahan sebelumnya menyebabkan properti `categoryName` hilang dari respons API produk.
    *   **Perbaikan:** Mengembalikan logika transformasi di `response-product.dto.ts` menggunakan decorator `@Transform`. Logika ini secara eksplisit mengambil nama kategori dari objek `categoryId` yang telah di-populate oleh service.
    *   **Hasil:** Properti `categoryName` sekarang akan muncul kembali dengan benar di respons JSON untuk produk.

7.  **Perbaikan `categoryName` Bernilai `null`**:
    *   **Masalah:** Setelah perbaikan sebelumnya, `categoryName` muncul di respons API tetapi nilainya selalu `null`. Ini disebabkan oleh konflik antara decorator `@Transform` dan cara Mongoose melakukan `populate`.
    *   **Perbaikan:** Mengubah `response-product.dto.ts` untuk memanfaatkan *virtual property* `category` yang sudah ada di `product.schema.ts`. Decorator `@Transform` dihapus dan diganti dengan `@Expose({ name: 'category' })` pada properti `categoryName`.
    *   **Hasil:** DTO sekarang mengambil nama kategori dari *virtual property* skema, menghasilkan solusi yang lebih bersih dan fungsional. `categoryName` sekarang akan berisi nama kategori yang benar.

8.  **Perbaikan Serialisasi `productId` pada Respons Review**:
    *   **Masalah:** Endpoint `GET /products/:productId/reviews` mengembalikan `productId` sebagai objek `Buffer` mentah, bukan string ID yang bersih.
    *   **Perbaikan:** Menyesuaikan `review-response.dto.ts`. Decorator pada properti `productId` diubah menjadi `@Expose({ name: 'product' })`. Ini memetakan nilai dari *virtual property* `product` (yang sudah ada di `review.schema.ts` dan berisi ID string) ke properti `productId` di respons JSON.
    *   **Hasil:** Respons API untuk review sekarang menampilkan `productId` sebagai string heksadesimal yang benar.

9.  **Perbaikan Penamaan Properti Virtual `productId` pada Review**:
    *   **Masalah:** Pengguna merasa penamaan properti virtual `product` di skema review kurang intuitif dan ingin agar sesuai dengan `productId` di DTO.
    *   **Perbaikan:**
        *   Di `review.schema.ts`, nama *virtual property* diubah dari `product` menjadi `productId`.
        *   Di `review-response.dto.ts`, decorator `@Expose({ name: 'product' })` pada properti `productId` diubah menjadi `@Expose()` saja, karena nama properti virtual di skema sekarang sudah cocok.
    *   **Hasil:** Respons API untuk review sekarang menampilkan `productId` sebagai string yang bersih, dan penamaan properti lebih konsisten.

10. **Revert Perubahan Nama Properti Virtual `productId`**:
    *   **Masalah:** Perubahan sebelumnya (mengubah nama properti virtual menjadi `productId`) menyebabkan service crash dengan error `Virtual path "productId" conflicts with a real path in the schema`.
    *   **Perbaikan:** Mengembalikan perubahan ke kondisi sebelumnya yang stabil.
        *   Di `review.schema.ts`, nama *virtual property* dikembalikan dari `productId` menjadi `product`.
        *   Di `review-response.dto.ts`, decorator dikembalikan menjadi `@Expose({ name: 'product' })` untuk mencocokkan nama properti virtual di skema.
    *   **Hasil:** Error Mongoose teratasi dan service dapat berjalan kembali.

11. **Pembaruan Dokumentasi `GEMINI.md` untuk `product-service`**:
    *   **Tujuan:** Mengintegrasikan semua perubahan, perbaikan, dan detail implementasi `product-service` ke dalam dokumentasi utama proyek.
    *   **Perubahan:**
        *   Bagian "Ringkasan Perbedaan & Potensi Masalah" diperbarui untuk menandai `product-service` sebagai **RESOLVED**.
        *   Bagian "Detail Implementasi per Layanan" untuk `product-service` ditulis ulang secara komprehensif, mencakup:
            *   Status **SELESAI**.
            *   Fungsi utama.
            *   Daftar lengkap Controllers dan Endpoints (dengan hak akses).
            *   Daftar Services dan fungsinya.
            *   Daftar DTOs dan strukturnya.
            *   Daftar Schemas dan *virtual properties*-nya.
            *   Catatan penting mengenai keamanan, serialisasi respons, penanganan gambar, validasi kategori, update stok atomik, validasi review, dan otorisasi review.
    *   **Hasil:** Dokumentasi `GEMINI.md` kini mencerminkan status dan implementasi `product-service` yang paling mutakhir.

---

### Perbaikan Product Service (Sesi 1 - 21 November 2025)

**Layanan: Product Service**

**Tujuan:** Melakukan analisis akhir, menerapkan *clean code*, dan menambahkan fitur baru berdasarkan diskusi.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Fitur Baru: Pencegahan Hapus Kategori:**
    *   **Masalah:** Admin dapat menghapus kategori yang masih memiliki produk, menyebabkan data produk menjadi "yatim".
    *   **Perbaikan:** Logika ditambahkan pada `category.service.ts` untuk memeriksa apakah ada produk yang terkait dengan kategori sebelum menghapusnya. Jika ada, proses dibatalkan dengan error `400 Bad Request`.

2.  **Fitur Baru: Soft Deletion untuk Produk:**
    *   **Masalah:** Menghapus produk akan menghilangkannya secara permanen dari database, merusak integritas data riwayat pesanan.
    *   **Perbaikan:**
        *   Menambahkan field `status` pada `ProductSchema`.
        *   Mengubah metode `remove` di `products.service.ts` untuk mengubah `status` produk menjadi `archived` (diarsipkan), bukan menghapusnya.
        *   Mengubah semua metode `find` (`findAll`, `getProductById`, `findAllByCategory`) untuk hanya menampilkan produk dengan status `active` atau yang belum memiliki status (untuk kompatibilitas data lama).

3.  **Fitur Baru: Get Products by Category:**
    *   Menambahkan endpoint baru `GET /categories/:categoryId/products` untuk mengambil semua produk dalam satu kategori spesifik.
    *   Logika diimplementasikan di `products.service.ts` dan `category.controller.ts`.

4.  **Refactoring & Clean Code:**
    *   **`products.controller.ts`**: Mengubah pesan respons `DELETE /products/:id` menjadi "Produk berhasil diarsipkan". Menambahkan `async` pada metode `updateStock` untuk konsistensi.
    *   **`category.controller.ts`**: Menghapus dekorator `@UseInterceptors` yang redundan dari level method karena sudah diterapkan di level class.
    *   **`products.service.ts`**: Melakukan refactoring besar pada metode `updateStock` untuk logika yang lebih jelas, penanganan error yang lebih baik, dan mengubah tipe kembalian menjadi `Promise<ProductDocument>` agar konsisten.
    *   **`products.controller.ts` (lanjutan)**: Menyesuaikan metode `updateStock` untuk menangani tipe kembalian baru dari service dan menerapkan `ProductResponseDto` untuk output yang konsisten.
    *   **`category.service.ts` & `review.service.ts`**: Menyederhanakan metode `create` untuk menggunakan `this.model.create()` yang lebih ringkas.
    *   **`review.service.ts`**: Menyederhanakan metode `remove` dengan menghapus pengecekan `deletedCount` yang redundan.

5.  **Pembaruan Dokumentasi Testing:**
    *   Memperbarui `testing_fix2.md` untuk mencerminkan perubahan respons pada `DELETE /products/:id` dan `PUT /products/:id/stock`.
    *   Menambahkan kasus uji baru untuk endpoint `GET /categories/:categoryId/products`.

---

## Order Service - Finalisasi & Perbaikan Bug Stok

- **Tanggal:** 24 November 2025
- **Tujuan:** Memastikan semua fitur `order-service` berfungsi penuh, termasuk penguncian harga, snapshot pesanan, nomor pesanan, dan perbaikan bug stok.
- **Status:** SELESAI
- **Ringkasan Perbaikan:**
    1.  **Perbaikan Serialisasi DTO (`order-response.dto.ts`):**
        -   Memastikan `OrderResponseDto` mengekspos semua field yang diperlukan (`orderNumber`, `productName`, `productImageUrl`, `shippingAddress`).
    2.  **Perbaikan Serialisasi Nested Schema (`order.schema.ts`):**
        -   Menambahkan opsi `toJSON` dan `toObject` ke skema `OrderItem` dan `ShippingAddress` untuk memastikan sub-dokumen ini diserialisasi dengan benar.
    3.  **Perbaikan Bug Stok (`product-service` & `order-service`):**
        -   **Analisis:** Ditemukan bahwa `order-service` gagal mengurangi stok karena endpoint `PUT /products/:id/stock` di `product-service` dilindungi oleh `@Roles('Admin')`. Panggilan gagal secara diam-diam karena blok `try...catch` di `order.service.ts`.
        -   **Solusi di `product-service`:** Menambahkan endpoint internal baru `PUT /products/:id/internal/stock` yang tidak memerlukan otorisasi Admin, khusus untuk komunikasi antar-service.
        -   **Solusi di `order-service`:** Mengubah method `updateProductStock` untuk memanggil endpoint internal yang baru (`/internal/stock`) dan menghapus blok `try...catch` yang menyembunyikan error, sehingga kegagalan akan langsung terlihat.
    4.  **Verifikasi Akhir:** Semua fitur `order-service` (penguncian harga di keranjang, standarisasi output wishlist, snapshot pesanan, nomor pesanan, pengosongan keranjang otomatis, dan pengurangan stok) telah diverifikasi berfungsi dengan benar.

---

## Payment Service - Rencana Perbaikan (Revisi & Final)

- **Tanggal:** 25 November 2025
- **Tujuan:** Memperbaiki `payment-service` agar konsisten, aman, dan fungsional sesuai standar proyek.
- **Status:** Direncanakan

### Rencana Perbaikan

1.  **Rapikan DTO**:
    *   Hapus file `payment-service/src/payment/dto/response-payment.dto.ts`.
    *   Pastikan `PaymentResponseDto` dari `payment-response.dto.ts` digunakan sebagai satu-satunya DTO untuk output.

2.  **Perbaiki Skema dengan Enum**:
    *   Buat file `payment-service/src/payment/enum/payment-status.enum.ts` yang berisi `export enum PaymentStatus { PENDING = 'pending', SUCCESS = 'success', FAILED = 'failed' }`.
    *   Buat file `payment-service/src/payment/enum/payment-method.enum.ts`.
    *   Perbarui `payment.schema.ts` agar `status` dan `method` menggunakan `enum` tersebut.
    *   Perbarui DTO (`CreatePaymentDto`, `UpdatePaymentStatusDto`) untuk menggunakan `enum` ini juga, memanfaatkan `class-validator` (`@IsEnum`).

3.  **Perbaiki Controller & Service**:
    *   **Hapus Endpoint Lama**: Hapus endpoint `GET /user/:userId`.
    *   **Buat Endpoint Baru**: Tambahkan endpoint `GET /me` yang memanggil service `paymentService.findMyPayments(req.user.id)`.
    *   **Pindahkan Logika Otorisasi**: Pindahkan pengecekan `userId` dan `role` dari `PaymentController` ke dalam `PaymentService` untuk metode `findOne` dan `create`.
    *   **Sederhanakan Nama Fungsi**: Ubah nama fungsi di controller dari `findByPaymentId` menjadi `findOne` agar lebih standar.

4.  **Pastikan Interceptor Aktif**: Verifikasi bahwa `MongooseClassSerializerInterceptor` sudah diterapkan di `PaymentController`.

5.  **Update Dokumentasi**: Setelah semua kode diperbaiki, perbarui `GEMINI.md` untuk mencerminkan struktur `payment-service` yang final dan akurat.

---
### Perubahan 7 Desember 2025

**Layanan: BFF Web**

**Tujuan:** Mengimplementasikan fitur "Product Review" termasuk validasi pembelian dan kemampuan melihat ulasan sendiri.

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Pembaruan Impor:** Menambahkan `ForbiddenException` ke impor dari `@nestjs/common` di `bff-web/src/bff/bff.service.ts`.
2.  **Pembaruan Konfigurasi Layanan:** Menambahkan URL `payment` service ke objek `services` di `bff-web/src/bff/bff.service.ts`.
3.  **Implementasi `createReview`:**
    *   Menambahkan logika validasi pembelian dengan memanggil endpoint `order-service` `GET /orders/check-product-purchase?productId=...`.
    *   Jika produk belum dibeli, melempar `ForbiddenException`.
    *   Jika sudah dibeli, melanjutkan untuk membuat ulasan melalui `product-service` `POST /products/:productId/reviews`.
4.  **Implementasi `getMyReviews`:**
    *   Menambahkan metode untuk mengambil semua ulasan yang dibuat oleh pengguna yang sedang login dari `product-service` `GET /products/reviews/me`.

**Langkah Selanjutnya:**

1.  Uji fitur "Product Reviews" pada `bff-web` menggunakan instruksi yang telah disediakan.

---
### Perubahan 9 Desember 2025

**Layanan: BFF Web**

**Tujuan:** Menyelesaikan implementasi dan verifikasi fitur "Product Review".

**Status:** SELESAI

**Ringkasan Perubahan:**

1.  **Verifikasi `createReview`:** Fitur pembuatan ulasan dengan validasi pembelian telah berhasil diuji. Pengguna hanya dapat membuat ulasan untuk produk yang pesanannya telah berstatus `completed`.
2.  **Verifikasi `getMyReviews`:** Fitur untuk melihat semua ulasan yang dibuat oleh pengguna yang sedang login telah berhasil diuji dan mengembalikan data yang benar.
3.  **Pembaruan Dokumentasi `GEMINI.md`:**
    *   Memperbarui bagian "Ringkasan Perbedaan & Potensi Masalah" untuk menandai `bff-web` sebagai **RESOLVED**.
    *   Memperbarui bagian "Detail Implementasi per Layanan" untuk `bff-web` dengan menambahkan informasi tentang endpoint dan fungsionalitas ulasan produk yang baru.

---

# Log Proyek: Evolusi Arsitektur Microservices

## LOG02102025: Arsitektur Awal (Sebelum Merging)

*Catatan: Pada tahap ini, otentikasi JWT belum diimplementasikan di seluruh layanan.*

---

### 1. User Service (5500)
- **Koleksi DB**: `users`
- **Contoh Dokumen**:
```json
{
  "_id": "68886ebc0a5ea5f4dec36ab9",
  "username": "sherlylily04",
  "fullname": "Sherly Septiani",
  "email": "sherlylily04@gmail.com",
  "password": "$2b$10$MX98.8aBJw8q55UrUCAWudEjmsooZtGgbdSO1Hf6RAHSC0q772Wi",
  "phoneNumber": "088233736987",
  "roles": "user"
}
```
- **Fungsionalitas**:
    1. Register / Create Account (dengan proteksi duplikasi email/username).
    2. Login (dengan proteksi blokir setelah 3x gagal).
    3. Update akun (membedakan update data biasa dan password).
    4. Delete akun.
    5. Get all akun.
    6. Get akun berdasarkan token.
    7. Get akun berdasarkan ID.

### 2. Product Service (5501)
- **Koleksi DB**: `products`
- **Contoh Dokumen**:
```json
{
  "_id": "6861855bee6ea83f81b834f7",
  "name": "Lipstik Matte Rose Red",
  "price": 75000,
  "stock": 100,
  "description": "Lipstik matte dengan warna rose red tahan lama, cocok untuk acara form…",
  "category": "kosmetik",
  "imageUrl": "https://example.com/images/lipstik-matte.jpg",
  "createdAt": "2025-06-29T18:26:35.232Z",
  "updatedAt": "2025-06-29T18:26:35.232Z"
}
```
- **Fungsionalitas**:
    1. Buat produk baru.
    2. Mendapatkan semua produk.
    3. Mendapatkan produk berdasarkan ID.
    4. Update produk berdasarkan ID.
    5. Menghapus produk berdasarkan ID.
    6. Update stok produk berdasarkan ID.

### 3. Review & Rating Service (5502)
- **Koleksi DB**: `reviews`
- **Contoh Dokumen**:
```json
{
  "_id": "686208962dcb64ba2b11b9f5",
  "productId": "6660fa02e1d8a9d82d712345",
  "userId": "665ffcf9aa18e0cdd2e21234",
  "rating": 3,
  "comment": "Jelek bgt",
  "imageUrl": "https://example.com/images/review1.jpg",
  "createdAt": "2025-06-30T03:46:30.852Z",
  "updatedAt": "2025-06-30T03:46:30.852Z"
}
```
- **Fungsionalitas**:
    1. Buat review.
    2. Mendapatkan review suatu produk.
    3. Hapus suatu review berdasarkan ID.

### 4. Cart Service (5503)
- **Koleksi DB**: `carts`
- **Fungsionalitas**:
    1. Tambah produk di keranjang (dengan proteksi kuantitas).
    2. Mendapatkan produk di keranjang berdasarkan user ID.
    3. Update kuantitas produk di keranjang (increase & decrease).
    4. Menghapus produk di keranjang.

### 5. Order Service (5504)
- **Koleksi DB**: `orders`
- **Contoh Dokumen**:
```json
{
  "_id": "686546f8f6504a052154dee6",
  "userId": "685ec2c96fb0febc72f2b67b",
  "productId": "686184354cbd5efd3bab527d",
  "quantity": 2,
  "price": 95000,
  "total": 190000,
  "status": "pending",
  "createdAt": "2025-07-02T14:49:28.971Z",
  "updatedAt": "2025-07-02T14:49:28.971Z"
}
```
- **Fungsionalitas**:
    1. Validasi produk dan user ke database lain.
    2. Ambil detail produk untuk diolah saat membuat order.
    3. Create order (dengan proteksi stok, user, dll).
    4. Get all order.
    5. Get order by ID.
    6. Mencari order berdasarkan user.
    7. Update status pesanan.
    8. Cancel pesanan (update status dan kembalikan stok).

### 6. Wishlist Service (5505)
- **Koleksi DB**: `wishlists`
- **Contoh Dokumen**:
```json
{
  "_id": "686388e91c2fab4d432fdaa2",
  "userId": "685ec230cbf38784a3742f7c",
  "productId": "6861855bee6ea83f81b834f7",
  "createdAt": "2025-07-01T07:06:17.849Z",
  "updatedAt": "2025-07-01T07:06:17.849Z"
}
```
- **Fungsionalitas**:
    1. Buat wishlist (dengan proteksi duplikasi).
    2. Menemukan wishlist berdasarkan user.
    3. Hapus wishlist berdasarkan ID.

### 7. Payment Service (5506)
- **Koleksi DB**: `payments`
- **Contoh Dokumen**:
```json
{
  "_id": "68714d9b96e0ca8fd0a3223a",
  "orderId": "64a1b2c3d4e5f6g7h8i9j0kl",
  "amount": 250000,
  "method": "transfer_bank",
  "status": "pending",
  "createdAt": "2025-07-11T17:44:59.584Z",
  "updatedAt": "2025-07-11T17:44:59.584Z"
}
```
- **Fungsionalitas**:
    1. Buat payment (cek order, update status order & payment).
    2. Menemukan payment dari user ID.
    3. Menemukan order berdasarkan ID.

### 8. Category Service (5508)
- **Koleksi DB**: `categories`
- **Contoh Dokumen**:
```json
{
  "_id": "68887ad62020a91043854996",
  "name": "Kesehatan & Kecantikan",
  "description": "Produk skincare, makeup, dan alat kesehatan",
  "createdAt": "2025-07-29T07:40:06.421Z",
  "updatedAt": "2025-07-29T07:40:06.421Z"
}
```
- **Fungsionalitas**:
    1. Buat kategori (dengan proteksi duplikasi).
    2. Mendapatkan semua kategori.
    3. Update kategori.
    4. Menemukan kategori berdasarkan ID.
    5. Hapus kategori.

====================================================================================================
====================================================================================================

## LOG06102025: Arsitektur Saat Ini (Setelah Merging)

*Catatan: Berdasarkan analisis kode. Otentikasi JWT ada di `user-service`. Layanan `Review & Rating`, `Cart`, `Wishlist`, dan `Category` telah dihapus dan fungsionalitasnya digabungkan.*

---

### 1. User Service (http://localhost:8001)
- **Koleksi DB**: `users`
- **Contoh Dokumen (berdasarkan Schema)**:
```json
{
  "username": "sherlylily_new",
  "fullname": "Sherly Septiani",
  "email": "sherly.new@gmail.com",
  "password": "hashed_password",
  "phoneNumber": "081234567890",
  "role": "user",
  "loginAttempts": 0
}
```
- **Fungsionalitas**:
    1. **Register**: Proteksi jika email atau username sudah digunakan.
    2. **Login**: Memberikan token JWT dan memiliki proteksi blokir akun jika 3x gagal login.
    3. **Update**: Logika update yang aman, membedakan update data biasa dan password (wajib menyertakan `oldPassword`), serta proteksi duplikasi username.
    4. **Read/Delete Berdasarkan ID**: `GET /users/all`, `GET /users/:id`, `DELETE /users/:id`.
    5. **[HILANG]**: Fungsionalitas berdasarkan token (Read/Delete my account) dan proteksi role untuk admin (`GET /users/all` bisa diakses siapa saja).

---

### 2. Order Service (http://localhost:8002)
- **Koleksi DB**: `carts`, `orders`, `wishlists`
- **Contoh Dokumen**:
  - **`carts`**:
    ```json
    {
      "userId": "user_id_123",
      "productId": "product_id_456",
      "quantity": 2
    }
    ```
  - **`orders`**:
    ```json
    {
      "userId": "user_id_123",
      "items": [
        { "productId": "product_id_456", "quantity": 2, "price": 75000 }
      ],
      "totalAmount": 150000,
      "status": "pending",
      "paymentId": "payment_id_789"
    }
    ```
  - **`wishlists`**:
    ```json
    {
      "userId": "user_id_123",
      "productId": "product_id_456"
    }
    ```
- **Fungsionalitas**:
    1. **CRUD Dasar**: Menyediakan endpoint `POST`, `GET`, `PUT`, `DELETE` standar untuk `carts`, `orders`, dan `wishlists`.
    2. **[HILANG]**: Hampir semua logika bisnis penting hilang (validasi stok, validasi user/produk, kalkulasi total, pengembalian stok saat batal, dll).

---

### 3. Product Service (http://localhost:8003)
- **Koleksi DB**: `products`, `categories`, `reviews`
- **Contoh Dokumen**:
  - **`products`**:
    ```json
    {
      "name": "Lipstik Matte Rose Red",
      "price": 75000,
      "stock": 100,
      "description": "Lipstik matte tahan lama.",
      "category": "kosmetik",
      "imageUrl": "https://example.com/image.jpg"
    }
    ```
  - **`categories`**:
    ```json
    {
      "name": "Kecantikan",
      "description": "Produk untuk kecantikan dan perawatan diri."
    }
    ```
  - **`reviews`**:
    ```json
    {
      "productId": "product_id_456",
      "userId": "user_id_123",
      "rating": 5,
      "comment": "Bagus sekali!"
    }
    ```
- **Fungsionalitas**:
    1. **CRUD Dasar**: Endpoint CRUD dasar ada untuk `products`, `categories` dan `reviews`.
    2. **Validasi Sebagian**: Ada pengecekan kategori saat membuat produk dan proteksi stok saat mengurangi kuantitas.
    3. **[HILANG/BERANTAKAN]**: Logika produk terduplikasi di dua modul berbeda. Banyak proteksi hilang (duplikasi kategori, validasi rating review, dll).

---

### 4. Payment Service (http://localhost:8004)
- **Koleksi DB**: `payments`
- **Contoh Dokumen**:
```json
{
  "orderId": "order_id_abc",
  "userId": "user_id_123",
  "method": "transfer_bank",
  "status": "pending"
}
```
- **Fungsionalitas**:
    1. **Create Payment**: Logika validasi antar-layanan sebagian besar masih utuh (cek order, cek status order, cek user, update status order).
    2. **Read Payment**: `GET /payments/user/:userId` melakukan validasi user sebelum mengambil data.
    3. **[CATATAN]**: Layanan ini adalah yang paling utuh dan paling sesuai dengan deskripsi fungsionalitas awal.

====================================================================================================
====================================================================================================

## LOG11102025: Arsitektur Stabil (Setelah Perbaikan oleh Gemini)

*Catatan: Log ini merangkum semua perbaikan yang dilakukan untuk menstabilkan, mengamankan, dan menyelaraskan semua layanan microservice sesuai dengan arsitektur yang didefinisikan dalam `GEMINI.md`. Semua layanan sekarang menggunakan standar DTO, Interceptor, dan konfigurasi terpusat.*

---

### 1. User Service (`http://localhost:8001`)
- **Koleksi DB**: `users`
- **Fungsionalitas (Setelah Perbaikan)**:
    1.  **Keamanan Ditingkatkan**: Endpoint `PUT /users/:id` dan `DELETE /users/:id` sekarang diproteksi dan hanya bisa diakses oleh `admin`.
    2.  **Fitur Update Profil**: Endpoint baru `PUT /users/profile/update` ditambahkan, memungkinkan pengguna biasa untuk memperbarui data mereka sendiri dengan aman menggunakan token JWT.
    3.  **Stabilitas**: Semua fungsionalitas inti (register, login, get all/by id) tetap terjaga dan stabil.

---

### 2. Product Service (`http://localhost:8003`)
- **Koleksi DB**: `products`, `categories`, `reviews`
- **Fungsionalitas (Setelah Perbaikan)**:
    1.  **Struktur Dikonsolidasi**: Modul `product-review` yang redundan telah dihapus. Semua logika terkait produk, kategori, dan review sekarang terpusat di dalam modul `products`.
    2.  **Logika Bisnis Lengkap**: Fungsionalitas CRUD untuk produk, kategori, dan review telah divalidasi dan diperbaiki, termasuk proteksi duplikasi untuk kategori dan review.
    3.  **Output API Konsisten**: Tipe kembalian pada *controller* telah disesuaikan untuk memastikan data yang dikirim ke klien sesuai dengan yang dihasilkan oleh *service*.
    4.  **Dependensi DTO Diperbaiki**: `CreateProductDto` sekarang mewajibkan `categoryId` untuk memastikan integritas data.

---

### 3. Order Service (`http://localhost:8002`)
- **Koleksi DB**: `carts`, `orders`, `wishlists`
- **Fungsionalitas (Setelah Perbaikan)**:
    1.  **Logika Bisnis Diimplementasikan Penuh**:
        *   **Manajemen Pesanan**: Membuat pesanan sekarang secara otomatis memvalidasi dan mengurangi stok produk, menghitung total harga, dan mengosongkan keranjang pengguna. Membatalkan pesanan akan mengembalikan stok produk.
        *   **Manajemen Keranjang**: Menambah atau mengubah item di keranjang akan memvalidasi ketersediaan stok di `product-service`.
        *   **Manajemen Wishlist**: Memiliki proteksi untuk mencegah duplikasi item.
    2.  **Komunikasi Antar-Service**: Layanan sekarang berkomunikasi secara robust dengan `product-service` dan `user-service` menggunakan `HttpModule` dan konfigurasi dari `.env`.
    3.  **API Aman dan Konsisten**: Mengimplementasikan `Response DTOs` (`OrderResponseDto`, `CartResponseDto`) dan `ClassSerializerInterceptor` global untuk memastikan output API bersih, aman, dan terstandarisasi.
    4.  **Stabilitas Tipe**: Semua error TypeScript terkait Mongoose `Document` dan `string | undefined` telah diperbaiki, membuat layanan lebih stabil.

---

### 4. Payment Service (`http://localhost:8004`)
- **Koleksi DB**: `payments`
- **Fungsionalitas (Setelah Perbaikan)**:
    1.  **Fungsionalitas Dipulihkan**: Layanan yang sebelumnya rusak total kini berfungsi penuh.
    2.  **Komunikasi Modern**: Mengganti `axios` direct-call dengan `HttpModule` dan `ConfigService` untuk membaca URL layanan lain dari file `.env`, menghilangkan hardcoded URL.
    3.  **Logika Bisnis Diperbarui**: Proses `create` payment sekarang berkomunikasi dengan benar ke endpoint `order-service` yang baru (`/orders/:id`) dan meng-update status order menjadi `processing`.
    4.  **API Aman dan Konsisten**: Mengimplementasikan `PaymentResponseDto` dan `ClassSerializerInterceptor` untuk standarisasi output API.
    5.  **Konfigurasi Database Dinamis**: Koneksi ke MongoDB sekarang mengambil `MONGO_URI` dari file `.env`, bukan hardcoded.

---

### Catatan Tambahan
- **`bff-web`**: Layanan ini belum tersentuh dan masih menggunakan URL port lama (55xx). Perlu penyesuaian agar dapat berfungsi dengan arsitektur saat ini.
- **Otentikasi**: Semua layanan yang memerlukan proteksi (seperti `order-service` dan `payment-service` untuk endpoint privat) perlu ditambahkan `JwtAuthGuard` di masa depan untuk menyempurnakan keamanan.