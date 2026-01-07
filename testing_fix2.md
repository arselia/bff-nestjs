# Dokumentasi Testing API

## Catatan Umum (General Notes)

- **Validasi Input**: Jika `request body` (JSON) tidak dikirim, server seharusnya memberikan respons error yang jelas seperti `"Diperlukan input"`, bukan `500 Internal Server Error`.
- **Logging Error**: Setiap terjadi error (misalnya, `404 Not Found` atau `500 Internal Server Error`), detailnya harus secara otomatis dicatat ke dalam file `errorlog.md`.

---

## User Service

### 1. Login
- **Method**: `POST`
- **URL**: `http://localhost:8001/users/login`
- **Request Body**:
  ```json
  {
      "email": "test@example.com",
      "password": "password123"
  }
  ```
- **Output**:
  ```json
  {
      "token": "XXXXXXXX"
  }
  ```

### 2. Register
- **Method**: `POST`
- **URL**: `http://localhost:8001/users/register`
- **Request Body**:
  ```json
  {
      "username" : "jawajawajawa",
      "email" : "jawa@gmail.com",
      "password" : "madura"
  }
  ```
- **Output**:
  ```
  Akun berhasil dibuat, silakan login
  ```

### 3. Get Account by Token
- **Method**: `GET`
- **URL**: `http://localhost:8001/users/profile`
- **Authentication**: `Bearer Token`
- **Output**:
  ```json
  {
      "id": "68df78fb1fa97b3fc43db588",
      "username": "testuser",
      "email": "test@example.com"
  }
  ```

### 4. Update Profile
- **Method**: `PUT`
- **URL**: `http://localhost:8001/users/profile/update`
- **Authentication**: `Bearer Token`
- **Request Body**:
  ```json
  {
      "username" : "Jawa Tengah",
      "fullname": "Ganjar Pranowo"
  }
  ```
- **Output**:
  ```
  User berhasil diperbarui
  ```

### 5. Delete Account by Token
- **Method**: `DELETE`
- **URL**: `http://localhost:8001/users/profile`
- **Authentication**: `Bearer Token`
- **Output**:
  ```
  Akun berhasil dihapus
  ```

### 6. Update User by ID (Admin Only)
- **Method**: `PUT`
- **URL**: `http://localhost:8001/users/68df78fb1fa97b3fc43db588`
- **Authentication**: `Bearer Token`
- **Request Body**:
  ```json
  {
      "username" : "jawa"
  }
  ```
- **Output**:
  ```
  User berhasil diperbarui
  ```

### 7. Delete Account (Admin Only)
- **Method**: `DELETE`
- **URL**: `http://localhost:8001/users/68eba7bdd4691b9d8ddb69d3`
- **Authentication**: `Bearer Token`
- **Output**:
  ```
  Akun berhasil dihapus
  ```

### 8. Get All Accounts (Admin Only)
- **Method**: `GET`
- **URL**: `http://localhost:8001/users/all`
- **Authentication**: `Bearer Token`
- **Output (Contoh)**:
  ```json
  [
      {
          "id": "68886ebc0a5ea5f4dec36ab9",
          "username": "Sherly04",
          "fullname": "Sherly Septiani Updated v4",
          "email": "sherlylily04@gmail.com",
          "phoneNumber": "088233736987"
      },
      {
          "id": "68bf956f844619c0baea3385",
          "username": "Admin",
          "fullname": "AdminAdmin",
          "email": "admin@gmail.com",
          "phoneNumber": "081234567890"
      },
  …
  ]
  ```

### 9. Get Account by ID
- **Method**: `GET`
- **URL**: `http://localhost:8001/users/68df78fb1fa97b3fc43db588`
- **Output**:
  ```json
  {
      "id": "68df78fb1fa97b3fc43db588",
      "username": "jawa",
      "email": "test@example.com"
  }
  ```

### Catatan (User Service):
- Isu terkait **Update Profile** dan **Get All Users** telah diperbaiki.
- Sejauh ini tidak ada error yang ditemukan.

