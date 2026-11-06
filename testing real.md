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
- **Request Body (Error)**:
  ```json
  {
      "oldPassword" : "user123"
  }
  ```
- **Output (Error)**:
  ```json
  {
      "message": "Harap isi Password Lama dan Password Baru untuk mengganti Password.",
      "error": "Bad Request",
      "statusCode": 400
  }
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
  {
      "id": "68bf956f844619c0baea3385",
      "username": "Admin",
      "fullname": "AdminAdmin",
      "email": "admin@gmail.com",
      "phoneNumber": "081234567890"
  }
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

### Catatan & Error (User Service):
1.  **Update Profile**: Saat `PUT /users/profile/update` dikirim hanya dengan field `"password"`, respons menyatakan berhasil namun data tidak berubah. Fungsionalitas dengan `oldPassword` dan `newPassword` sudah benar.
2.  **Get All Users**: Endpoint `GET /users/all` seharusnya mengembalikan semua data pengguna, tetapi saat ini hanya mengembalikan data milik admin yang sedang login.

---

## Product Service

### Products

#### 1. Create Product
- **Method**: `POST`
- **URL**: `http://localhost:8003/products`
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
- **Output (Raw)**:
  ```json
  [
    {
        "images": [],
        "_id": "68c6a98ba70ba5cf7a700796",
        "name": "Aqua Bottle Water",
        "price": 3700,
        "stock": 15,
        "description": "A water bottle of Aqua, 100% Murni",
        "category": "Makanan & Minuman",
        "imageUrl": "https://linkgambarfake.png",
        "createdAt": "2025-09-14T11:39:55.708Z",
        "updatedAt": "2025-09-20T12:29:34.337Z",
        "__v": 0
    },
    {
        "images": [],
        "_id": "68c6aa10a70ba5cf7a700799",
        "name": "Kaos Polos",
        "price": 95000,
        "stock": 48,
        "description": "Kaos bahan adem dan nyaman",
        "category": "Fashion",
        "imageUrl": "https://linkgambarfake.com/kaos.jpg",
        "createdAt": "2025-09-14T11:42:08.642Z",
        "updatedAt": "2025-09-14T11:42:08.642Z",
        "__v": 0
    }
  ]
  ```

#### 3. Get Product by ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/products/68ec855ceb9d9cf8c92d5038`
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

#### 4. Edit Product
- **Method**: `PUT`
- **URL**: `http://localhost:8003/products/68ec855ceb9d9cf8c92d5038`
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
- **URL**: `http://localhost:8003/products/68ec8532eb9d9cf8c92d5034`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ec8532eb9d9cf8c92d5034",
      "name": "Baju Sabrina Carpenter",
      "description": "Baju yang pernah dipakai oleh Sabrina Carpenter",
      "price": 99,
      "stock": 2,
      "categoryId": "68887ab62020a9104385498e",
      "images": [],
      "createdAt": "2025-10-13T04:50:58.697Z",
      "updatedAt": "2025-10-13T04:50:58.697Z",
      "__v": 0
  }
  ```

#### 6. Update Stock
- **Method**: `PUT`
- **URL**: `http://localhost:8003/products/68ec855ceb9d9cf8c92d5038/stock`
- **Request Body**:
  ```json
  {
      "quantity" : "5",
      "type" : "increase"
  }
  ```
- **Output**:
  ```
  Stok berhasil diperbarui
  ```

#### Catatan & Error (Products):
1.  **Keamanan**: Semua endpoint `POST`, `PUT`, `DELETE` harus dilindungi dan hanya bisa diakses oleh **Admin**.
2.  **Format Respons**: Semua respons masih menyertakan data internal (`__v`, `createdAt`, `updatedAt`). Data ini harus disaring (dihilangkan) dari output.
3.  **Logika Stok**: Perhitungan stok salah. Jika stok awal `25` dan `quantity` `5` ditambahkan, hasilnya menjadi `255` (string concatenation) bukan `30`.
4.  **Respons Delete**: Endpoint `DELETE` harus mengembalikan pesan konfirmasi (contoh: `"Product berhasil dihapus"`), bukan data produk yang dihapus.
5.  **Fitur Opsional**: Pertimbangkan untuk menambahkan fitur *sorting* (pengurutan) pada `GET /products`.

### Categories

