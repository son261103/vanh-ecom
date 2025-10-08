# Cải Tiến Chatbot - Hiển Thị Sản Phẩm

## Vấn Đề
Chatbot không hiển thị sản phẩm khi người dùng hỏi về sản phẩm điện tử.

## Nguyên Nhân
1. **Lỗi database schema**: Code sử dụng column `stock` và `status` nhưng database có `stock_quantity` và `is_active`
2. **Prompt chưa đủ mạnh**: Gemini AI không luôn trả về format `PRODUCTS:[id1,id2,id3]` đúng cách
3. **Keyword matching yếu**: Không nhận diện được tiếng Việt không dấu

## Giải Pháp Đã Thực Hiện

### 1. Sửa Database Schema Issues ✅
**Files đã sửa:**
- `app/Services/ChatbotService.php`
- `app/Http/Controllers/Api/ChatbotController.php`
- `frontend/src/services/chatbotService.ts`
- `frontend/src/components/chatbot/ProductCard.tsx`

**Thay đổi:**
```php
// TỪ:
'products.stock'           → 'products.stock_quantity'
'products.status'          → 'products.is_active'
->where('status', 'active') → ->where('is_active', true)
```

### 2. Cải Thiện System Prompt ✅
**File: `app/Services/ChatbotService.php`**

Thêm **NGUYÊN TẮC QUAN TRỌNG NHẤT** vào đầu prompt:
```
Khi khách hỏi về sản phẩm, bạn PHẢI LUÔN kết thúc câu trả lời bằng:
```PRODUCTS:[id1,id2,id3]```

Ví dụ chuẩn:
"Tôi đề xuất các sản phẩm sau...

```PRODUCTS:[5,10,15]```"
```

### 3. Cải Thiện Keyword Extraction ✅
**Thêm function mới:** `removeVietnameseTones()`
- Normalize tiếng Việt có dấu → không dấu
- Matching tốt hơn với user input

**Mở rộng keywords:**
```php
// Thêm brands: 'huawei', 'apple', 'microsoft', 'intel', 'amd'
// Thêm categories: 'chuột', 'bàn phím', 'màn hình', 'sạc', 'bluetooth'
// Thêm features: 'gaming', 'game', 'chup anh', 'pin', 'ram', 'ssd'
```

### 4. Fallback Mechanism ✅
Nếu không tìm thấy sản phẩm theo keyword:
```php
// Lấy 6 sản phẩm mới nhất thay vì trả về rỗng
->orderBy('products.created_at', 'desc')
->limit(6)
```

### 5. Tăng Số Sản Phẩm ✅
- Từ 6 → **8 sản phẩm** để AI có nhiều lựa chọn hơn
- AI sẽ chọn 2-3 sản phẩm phù hợp nhất từ 8 sản phẩm này

### 6. Hướng Dẫn Chi Tiết Hơn Cho AI ✅
```
1. Hãy TƯ VẤN và GIỚI THIỆU CHI TIẾT
2. NÊU TÊN SẢN PHẨM, ƯU ĐIỂM
3. Ở cuối câu trả lời, LUÔN LUÔN PHẢI thêm dòng này
4. Chọn TỐI THIỂU 2-3 sản phẩm
5. CHÚ Ý: Dòng ```PRODUCTS:[...]``` phải ở CUỐI CÙNG, trên một dòng riêng
```

## Kết Quả Mong Đợi

### Trước:
```
User: "xin chào máy có những sản phẩm gì"
Bot: "Chào bạn! Tại Vanh Electronics, chúng tôi có rất nhiều sản phẩm..."
[KHÔNG CÓ SẢN PHẨM HIỂN THỊ]
```

### Sau:
```
User: "xin chào máy có những sản phẩm gì"
Bot: "Chào bạn! Tôi xin giới thiệu một số sản phẩm nổi bật:

1. **iPhone 15 Pro Max** - Điện thoại cao cấp với...
2. **Samsung Galaxy S24** - Màn hình tuyệt đẹp...
3. **MacBook Air M3** - Laptop mỏng nhẹ...

```PRODUCTS:[5,10,15]```"

[HIỂN THỊ 3 PRODUCT CARDS]
```

## Testing

### Test Case 1: Hỏi chung
```
Input: "xin chào máy có những sản phẩm gì"
Expected: Hiển thị 2-3 sản phẩm mới nhất
```

### Test Case 2: Hỏi cụ thể
```
Input: "tôi muốn mua điện thoại iPhone"
Expected: Hiển thị các sản phẩm iPhone
```

### Test Case 3: Tiếng Việt không dấu
```
Input: "dien thoai samsung"
Expected: Hiển thị các sản phẩm Samsung (nhờ removeVietnameseTones)
```

### Test Case 4: Từ khóa không tìm thấy
```
Input: "máy chiếu"
Expected: Hiển thị sản phẩm phổ biến (fallback mechanism)
```

## Các Files Đã Thay Đổi

### Backend (PHP/Laravel)
1. ✅ `app/Services/ChatbotService.php` - Core logic
2. ✅ `app/Http/Controllers/Api/ChatbotController.php` - Extract products

### Frontend (React/TypeScript)
3. ✅ `frontend/src/services/chatbotService.ts` - Type definitions
4. ✅ `frontend/src/components/chatbot/ProductCard.tsx` - Display products

## Checklist

- [x] Sửa column `stock` → `stock_quantity`
- [x] Sửa column `status` → `is_active`
- [x] Cải thiện system prompt
- [x] Thêm Vietnamese tone removal
- [x] Mở rộng keywords
- [x] Thêm fallback mechanism
- [x] Tăng limit sản phẩm 6→8
- [x] Cập nhật TypeScript interfaces
- [x] Cập nhật ProductCard component

## Chạy Lại Project

```bash
# Backend - không cần migrate vì chỉ sửa code
# Just restart server if needed

# Frontend - rebuild TypeScript
cd frontend
npm run build
# hoặc
npm run dev
```

## Lưu Ý Quan Trọng

1. **Gemini API Key**: Đảm bảo `GEMINI_API_KEY` đã được set trong `.env`
2. **Products trong DB**: Phải có ít nhất vài sản phẩm với `is_active=true` và `stock_quantity>0`
3. **Image URLs**: Sản phẩm phải có hình ảnh hợp lệ

## Troubleshooting

### Vẫn không hiển thị sản phẩm?
1. Check logs: `storage/logs/laravel.log`
2. Kiểm tra có sản phẩm active: `SELECT * FROM products WHERE is_active=1 AND stock_quantity>0`
3. Test Gemini API response có chứa `PRODUCTS:[...]` không

### Sản phẩm sai?
- Cải thiện keywords trong `extractKeywords()` function
- Thêm synonyms cho categories

### Response chậm?
- Gemini API có thể mất 2-5 giây
- Consider caching cho popular queries