### 10. Create New Address (addAddress)

- **Method**: `POST`
- **URL**: http://localhost:8001/users/profile/addresses
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
```json
{
    "label": "Rumah",
    "recipientName": "Nama Penerima",
    "phoneNumber": "081234567890",
    "street": "Jl. Kenanga No. 122",
    "city": "Bandung",
    "province": "Jawa Barat",
    "postalCode": "11100",
    "isDefault": true
}
```
- **Output**:
```json
{
    "id": "691c04f5899227bb3faa2110",
    "label": "Rumah",
    "recipientName": "Nama Penerima",
    "phoneNumber": "081234567890",
    "street": "Jl. Kenanga No. 122",
    "city": "Bandung",
    "province": "Jawa Barat",
    "postalCode": "11100",
    "isDefault": true
}
```

### 11. Get All Addresses By Token (getAddresses)

- **Method**: `GET`
- **URL**: http://localhost:8001/users/profile/addresses
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
```json
[
    {
        "label": "Kantor Pusat",
        "recipientName": "abc",
        "phoneNumber": "081234567890",
        "street": "Jl. Contoh No. 123",
        "city": "Jakarta",
        "province": "DKI Jakarta",
        "postalCode": "12345",
        "isDefault": false,
        "_id": "691974f165f426b065fecde3"
    },
    {
        "label": "Rumah",
        "recipientName": "Nama Penerima",
        "phoneNumber": "081234567890",
        "street": "Jl. Contoh No. 123",
        "city": "Jakarta",
        "province": "DKI Jakarta",
        "postalCode": "12345",
        "isDefault": false,
        "_id": "6919754f168bce99be7b4fc8"
    }
]
```

### 12. Update Address (updateAddress)

- **Method**: `PUT`
- **URL**: http://localhost:8001/users/profile/addresses/691974f165f426b065fecde3
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
```json
{
    "label": "Kantor Pusat",
    "recipientName" : "abc",
    "isDefault": true
}
```
- **Output**:
```json
{
    "id": "691974f165f426b065fecde3",
    "label": "Kantor Pusat",
    "recipientName": "abc",
    "phoneNumber": "081234567890",
    "street": "Jl. Contoh No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postalCode": "12345",
    "isDefault": true
}
```

### 13. Update Default Address By ID (setDefaultAddress)

- **Method**: `PUT`
- **URL**: http://localhost:8001/users/profile/addresses/691974f165f426b065fecde3/default
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
```json
{
    "id": "691974f165f426b065fecde3",
    "label": "Kantor Pusat",
    "recipientName": "abc",
    "phoneNumber": "081234567890",
    "street": "Jl. Contoh No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postalCode": "12345",
    "isDefault": true
}
```

### 14. Delete Address (removeAddress)

- **Method**: `DELETE`
- **URL**: http://localhost:8001/users/profile/addresses/691974f165f426b065fecde3
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
```
Alamat berhasil dihapus.
```

### 15. Forgot Password (forgotPassword)

- **Method**: `POST`
- **URL**: http://localhost:8001/users/forgot-password
- **Request Body**:
```json
  {
      "email" : "mydei@gmail.com"
  }
  ```
  - **Output**:
  ```
  Jika email Anda terdaftar, Anda akan menerima email reset password.
  ```
  - **Console Log**:
  ```
  ====================================================
  == SIMULASI PENGIRIMAN EMAIL PASSWORD RESET ==
  ====================================================
  Penerima: mydei@gmail.com
  Subjek:   Reset Password Akun Anda

  Silakan gunakan link berikut untuk mereset password Anda:
  http://localhost:8001/users/reset-password/7278b78689469fb1a3278c75b311e90543991915da2e8fb8b1e59122ce14c167
  ====================================================
  ```

  ### 16. Reset Password (resetPassword)

  - **Method**: `POST`
  - **URL**: http://localhost:8001/users/reset-password/7278b78689469fb1a3278c75b311e90543991915da2e8fb8b1e59122ce14c167
  - **Request Body**:
  ```json
  {
      "password" : "abc123"
  }
  ```
  - **Output**:
  ```
    Password berhasil direset. Silakan login dengan password baru Anda.
  ```