#### 1. Get All Categories
- **Method**: `GET`
- **URL**: `http://localhost:8003/categories`
- **Output (Raw)**:
  ```json
  [
    {
        "_id": "68887ab62020a9104385498e",
        "name": "Fashion",
        "description": "Produk pakaian, sepatu, dan aksesoris gaya terkini",
        "createdAt": "2025-07-29T07:39:34.873Z",
        "updatedAt": "2025-07-29T07:39:34.873Z",
        "__v": 0
    },
    {
        "_id": "68887ac72020a91043854990",
        "name": "Makanan & Minuman",
        "description": "Makanan ringan, bahan makanan, dan minuman kemasan",
        "createdAt": "2025-07-29T07:39:51.125Z",
        "updatedAt": "2025-07-29T07:39:51.125Z",
        "__v": 0
    }
  ]
  ```

#### 2. Get Category by ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/categories/68887ab62020a9104385498e`
- **Output (Raw)**:
  ```json
  {
      "_id": "68887ab62020a9104385498e",
      "name": "Fashion",
      "description": "Produk pakaian, sepatu, dan aksesoris gaya terkini",
      "createdAt": "2025-07-29T07:39:34.873Z",
      "updatedAt": "2025-07-29T07:39:34.873Z",
      "__v": 0
  }
  ```

#### 3. Create New Category
- **Method**: `POST`
- **URL**: `http://localhost:8003/categories`
- **Request Body**:
  ```json
  {
      "name" : "Technology",
      "description" : "A category of technology and electronics stuff"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "name": "Technology",
      "description": "A category of technology and electronics stuff",
      "_id": "68ecb2e6fa2f8f0b57e89a70",
      "createdAt": "2025-10-13T08:05:58.066Z",
      "__v": 0
  }
  ```

#### 4. Edit Category by ID
- **Method**: `PUT`
- **URL**: `http://localhost:8003/categories/68ecb2e6fa2f8f0b57e89a70`
- **Request Body**:
  ```json
  {
      "name" : "Technologia"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecb2e6fa2f8f0b57e89a70",
      "name": "Technologia",
      "description": "A category of technology and electronics stuff",
      "createdAt": "2025-10-13T08:05:58.066Z",
      "__v": 0
  }
  ```

#### 5. Delete Category by ID
- **Method**: `DELETE`
- **URL**: `http://localhost:8003/categories/68ecb2e6fa2f8f0b57e89a70`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecb2e6fa2f8f0b57e89a70",
      "name": "Technology",
      "description": "A category of technology and electronics stuff",
      "createdAt": "2025-10-13T08:05:58.066Z",
      "__v": 0
  }
  ```

#### Catatan & Error (Categories):
1.  **Keamanan**: Semua endpoint kategori harus dilindungi dan hanya dapat diakses oleh **Admin**.
2.  **Format Respons**: Respons masih menyertakan data internal (`__v`, `createdAt`, `updatedAt`).
3.  **Respons Delete**: Seharusnya mengembalikan pesan konfirmasi, bukan data yang dihapus.

### Reviews

#### 1. Get Reviews by Product ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/reviews/product/:productId`
- **Output (Raw)**:
  ```json
  [
    {
        "_id": "68ecbc74fa2f8f0b57e89a8e",
        "productId": "68c6a98ba70ba5cf7a700796",
        "userId": "68886ebc0a5ea5f4dec36ab9",
        "rating": 3,
        "comment": "Keren",
        "createdAt": "2025-10-13T08:46:44.672Z",
        "__v": 0
    }
  ]
  ```

#### 2. Get Review by ID
- **Method**: `GET`
- **URL**: `http://localhost:8003/reviews/68ecbc74fa2f8f0b57e89a8e`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecbc74fa2f8f0b57e89a8e",
      "productId": "68c6a98ba70ba5cf7a700796",
      "userId": "68886ebc0a5ea5f4dec36ab9",
      "rating": 3,
      "comment": "Keren",
      "createdAt": "2025-10-13T08:46:44.672Z",
      "__v": 0
  }
  ```

#### 3. Create Review
- **Method**: `POST`
- **URL**: `http://localhost:8003/reviews`
- **Request Body**:
  ```json
  {
      "productId" : "68c6a98ba70ba5cf7a700796",
      "userId" : "68886ebc0a5ea5f4dec36ab9",
      "rating" : 3,
      "comment" : "Keren"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "productId": "68c6a98ba70ba5cf7a700796",
      "userId": "68886ebc0a5ea5f4dec36ab9",
      "rating": 3,
      "comment": "Keren",
      "_id": "68ecbc74fa2f8f0b57e89a8e",
      "createdAt": "2025-10-13T08:46:44.672Z",
      "__v": 0
  }
  ```

