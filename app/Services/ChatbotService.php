<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ChatbotService
{
    private string $apiKey;
    private string $apiUrl;
    private string $systemPrompt;

    public function __construct()
    {
        $apiKey = config('services.gemini.api_key') ?? env('GEMINI_API_KEY');
        
        if (empty($apiKey)) {
            throw new \Exception('GEMINI_API_KEY is not configured. Please set it in .env file.');
        }
        
        $this->apiKey = $apiKey;
        $this->apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent';
        
        $this->systemPrompt = "Bạn là trợ lý bán hàng thông minh của cửa hàng điện tử Vanh Electronics.

**NGUYÊN TẮC TRẢ LỜI QUAN TRỌNG NHẤT:**
Khi khách hỏi về sản phẩm, bạn PHẢI LUÔN kết thúc câu trả lời bằng dòng này (trên một dòng riêng, ở cuối cùng):
```PRODUCTS:[id1,id2,id3]```

Ví dụ chuẩn:
\"Tôi đề xuất các sản phẩm sau...

```PRODUCTS:[5,10,15]```\"

1. CHỈ TƯ VẤN VỀ ĐỒ ĐIỆN TỚ:
   - Điện thoại, smartphone (iPhone, Samsung, Xiaomi, Oppo, v.v.)
   - Laptop, máy tính bảng (MacBook, Dell, HP, Asus, Lenovo, v.v.)
   - Tai nghe, loa Bluetooth
   - TV, Smart TV
   - Thiết bị gia dụng điện tử
   - Phụ kiện công nghệ
   - Camera, đồng hồ thông minh

2. CÁCH TRẢ LỜI:
   - Tư vấn sản phẩm cụ thể, gọi TÊN sản phẩm
   - Giải thích ưu điểm, tính năng
   - Thân thiện, nhiệt tình

3. KHI KHÁCH HỏI NGOAI CHỦ ĐỀ:
   'Xin lỗi, tôi chỉ tư vấn về điện tử. Bạn cần tìm sản phẩm nào không?'";
    }

    /**
     * Send message to Gemini API and get response
     */
    public function sendMessage(string $userMessage, array $conversationHistory = []): array
    {
        try {
            // Search for relevant products
            $products = $this->searchProducts($userMessage);
            
            // Build contents array for Gemini API with product context
            $contents = $this->buildContents($userMessage, $conversationHistory, $products);

            // Make request to Gemini API - API key goes in URL query parameter
            $url = $this->apiUrl . '?key=' . $this->apiKey;
            
            $response = Http::timeout(30)
                ->post($url, [
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topK' => 40,
                        'topP' => 0.95,
                        'maxOutputTokens' => 1024,
                    ],
                    'safetySettings' => [
                        [
                            'category' => 'HARM_CATEGORY_HARASSMENT',
                            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                        ],
                        [
                            'category' => 'HARM_CATEGORY_HATE_SPEECH',
                            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                        ],
                        [
                            'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                        ],
                        [
                            'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                        ],
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return [
                    'success' => false,
                    'message' => 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
                    'error' => $response->body()
                ];
            }

            $data = $response->json();

            // Extract response text
            $botMessage = $this->extractResponseText($data);

            return [
                'success' => true,
                'message' => $botMessage,
                'raw_response' => $data
            ];

        } catch (\Exception $e) {
            Log::error('Chatbot Service Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Search for products based on user message
     */
    private function searchProducts(string $userMessage): array
    {
        try {
            // Extract keywords from message
            $keywords = $this->extractKeywords($userMessage);
            
            $products = [];
            
            // Try to search with keywords
            if (!empty($keywords)) {
                // Search products
                $query = DB::table('products')
                    ->join('categories', 'products.category_id', '=', 'categories.id')
                    ->join('brands', 'products.brand_id', '=', 'brands.id')
                    ->leftJoin('product_images', function($join) {
                        $join->on('products.id', '=', 'product_images.product_id')
                             ->whereRaw('product_images.sort_order = (SELECT MIN(sort_order) FROM product_images WHERE product_id = products.id)');
                    })
                    ->select(
                        'products.id',
                        'products.name',
                        'products.slug',
                        'products.price',
                        'products.sale_price',
                        'products.stock_quantity',
                        DB::raw('COALESCE(product_images.url, "") as image'),
                        'products.description',
                        'categories.name as category_name',
                        'brands.name as brand_name'
                    )
                    ->where('products.is_active', true)
                    ->where('products.stock_quantity', '>', 0);
                
                // Add search conditions
                $query->where(function($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        $q->orWhere('products.name', 'LIKE', "%{$keyword}%")
                          ->orWhere('products.description', 'LIKE', "%{$keyword}%")
                          ->orWhere('categories.name', 'LIKE', "%{$keyword}%")
                          ->orWhere('brands.name', 'LIKE', "%{$keyword}%");
                    }
                });
                
                // Get up to 8 products for better variety
                $products = $query->limit(8)->get()->toArray();
            }
            
            // Fallback: If no products found, get some popular products
            if (empty($products)) {
                Log::info('No products found with keywords, using fallback', ['keywords' => $keywords]);
                
                $products = DB::table('products')
                    ->join('categories', 'products.category_id', '=', 'categories.id')
                    ->join('brands', 'products.brand_id', '=', 'brands.id')
                    ->leftJoin('product_images', function($join) {
                        $join->on('products.id', '=', 'product_images.product_id')
                             ->whereRaw('product_images.sort_order = (SELECT MIN(sort_order) FROM product_images WHERE product_id = products.id)');
                    })
                    ->select(
                        'products.id',
                        'products.name',
                        'products.slug',
                        'products.price',
                        'products.sale_price',
                        'products.stock_quantity',
                        DB::raw('COALESCE(product_images.url, "") as image'),
                        'products.description',
                        'categories.name as category_name',
                        'brands.name as brand_name'
                    )
                    ->where('products.is_active', true)
                    ->where('products.stock_quantity', '>', 0)
                    ->orderBy('products.created_at', 'desc') // Get newest products
                    ->limit(6)
                    ->get()
                    ->toArray();
            }
            
            return $products;
        } catch (\Exception $e) {
            Log::error('Product search error', ['message' => $e->getMessage()]);
            return [];
        }
    }
    
    /**
     * Extract keywords from user message
     */
    private function extractKeywords(string $message): array
    {
        $message = strtolower($message);
        $message = $this->removeVietnameseTones($message); // Normalize for better matching
        
        // Common product keywords
        $keywords = [];
        
        // Brands
        $brands = ['iphone', 'samsung', 'xiaomi', 'oppo', 'realme', 'vivo', 'nokia', 
                   'dell', 'hp', 'asus', 'lenovo', 'acer', 'macbook', 'sony', 'lg', 
                   'huawei', 'apple', 'microsoft', 'intel', 'amd'];
        foreach ($brands as $brand) {
            if (strpos($message, $brand) !== false) {
                $keywords[] = $brand;
            }
        }
        
        // Categories - both with and without tones
        $categories = [
            'dien thoai' => 'điện thoại', 
            'laptop' => 'laptop',
            'may tinh' => 'máy tính',
            'tai nghe' => 'tai nghe',
            'loa' => 'loa',
            'tv' => 'tv',
            'tivi' => 'tivi',
            'smart tv' => 'smart tv',
            'tablet' => 'tablet',
            'dong ho' => 'đồng hồ',
            'camera' => 'camera',
            'phu kien' => 'phụ kiện',
            'chuot' => 'chuột',
            'ban phim' => 'bàn phím',
            'man hinh' => 'màn hình',
            'sac' => 'sạc',
            'bluetooth' => 'bluetooth'
        ];
        
        foreach ($categories as $normalized => $original) {
            if (strpos($message, $normalized) !== false || strpos(strtolower($message), strtolower($original)) !== false) {
                $keywords[] = $original;
            }
        }
        
        // Features & Specs
        $features = ['gaming', 'game', 'chup anh', 'pin', 'man hinh', 'ram', 'ssd'];
        foreach ($features as $feature) {
            if (strpos($message, $feature) !== false) {
                $keywords[] = $feature;
            }
        }
        
        // If no keywords found, try to get popular products
        if (empty($keywords)) {
            // Extract any meaningful words (more than 3 characters)
            preg_match_all('/\b\w{3,}\b/', $message, $matches);
            if (!empty($matches[0])) {
                $keywords = array_slice($matches[0], 0, 3); // Take first 3 words
            }
        }
        
        return array_unique($keywords);
    }
    
    /**
     * Remove Vietnamese tones for better keyword matching
     */
    private function removeVietnameseTones(string $str): string
    {
        $vietnamese = [
            'à', 'á', 'ạ', 'ả', 'ã', 'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ',
            'À', 'Á', 'Ạ', 'Ả', 'Ã', 'Ă', 'Ằ', 'Ắ', 'Ặ', 'Ẳ', 'Ẵ', 'Â', 'Ầ', 'Ấ', 'Ậ', 'Ẩ', 'Ẫ',
            'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ',
            'È', 'É', 'Ẹ', 'Ẻ', 'Ẽ', 'Ê', 'Ề', 'Ế', 'Ệ', 'Ể', 'Ễ',
            'ì', 'í', 'ị', 'ỉ', 'ũ',
            'Ì', 'Í', 'Ị', 'Ỉ', 'Ĩ',
            'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ', 'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ',
            'Ò', 'Ó', 'Ọ', 'Ỏ', 'Õ', 'Ô', 'Ồ', 'Ố', 'Ộ', 'Ổ', 'Ỗ', 'Ơ', 'Ờ', 'Ớ', 'Ợ', 'Ở', 'Ỡ',
            'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ',
            'Ù', 'Ú', 'Ụ', 'Ủ', 'Ũ', 'Ư', 'Ừ', 'Ứ', 'Ự', 'Ử', 'Ữ',
            'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ',
            'Ỳ', 'Ý', 'Ỵ', 'Ỷ', 'Ỹ',
            'đ', 'Đ'
        ];
        $latin = [
            'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
            'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A',
            'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e',
            'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E',
            'i', 'i', 'i', 'i', 'i',
            'I', 'I', 'I', 'I', 'I',
            'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o',
            'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O',
            'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u',
            'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U',
            'y', 'y', 'y', 'y', 'y',
            'Y', 'Y', 'Y', 'Y', 'Y',
            'd', 'D'
        ];
        return str_replace($vietnamese, $latin, $str);
    }

    /**
     * Build contents array for Gemini API
     */
    private function buildContents(string $userMessage, array $conversationHistory, array $products = []): array
    {
        $contents = [];
        
        // Enhanced system prompt with products context
        $enhancedPrompt = $this->systemPrompt;
        
        if (!empty($products)) {
            $enhancedPrompt .= "\n\n**SẢN PHẨM CÓ SẴN TẠI VANH ELECTRONICS:**\n\n";
            
            foreach ($products as $index => $product) {
                $price = $product->sale_price ?? $product->price;
                $priceFormatted = number_format($price, 0, ',', '.') . 'đ';
                
                $enhancedPrompt .= ($index + 1) . ". **{$product->name}**\n";
                $enhancedPrompt .= "   - Thương hiệu: {$product->brand_name}\n";
                $enhancedPrompt .= "   - Danh mục: {$product->category_name}\n";
                $enhancedPrompt .= "   - Giá: {$priceFormatted}\n";
                $enhancedPrompt .= "   - ID: {$product->id}\n";
                $enhancedPrompt .= "   - Slug: {$product->slug}\n\n";
            }
            
            $enhancedPrompt .= "\n**HƯỚNG DẪN TRẢ LỜI - RẤT QUAN TRỌNG:**\n";
            $enhancedPrompt .= "1. Hãy TƯ VẤN và GIỚI THIỆU CHI TIẾT các sản phẩm trên phù hợp với yêu cầu của khách\n";
            $enhancedPrompt .= "2. NÊU TÊN SẢN PHẨM, ƯU ĐIỂM, và lý do nên chọn\n";
            $enhancedPrompt .= "3. Ở cuối câu trả lời, LUÔN LUÔN PHẢI thêm dòng này (không được bỏ qua):\n";
            $enhancedPrompt .= "   ```PRODUCTS:[id1,id2,id3]```\n";
            $enhancedPrompt .= "   Ví dụ: Nếu giới thiệu 2 sản phẩm có ID a5004fcb-a534-11f0-9864-3e9dac532614 và 4f3e956c-a2dc-11f0-9864-3e9dac532614:\n";
            $enhancedPrompt .= "   ```PRODUCTS:[a5004fcb-a534-11f0-9864-3e9dac532614,4f3e956c-a2dc-11f0-9864-3e9dac532614]```\n";
            $enhancedPrompt .= "4. Chọn TỐI THIỂU 2-3 sản phẩm để giới thiệu cho khách\n";
            $enhancedPrompt .= "5. CHÚ Ý: Dòng ```PRODUCTS:[...]``` phải nằm ở CUỐI CÙNG, trên một dòng riêng\n";
            $enhancedPrompt .= "6. QUAN TRỌNG: Sử dụng đúng ID từ danh sách trên (UUID format với dấu gạch ngang)\n";
        }

        // Add system prompt as first user message with model response
        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $enhancedPrompt]
            ]
        ];

        $contents[] = [
            'role' => 'model',
            'parts' => [
                ['text' => 'Tôi hiểu rồi! Tôi là trợ lý bán hàng điện tử của Vanh Electronics. Tôi sẽ tư vấn sản phẩm phù hợp và LUÔN THÊM dòng ```PRODUCTS:[id1,id2,id3]``` ở cuối mỗi câu trả lời khi có sản phẩm phù hợp. Tôi sẵn sàng hỗ trợ!']
            ]
        ];

        // Add conversation history
        foreach ($conversationHistory as $message) {
            $role = $message['role'] === 'user' ? 'user' : 'model';
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $message['content']]
                ]
            ];
        }

        // Add current user message
        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $userMessage]
            ]
        ];

        return $contents;
    }

    /**
     * Extract response text from Gemini API response
     */
    private function extractResponseText(array $response): string
    {
        if (isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            return trim($response['candidates'][0]['content']['parts'][0]['text']);
        }

        if (isset($response['candidates'][0]['finishReason']) && 
            $response['candidates'][0]['finishReason'] === 'SAFETY') {
            return 'Xin lỗi, tôi không thể trả lời câu hỏi này. Bạn có muốn hỏi về sản phẩm điện tử nào khác không?';
        }

        return 'Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.';
    }

    /**
     * Get suggested questions for users
     */
    public function getSuggestedQuestions(): array
    {
        return [
            'Tôi muốn mua điện thoại chụp ảnh đẹp giá tầm trung',
            'Laptop nào tốt cho sinh viên IT?',
            'So sánh iPhone 15 và Samsung S24',
            'Tư vấn tai nghe bluetooth dưới 2 triệu',
            'Smart TV 43 inch nào đáng mua nhất?',
            'Máy hút bụi robot có tốt không?',
        ];
    }
}