---

## Product Service

### Products

#### 1. Create Product
- **Method**: `POST`
- **URL**: `http://localhost:8003/products`
- **Authentication**: `BEARER TOKEN XXX`
- **Request Body**:
  ```json
  {
      "name": "Baju Sabrina Carpenter",
      "description": "Baju yang pernah dipakai oleh Sabrina Carpenter",
      "price": 99000,
      "stock": 2,
      "categoryId": "68887ab62020a9104385498e"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "_id": "68ec855ceb9d9cf8c92d5038",
      "name": "Baju Sabrina Carpenter",
      "description": "Baju yang pernah dipakai oleh Sabrina Carpenter",
      "price": 99,
      "stock": 2,
      "categoryId": "68887ab62020a9104385498e",
      "images": [],
      "createdAt": "2025-10-13T04:51:40.465Z",
      "updatedAt": "2025-10-13T04:51:40.465Z",
      "__v": 0
  }
  ```

#### 2. Get All Products
- **Method**: `GET`
- **URL**: `http://localhost:8003/products`
- **Output (Clean DTO)**:
  ```json
  [
    {
        "id": "68c6a98ba70ba5cf7a700796",
        "name": "Aqua Bottle Water",
        "description": "A water bottle of Aqua, 100% Murni",
        "price": 3700,
        "stock": 15,
        "category": "Makanan & Minuman",
        "imageUrl": "https://linkgambarfake.png"
    },
    {
        "id": "68c6aa10a70ba5cf7a700799",
        "name": "Kaos Polos",
        "description": "Kaos bahan adem dan nyaman",
        "price": 95000,
        "stock": 48,
        "category": "Fashion",
        "imageUrl": "https://linkgambarfake.com/kaos.jpg"
    }
  ]
  ```

#### 3. Get Product by ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/products/68ec855ceb9d9cf8c92d5038`
- **Output (Clean DTO)**:
  ```json
  {
      "id": "68ec855ceb9d9cf8c92d5038",
      "name": "Baju Sabrina Carpenter",
      "description": "Baju yang pernah dipakai oleh Sabrina Carpenter",
      "price": 99000,
      "stock": 2,
      "category": "Fashion",
      "imageUrl": "https://example.com/sabrina.jpg"
  }
  ```

#### 4. Edit Product
- **Method**: `PUT`
- **URL**: `http://localhost:8003/products/68ec855ceb9d9cf8c92d5038`
- **Authentication**: `BEARER TOKEN XXX`
- **Request Body**:
  ```json
  {
      "name" : "ABC"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "_id": "68ec855ceb9d9cf8c92d5038",
      "name": "ABC",
      "description": "Baju yang pernah dipakai oleh Sabrina Carpenter",
      "price": 99,
      "stock": 2,
      "categoryId": "68887ab62020a9104385498e",
      "images": [],
      "createdAt": "2025-10-13T04:51:40.465Z",
      "updatedAt": "2025-10-13T05:02:15.461Z",
      "__v": 0
  }
  ```

#### 5. Delete Product
- **Method**: `DELETE`
- **URL**: `http://localhost:8003/products/692002704e0c2013ef2e041e`
- **Authentication**: `BEARER TOKEN XXXX (Admin)`
- **Output**:
  ```json
  {
      "message": "Produk berhasil diarsipkan"
  }
  ```

#### 6. Update Stock
- **Deskripsi**: Menguji pembaruan stok secara atomik dengan validasi input.
- **Method**: `PUT`
- **URL**: `http://localhost:8003/products/{id_produk}/stock`
- **Authentication**: `BEARER TOKEN XXXX (Admin)`