#### 4. Delete Review
- **Method**: `DELETE`
- **URL**: `http://localhost:8003/reviews/68ecbd4dfa2f8f0b57e89a96`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecbd4dfa2f8f0b57e89a96",
      "productId": "68c6a98ba70ba5cf7a700796",
      "userId": "68df78fb1fa97b3fc43db588",
      "rating": 3,
      "comment": "Keren",
      "createdAt": "2025-10-13T08:50:21.342Z",
      "__v": 0
  }
  ```

#### Catatan & Error (Reviews):
1.  **Otentikasi**: Untuk `POST /reviews`, `userId` seharusnya diambil dari **token otentikasi**, bukan diinput manual di *body*.
2.  **Format Respons**: Respons masih menyertakan data internal (`__v`, `createdAt`).
3.  **Respons Delete**: Seharusnya mengembalikan pesan konfirmasi.
4.  **Validasi**: Tidak ada validasi untuk `productId` dan `userId` saat membuat review. Input string acak seharusnya ditolak.

---

## Order Service

### Cart

#### 1. Create New Cart
- **Method**: `POST`
- **URL**: `http://localhost:8002/carts`
- **Request Body**:
  ```json
  {
      "userId" : "68df78fb1fa97b3fc43db588",
      "productId" : "68ecab05fa2f8f0b57e89a60",
      "quantity" : 3
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecd76bcd190cd498584b8e",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68ecab05fa2f8f0b57e89a60",
      "quantity": 5,
      "createdAt": "2025-10-13T10:41:47.368Z",
      "updatedAt": "2025-10-13T10:41:47.368Z",
      "__v": 0
  }
  ```

#### 2. Get Carts by User ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/carts/user/68df78fb1fa97b3fc43db588`
- **Output (Raw)**:
  ```json
  [
    {
        "_id": "68ecd76bcd190cd498584b8e",
        "userId": "68df78fb1fa97b3fc43db588",
        "productId": "68ecab05fa2f8f0b57e89a60",
        "quantity": 210,
        "createdAt": "2025-10-13T10:41:47.368Z",
        "updatedAt": "2025-10-13T10:41:47.368Z",
        "__v": 0
    }
  ]
  ```

#### 3. Get Cart by ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/carts/68ecd76bcd190cd498584b8e`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecd76bcd190cd498584b8e",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68ecab05fa2f8f0b57e89a60",
      "quantity": 210,
      "createdAt": "2025-10-13T10:41:47.368Z",
      "updatedAt": "2025-10-13T10:41:47.368Z",
      "__v": 0
  }
  ```

#### 4. Update Cart Quantity
- **Method**: `PUT`
- **URL**: `http://localhost:8002/carts/68ecd76bcd190cd498584b8e`
- **Request Body**:
  ```json
  {
      "quantity" : 5
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecd76bcd190cd498584b8e",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68ecab05fa2f8f0b57e89a60",
      "quantity": 5,
      "createdAt": "2025-10-13T10:41:47.368Z",
      "updatedAt": "2025-10-13T10:41:47.368Z",
      "__v": 0
  }
  ```

#### 5. Delete Cart
- **Method**: `DELETE`
- **URL**: `http://localhost:8002/carts/68ecd9b450ce3d2d55a47ff2`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecd9b450ce3d2d55a47ff2",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68c6aa10a70ba5cf7a700799",
      "quantity": 10,
      "createdAt": "2025-10-13T10:51:32.447Z",
      "updatedAt": "2025-10-13T10:51:32.447Z",
      "__v": 0
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
- **Request Body**:
  ```json
  {
      "userId" : "68df78fb1fa97b3fc43db588",
      "productId" : "68c6aa10a70ba5cf7a700799"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68c6aa10a70ba5cf7a700799",
      "_id": "68ecdaa250ce3d2d55a47ff7",
      "createdAt": "2025-10-13T10:55:30.416Z",
      "__v": 0
  }
  ```

#### 2. Get Wishlists by User ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/wishlists/user/68df78fb1fa97b3fc43db588`
- **Output (Raw)**:
  ```json
  [
    {
        "_id": "68ecdaa250ce3d2d55a47ff7",
        "userId": "68df78fb1fa97b3fc43db588",
        "productId": "68c6aa10a70ba5cf7a700799",
        "createdAt": "2025-10-13T10:55:30.416Z",
        "__v": 0
    },
    {
        "_id": "68ecdb0850ce3d2d55a47ffd",
        "userId": "68df78fb1fa97b3fc43db588",
        "productId": "68c6a98ba70ba5cf7a700796",
        "createdAt": "2025-10-13T10:57:12.496Z",
        "__v": 0
    }
  ]
  ```

#### 3. Get Wishlist by ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/wishlists/68ecdb0850ce3d2d55a47ffd`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecdb0850ce3d2d55a47ffd",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68c6a98ba70ba5cf7a700796",
      "createdAt": "2025-10-13T10:57:12.496Z",
      "__v": 0
  }
  ```

#### 4. Delete Wishlist
- **Method**: `DELETE`
- **URL**: `http://localhost:8002/wishlists/68ecdb0850ce3d2d55a47ffd`
- **Output (Raw)**:
  ```json
  {
      "_id": "68ecdb0850ce3d2d55a47ffd",
      "userId": "68df78fb1fa97b3fc43db588",
      "productId": "68c6a98ba70ba5cf7a700796",
      "createdAt": "2025-10-13T10:57:12.496Z",
      "__v": 0
  }
  ```

#### Catatan & Error (Wishlists):
1.  **Format Respons**: Respons belum bersih dari data internal.
2.  **Keamanan**: Semua endpoint harus diamankan dengan **token**. `userId` harus diambil dari token.
3.  **Respons Delete**: Seharusnya mengembalikan pesan konfirmasi.

### Order

#### 1. Create Order by Cart ID
- **Method**: `POST`
- **URL**: `http://localhost:8002/orders`
- **Request Body**:
  ```json
  {
      "userId" : "68df78fb1fa97b3fc43db588",
      "cartId" : "68edcaa4c4797f297c4f567c"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "68c6aa10a70ba5cf7a700799",
              "quantity": 10,
              "price": 95000,
              "_id": "68edcaaec4797f297c4f5681"
          }
      ],
      "totalAmount": 950000,
      "status": "pending",
      "_id": "68edcaaec4797f297c4f5680",
      "createdAt": "2025-10-14T03:59:42.749Z",
      "updatedAt": "2025-10-14T03:59:42.749Z",
      "__v": 0
  }
  ```

#### 2. Get Orders by User ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/orders/user/68df78fb1fa97b3fc43db588`
- **Output (Raw)**:
  ```json
  [
    {
        "_id": "68edc9d9c4797f297c4f5675",
        "userId": "68df78fb1fa97b3fc43db588",
        "items": [
            {
                "productId": "68c6a98ba70ba5cf7a700796",
                "quantity": 2,
                "price": 3700,
                "_id": "68edc9d9c4797f297c4f5676"
            }
        ],
        "totalAmount": 7400,
        "status": "pending",
        "createdAt": "2025-10-14T03:56:09.902Z",
        "updatedAt": "2025-10-14T03:56:09.902Z",
        "__v": 0
    },
    {
        "_id": "68edcaaec4797f297c4f5680",
        "userId": "68df78fb1fa97b3fc43db588",
        "items": [
            {
                "productId": "68c6aa10a70ba5cf7a700799",
                "quantity": 10,
                "price": 95000,
                "_id": "68edcaaec4797f297c4f5681"
            }
        ],
        "totalAmount": 950000,
        "status": "pending",
        "createdAt": "2025-10-14T03:59:42.749Z",
        "updatedAt": "2025-10-14T03:59:42.749Z",
        "__v": 0
    }
  ]
  ```

#### 3. Get Order by ID
- **Method**: `GET`
- **URL**: `http://localhost:8002/orders/68edcaaec4797f297c4f5680`
- **Output (Raw)**:
  ```json
  {
      "_id": "68edcaaec4797f297c4f5680",
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "68c6aa10a70ba5cf7a700799",
              "quantity": 10,
              "price": 95000,
              "_id": "68edcaaec4797f297c4f5681"
          }
      ],
      "totalAmount": 950000,
      "status": "pending",
      "createdAt": "2025-10-14T03:59:42.749Z",
      "updatedAt": "2025-10-14T03:59:42.749Z",
      "__v": 0
  }
  ```

#### 4. Update Order Status
- **Method**: `PUT`
- **URL**: `http://localhost:8002/orders/68edcaaec4797f297c4f5680/status`
- **Request Body**:
  ```json
  {
      "status" : "completed"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "_id": "68edcaaec4797f297c4f5680",
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "68c6aa10a70ba5cf7a700799",
              "quantity": 10,
              "price": 95000,
              "_id": "68edcaaec4797f297c4f5681"
          }
      ],
      "totalAmount": 950000,
      "status": "completed",
      "createdAt": "2025-10-14T03:59:42.749Z",
      "updatedAt": "2025-10-14T03:59:42.749Z",
      "__v": 0
  }
  ```