- **Skenario 1: Sukses (Penambahan Stok)**
  - **Request Body**:
    ```json
    {
        "quantity": 10,
        "type": "increase"
    }
    ```
  - **Output**:
    ```json
    {
        "id": "690d896fae4d50451f8a7b86",
        "name": "Lipstik Bubadibako",
        "description": "Lipstik untuk meronakan bibir",
        "price": 20000,
        "stock": 13,
        "category": "Fashion",
        "imageUrl": ""
    }
    ```

- **Skenario 2: Gagal (Stok Tidak Cukup)**
  - **Request Body**:
    ```json
    {
        "quantity": 999,
        "type": "decrease"
    }
    ```
  - **Output**:
    ```json
    {
        "statusCode": 400,
        "message": "Stok tidak mencukupi",
        "error": "Bad Request"
    }
    ```

- **Skenario 3: Gagal (Input Tidak Valid)**
  - **Request Body**:
    ```json
    {
        "quantity": -5,
        "type": "increase"
    }
    ```
  - **Output**:
    ```json
    {
        "statusCode": 400,
        "message": [
            "quantity must be a positive number"
        ],
        "error": "Bad Request"
    }
    ```

#### 7. Get All Products by Category
- **Method**: `GET`
- **URL**: `http://localhost:8003/categories/{id_kategori}/products`
- **Output (Clean DTO)**:
  ```json
  [
    {
        "id": "68f9ffb45b1ac9de1c1262eb",
        "name": "Lipstik Bubadibako",
        "description": "Baju Sabrina Carpenter yang Digunakan saat Konser",
        "price": 20000,
        "stock": 57,
        "category": "Fashion",
        "imageUrl": ""
    },
    {
        "id": "690d896fae4d50451f8a7b86",
        "name": "Lipstik Bubadibako",
        "description": "Lipstik untuk meronakan bibir",
        "price": 20000,
        "stock": 13,
        "category": "Fashion",
        "imageUrl": ""
    }
  ]
  ```

#### Catatan & Error (Products):
- **Sudah Diperbaiki**: Keamanan endpoint, format respons, logika stok, dan respons delete.
- **Fitur Opsional**: Pertimbangkan untuk menambahkan fitur *sorting* (pengurutan) pada `GET /products`.

### Categories

#### 1. Get All Categories
- **Method**: `GET`
- **URL**: `http://localhost:8003/categories`
- **Output**:
  ```json
  [
    {
        "id": "68887ab62020a9104385498e",
        "name": "Fashion",
        "description": "Produk pakaian, sepatu, dan aksesoris gaya terkini"
    },
    {
        "id": "68887ac72020a91043854990",
        "name": "Makanan & Minuman",
        "description": "Makanan ringan, bahan makanan, dan minuman kemasan"
    },
  …
  ]
  ```

#### 2. Get Category by ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/categories/68887ab62020a9104385498e`
- **Output**:
  ```json
  {
      "id": "68887ab62020a9104385498e",
      "name": "Fashion",
      "description": "Produk pakaian, sepatu, dan aksesoris gaya terkini"
  }
  ```

#### 3. Create New Category
- **Method**: `POST`
- **URL**: `http://localhost:8003/categories`
- **Authentication**: `Bearer Token XXXXXXXX`
- **Request Body**:
  ```json
  {
      "name" : "Technology",
      "description" : "A category of technology and electronics stuff"
  }
  ```
- **Output**:
  ```json
  {
      "id": "68fc4067853d92bd779316c0",
      "name": "Technology",
      "description": "A category of technology and electronics stuff"
  }
  ```

#### 4. Edit Category by ID
- **Method**: `PUT`
- **URL**: `http://localhost:8003/categories/68fc4067853d92bd779316c0`
- **Authentication**: `Bearer Token XXXXXXXX`
- **Request Body**:
  ```json
  {
      "name" : "Technology"
  }
  ```
- **Output**:
  ```json
  {
      "id": "68fc4067853d92bd779316c0",
      "name": "Technology",
      "description": "A category of technology and electronics stuff"
  }
  ```

#### 5. Delete Category by ID
- **Method**: `DELETE`
- **URL**: `http://localhost:8003/categories/68fc4067853d92bd779316c0`
- **Authentication**: `Bearer Token XXXXXXXX`
- **Output**:
  ```json
  {
      "message": "Kategori berhasil dihapus"
  }
  ```

#### Catatan & Error (Categories):
- **Sudah Diperbaiki**: Keamanan (Admin-only), format respons (menampilkan `id` dan menghapus data internal), dan format pesan untuk `DELETE` sudah sesuai.
- Tidak ada error yang ditemukan.

### Reviews

#### 1. GET ALL REVIEWS BY PRODUCT ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/products/68c6a98ba70ba5cf7a700796/reviews`
- **Authentication**: None
- **Output**:
  ```json
  [
    {
        "id": "68ecbc74fa2f8f0b57e89a8e",
        "product": "68c6a98ba70ba5cf7a700796",
        "userId": "68886ebc0a5ea5f4dec36ab9",
        "rating": 3,
        "comment": "Keren"
    },
    {
        "id": "68ecd6f832d7f91135c134ea",
        "product": "68c6a98ba70ba5cf7a700796",
        "userId": "68df78fb1fa97b3fc43db587",
        "rating": 3,
        "comment": "Keren"
    }
  ]
  ```

#### 2. GET REVIEW BY ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/products/reviews/68ecd6f832d7f91135c134ea`
- **Authentication**: None
- **Output**:
  ```json
  {
      "id": "68ecd6f832d7f91135c134ea",
      "product": "68c6a98ba70ba5cf7a700796",
      "userId": "68df78fb1fa97b3fc43db587",
      "rating": 3,
      "comment": "Keren"
  }
  ```

#### 3. GET ALL REVIEWS BY USERID
- **Method**: `GET`
- **URL**: `http://localhost:8003/products/reviews/me`
- **Authentication**: `Bearer Token XXXX`
- **Output**:
  ```json
  [
    {
        "id": "69007d79aa0b9441ecb59c28",
        "product": "68c6a98ba70ba5cf7a700796",
        "userId": "68f6f03178326680310df4d1",
        "rating": 3,
        "comment": "Keren"
    }
  ]
  ```

#### 4. CREATE REVIEWS
- **Method**: `POST`
- **URL**: `http://localhost:8003/products/68c6a98ba70ba5cf7a700796/reviews`
- **Authentication**: `Bearer Token XXX`
- **Request Body**:
  ```json
  {
      "rating" : 3,
      "comment" : "Keren"
  }
  ```
- **Output**:
  ```json
  {
      "id": "6900ca4cb8c6dda5625eb921",
      "product": "68c6a98ba70ba5cf7a700796",
      "userId": "68f6f03178326680310df4d1",
      "rating": 3,
      "comment": "Keren"
  }
  ```

#### 5. DELETE REVIEW BY ID
- **Method**: `DELETE`
- **URL**: `http://localhost:8003/products/reviews/6900ca4cb8c6dda5625eb921`
- **Authentication**: `Bearer Token XXXX`
- **Output**:
  ```json
  {
      "message": "Review berhasil dihapus"
  }
  ```

#### Catatan & Error (Reviews):
- **Status: SELESAI**
- **Ringkasan Perbaikan**:
    - **Struktur URL**: Semua rute telah diperbaiki agar lebih logis dan konsisten.
    - **Otentikasi**: `userId` sekarang diambil dari token, bukan input manual. Endpoint yang memerlukan login (`POST`, `DELETE`, `GET /me`) sekarang dilindungi dengan benar dan akan merespons dengan `401 Unauthorized` jika token tidak ada.
    - **Otorisasi**: Menghapus review sekarang hanya bisa dilakukan oleh pemilik review atau Admin.
    - **Format Respons**: Semua endpoint sekarang mengembalikan data JSON yang bersih sesuai DTO.
    - **Validasi**: Validasi input (`rating`, `comment`) dan keberadaan produk sudah berjalan.