#### 5. Delete Order
- **Method**: `DELETE`
- **URL**: `http://localhost:8002/orders/68edcaaec4797f297c4f5680`
- **Output (Raw)**:
  ```json
  {
      "_id": "68edcaaec4797f297c4f5680",
      "userId": "68df78fb1fa97b3fc43db588",
      "items": [
          {
              "productId": "68c6aa10a70ba5cf7a700799",
              "quantity": 10,
              "price": 95000,
              "_id": "68edcaaec4797f297c4f5681"
          }
      ],
      "totalAmount": 950000,
      "status": "completed",
      "createdAt": "2025-10-14T03:59:42.749Z",
      "updatedAt": "2025-10-14T03:59:42.749Z",
      "__v": 0
  }
  ```

#### Catatan & Error (Order):
1.  **Error Handling**: Jika `cartId` salah saat membuat order, server seharusnya merespons dengan `404 Not Found`, bukan `500 Internal Server Error`.
2.  **Format Respons**: Respons belum bersih dari data internal.
3.  **Keamanan**: Endpoint harus diamankan dengan **token**, dan `userId` harus diambil dari token.
4.  **Validasi**: `GET /orders/user/:userId` tidak memiliki validasi. Jika ID salah, respons tetap `200 OK` dengan array kosong, seharusnya bisa `404 Not Found`.
5.  **Logika Status**: Status order dapat diubah secara bebas. Seharusnya, jika status sudah `completed` atau `cancelled`, status tersebut tidak bisa diubah lagi.
6.  **Hapus Order**: Perlu dipertimbangkan apakah fitur hapus order dibutuhkan. Mungkin lebih baik hanya menonaktifkan atau memindahkannya ke histori.
7.  **Respons Delete**: Respons `DELETE` tidak sesuai, seharusnya pesan konfirmasi.

---

## Payment Service

### 1. Create Payment
- **Method**: `POST`
- **URL**: `http://localhost:8004/payments`
- **Request Body**:
  ```json
  {
      "orderId": "68ee4335bfeae056cfe521e9",
      "userId": "68df78fb1fa97b3fc43db588",
      "method": "Transfer"
  }
  ```
- **Output (Raw)**:
  ```json
  {
      "_id": {
          "buffer": {
              "type": "Buffer",
              "data": [ 104, 238, 80, 63, 126, 170, 7, 99, 84, 93, 18, 200 ]
          }
      },
      "orderId": "68ee4335bfeae056cfe521e9",
      "userId": "68df78fb1fa97b3fc43db588",
      "status": "pending",
      "method": "Transfer",
      "createdAt": "2025-10-14T13:29:36.005Z",
      "updatedAt": "2025-10-14T13:29:36.005Z",
      "__v": 0
  }
  ```

### 2. Get Payments by User ID
- **Method**: `GET`
- **URL**: `http://localhost:8004/payments/user/68df78fb1fa97b3fc43db588`
- **Output (Raw)**:
  ```json
  [
    {
        "_id": {
            "buffer": {
                "type": "Buffer",
                "data": [ 104, 238, 80, 63, 126, 170, 7, 99, 84, 93, 18, 200 ]
            }
        },
        "orderId": "68ee4335bfeae056cfe521e9",
        "userId": "68df78fb1fa97b3fc43db588",
        "method": "Transfer",
        "status": "pending",
        "createdAt": "2025-10-14T13:29:36.005Z",
        "updatedAt": "2025-10-14T13:29:36.005Z",
        "__v": 0
    }
  ]
  ```

### 3. Get Payment by ID
- **Method**: `GET`
- **URL**: `http://localhost:8004/payments/68ee503f7eaa0763545d12c8`
- **Output (Raw)**:
  ```json
  {
      "_id": {
          "buffer": {
              "type": "Buffer",
              "data": [ 104, 238, 80, 63, 126, 170, 7, 99, 84, 93, 18, 200 ]
          }
      },
      "orderId": "68ee4335bfeae056cfe521e9",
      "userId": "68df78fb1fa97b3fc43db588",
      "method": "Transfer",
      "status": "pending",
      "createdAt": "2025-10-14T13:29:36.005Z",
      "updatedAt": "2025-10-14T13:29:36.005Z",
      "__v": 0
  }
  ```

### Catatan & Error (Payment Service):
1.  **Format ID**: `_id` dalam respons pembayaran dikembalikan sebagai struktur `Buffer`, yang tidak standar dan sulit digunakan. Seharusnya `string`.
2.  **Format Respons**: Respons belum bersih dari data internal.
3.  **Validasi `method`**: Tidak ada validasi untuk field `method`. Seharusnya ada daftar metode pembayaran yang diizinkan (misalnya, `enum` dari 'Transfer', 'Credit Card', 'E-Wallet').