---

## Order Service

### 1. CREATE NEW CART
- **URL**: `http://localhost:8002/carts`
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
  ```json
  {
      "productId" : "692565c84981456867adee35",
      "quantity" : 3
  }
  ```
- **Output**:
  ```json
  {
      "id": "692566091768f9ac85cbe8fb",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "692565c84981456867adee35",
      "quantity": 3,
      "price": 20000
  }
  ```

### 2. GET ALL CARTS BY USERID
- **URL**: `http://localhost:8002/carts/`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
[
    {
        "id": "69256ccc1768f9ac85cbe904",
        "userId": "68df78fb1fa97b3fc43db588",
        "productId": "692565c84981456867adee35",
        "quantity": 3,
        "price": 20000
    }
]
  ```

#### 3. Get Cart by ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/carts/68ecd76bcd190cd498584b8e`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
      "id": "68ecd76bcd190cd498584b8e",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68ecab05fa2f8f0b57e89a60",
      "quantity": 7
  }
  ```

#### 4. Update Cart Quantity
- **Method**: `PUT`
- **URL**: `http://localhost:8002/carts/690af15a96e25bad0a1ce845`
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
  ```json
  {
      "quantity" : 2
  }
  ```
- **Output**:
  ```json
  {
      "id": "690af15a96e25bad0a1ce845",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68c6a98ba70ba5cf7a700796",
      "quantity": 2
  }
  ```

#### 5. Delete Cart
- **Method**: `DELETE`
- **URL**: `http://localhost:8002/carts/6905f8b9d53093c95e5cc3d9`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
      "message": "Cart item successfully deleted"
  }
  ```

#### Catatan & Error (Cart):
1.  **Validasi**: Saat membuat cart, `productId` dan `userId` tidak divalidasi. Input string acak seharusnya ditolak.
2.  **Keamanan**: Semua endpoint harus diamankan dengan **token**. `userId` harus diambil dari token.
3.  **Respons Delete**: Seharusnya mengembalikan pesan konfirmasi.
4.  **Format Respons**: Respons masih menyertakan data internal.

### Wishlists

#### 1. Create Wishlist
- **Method**: `POST`
- **URL**: `http://localhost:8002/wishlists`
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
  ```json
  {
      "productId" : "68c6a98ba70ba5cf7a700796"
  }
  ```
- **Output**:
  ```json
  {
      "id": "690b0403f59fec8b3b55dcb3",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68c6a98ba70ba5cf7a700796"
  }
  ```

#### 2. Get All Wishlists
- **Method**: `GET`
- **URL**: `http://localhost:8002/wishlists/`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  [
      {
          "id": "68ecdaa250ce3d2d55a47ff7",
          "userId": "68df78fb1fa97b3fc43db588",
          "productId": "68c6aa10a70ba5cf7a700799"
      },
      {
          "id": "68edcec4f763c792932ee7ec",
          "userId": "68df78fb1fa97b3fc43db588",
          "productId": "68c6a98ba70ba5cf7a700796"
      }
  ]
  ```

#### 3. Get Wishlist by ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/wishlists/690b0403f59fec8b3b55dcb3`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
      "id": "690b0403f59fec8b3b55dcb3",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68c6a98ba70ba5cf7a700796"
  }
  ```

#### 4. Delete Wishlist
- **Method**: `DELETE`
- **URL**: `http://localhost:8002/wishlists/68edcec4f763c792932ee7ec`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
      "message": "Wishlist item successfully deleted"
  }
  ```

#### Catatan & Error (Wishlists):
1.  **Format Respons**: Respons belum bersih dari data internal.
2.  **Keamanan**: Semua endpoint harus diamankan dengan **token**. `userId` harus diambil dari token.
3.  **Respons Delete**: Seharusnya mengembalikan pesan konfirmasi.

### Order

#### 1. CREATE ORDER BY CART ID
- **Method**: `POST`
- **URL**: `http://localhost:8002/orders`
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
  ```json
  {}
  ```
- **Output**:
  ```json
  {
      "id": "69256d4f1768f9ac85cbe908",
      "orderNumber": "ORD-20251125-TCNN",
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "692565c84981456867adee35",
              "productName": "Pink Pantheresses Shirt",
              "productImageUrl": "https://example.com/gambar-produk-rak.jpg",
              "quantity": 3,
              "price": 20000
          }
      ],
      "totalAmount": 60000,
      "status": "pending",
      "shippingAddress": {
          "label": "Kantor Pusat",
          "recipientName": "abc",
          "phoneNumber": "081234567890",
          "street": "Jl. Contoh No. 123",
          "city": "Jakarta",
          "province": "DKI Jakarta",
          "postalCode": "12345"
      }
  }
  ```

#### 2. GET ALL ORDER BY USER ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/orders/my-orders`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  [
      {
          "id": "690d7b9d2254415bae22f8d6",
          "userId": "68df78fb1fa97b3fc43db588",
          "items": [
              {
                  "productId": "68c6aa80a70ba5cf7a70079f",
                  "quantity": 2,
                  "price": 250000
              }
          ],
          "totalAmount": 500000,
          "status": "cancelled"
      },
      {
          "id": "690da17e8983c805651c97b4",
          "userId": "68df78fb1fa97b3fc43db588",
          "items": [
              {
                  "productId": "68c6aac4a70ba5cf7a7007a1",
                  "quantity": 2,
                  "price": 75000
              }
          ],
          "totalAmount": 150000,
          "status": "pending"
      }
  ]
  ```

#### 3. GET ORDER BY ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/orders/690d7ba82254415bae22f8dc`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
      "id": "690d7ba82254415bae22f8dc",
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "68c6aac4a70ba5cf7a7007a1",
              "quantity": 2,
              "price": 75000
          }
      ],
      "totalAmount": 150000,
      "status": "processing"
  }
  ```

#### 4. UPDATE STATUS ORDER
- **Method**: `PUT`
- **URL**: `http://localhost:8002/orders/690d7b9d2254415bae22f8d6/status`
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
  ```json
  {
      "status" : "processing"
  }
  ```
- **Output**:
  ```json
  {
      "id": "690da17e8983c805651c97b4",
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "68c6aac4a70ba5cf7a7007a1",
              "quantity": 2,
              "price": 75000
          }
      ],
      "totalAmount": 150000,
      "status": "processing"
  }
  ```

#### 5. CANCEL ORDER BY ID
- **Method**: `PUT`
- **URL**: `http://localhost:8002/orders/690d7b9d2254415bae22f8d6/cancel`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
      "id": "690d7b9d2254415bae22f8d6",
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "68c6aa80a70ba5cf7a70079f",
              "quantity": 2,
              "price": 250000
          }
      ],
      "totalAmount": 500000,
      "status": "cancelled"
  }
  ```

#### 6. DELETE ORDER
- **Method**: `DEL`
- **URL**: `http://localhost:8002/orders/690d7b2b2254415bae22f8bb`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
      "message": "Order successfully deleted"
  }
  ```

#### Catatan & Error (Order):
- **Status: SELESAI**
- **Ringkasan Perbaikan**:
    - **Keamanan**: Semua endpoint telah diamankan dengan token. `userId` diambil dari token, dan endpoint yang tidak aman (`/user/:userId`) telah diganti dengan `/my-orders`.
    - **Otorisasi Admin**: Endpoint untuk `updateStatus` dan `remove` sekarang hanya bisa diakses oleh Admin dan dapat beroperasi pada pesanan milik pengguna mana pun.
    - **Logika Bisnis**: Alur pembuatan pesanan telah diperbaiki untuk membuat pesanan dari satu `cartId`. Logika untuk mencegah update pada pesanan yang sudah selesai/dibatalkan telah ditambahkan. Fitur pembatalan oleh pengguna dengan pengembalian stok juga telah ditambahkan.
    - **Format Respons**: Semua respons API sekarang bersih dan sesuai dengan DTO.
    - **Error Handling**: Penanganan error untuk status tidak valid dan ID yang tidak ditemukan telah ditingkatkan.

---

## Payment Service

### 1. Create Payment
- **Method**: `POST`
- **URL**: `http://localhost:8004/payments`
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
  ```json
  {
    "orderId": "692566501768f9ac85cbe8ff",
    "method": "credit_card"
  }
  ```
- **Output**:
  ```json
  {
    "id": "692820a523a910058ce91ca3",
    "orderId": "692566501768f9ac85cbe8ff",
    "userId": "68df78fb1fa97b3fc43db588",
    "status": "success",
    "method": "credit_card"
  }
  ```

### 2. GET MY PAYMENTS
- **Method**: `GET`
- **URL**: `http://localhost:8004/payments/me`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
[
    {
        "id": "68ee503f7eaa0763545d12c8",
        "orderId": "68ee4335bfeae056cfe521e9",
        "userId": "68df78fb1fa97b3fc43db588",
        "status": "failed",
        "method": "Transfer"
    },
    {
        "id": "68ee52b9809e1dfa5dde7f40",
        "orderId": "68ee4323bfeae056cfe521e3",
        "userId": "68df78fb1fa97b3fc43db588",
        "status": "pending",
        "method": "abc"
    }
]
  ```

### 3. Get Payment by ID
- **Method**: `GET`
- **URL**: `http://localhost:8004/payments/68ee503f7eaa0763545d12c8`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
  {
    "id": "692820a523a910058ce91ca3",
    "orderId": "692566501768f9ac85cbe8ff",
    "userId": "68df78fb1fa97b3fc43db588",
    "status": "success",
    "method": "credit_card"
  }
  ```

### 4. Get All Payment for Admin
- **Method**: `GET`
- **URL**: `http://localhost:8004/payments/all`
- **Authentication**: `BEARER TOKEN XXXX`
- **Output**:
  ```json
[
    {
        "id": "68714c1396e0ca8fd0a32235",
        "orderId": "64a1b2c3d4e5f6g7h8i9j0kl",
        "status": "paid",
        "method": "transfer_bank"
    },
    {
        "id": "68714d9b96e0ca8fd0a3223a",
        "orderId": "64a1b2c3d4e5f6g7h8i9j0kl",
        "status": "pending",
        "method": "transfer_bank"
    }
]
  ```

### 5. Update Payment Status by Admin
- **Method**: `PUT`
- **URL**: `http://localhost:8004/payments/690ecd74f86d7c0e02192ede/status`
- **Authentication**: `BEARER TOKEN XXXX`
- **Request Body**:
  ```json
  {
    "status" : "failed"
  }
  ```
- **Output**:
  ```json
  {
    "id": "690ecd74f86d7c0e02192ede",
    "orderId": "690da19b8983c805651c97bc",
    "userId": "68df78fb1fa97b3fc43db588",
    "status": "failed",
    "method": "bank_transfer"
  }
  ```

### Catatan & Error (Payment Service):
- **Status: SELESAI**
- **Ringkasan Perbaikan**:
    - **Format ID**: `_id` sekarang dikembalikan sebagai `string` (`id`).
    - **Format Respons**: Respons sudah bersih dari data internal (`__v`, `createdAt`, `updatedAt`).
    - **Validasi `method`**: `method` sekarang divalidasi menggunakan `enum` (`bank_transfer`, `credit_card`, `e_wallet`).
    - **Otentikasi & Otorisasi**: Semua endpoint dilindungi dengan token JWT. Endpoint admin (`/all`, `/:id/status`) dilindungi dengan `RolesGuard('Admin')`.
    - **Komunikasi Antar-Service**: Penerusan token ke `order-service` sudah diimplementasikan.
    - **Routing**: Konflik routing (`/all` vs `/:id`) sudah diperbaiki.
