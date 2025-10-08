<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ChatbotController extends Controller
{
    protected ChatbotService $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Send message to chatbot and get response
     */
    public function sendMessage(Request $request): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
            'conversation_history' => 'nullable|array',
            'conversation_history.*.role' => 'required|string|in:user,assistant',
            'conversation_history.*.content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $userMessage = $request->input('message');
        $conversationHistory = $request->input('conversation_history', []);

        // Limit conversation history to last 10 messages to avoid token limit
        if (count($conversationHistory) > 10) {
            $conversationHistory = array_slice($conversationHistory, -10);
        }

        // Send message to Gemini API
        $result = $this->chatbotService->sendMessage($userMessage, $conversationHistory);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'error' => $result['error'] ?? null
            ], 500);
        }

        // Extract product IDs from response
        $products = $this->extractProducts($result['message']);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'products' => $products,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Get suggested questions
     */
    public function getSuggestions(): JsonResponse
    {
        $suggestions = $this->chatbotService->getSuggestedQuestions();

        return response()->json([
            'success' => true,
            'suggestions' => $suggestions
        ]);
    }

    /**
     * Get chatbot info
     */
    public function getInfo(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'name' => 'Trợ lý AI Vanh Electronics',
                'description' => 'Tôi là trợ lý ảo thông minh, chuyên tư vấn về các sản phẩm điện tử: điện thoại, laptop, TV, thiết bị gia dụng và phụ kiện công nghệ.',
                'version' => '1.0.0',
                'capabilities' => [
                    'Tư vấn sản phẩm điện tử',
                    'So sánh sản phẩm, thương hiệu',
                    'Gợi ý sản phẩm phù hợp với nhu cầu',
                    'Giải đáp thắc mắc về tính năng sản phẩm',
                ],
                'limitations' => [
                    'Chỉ tư vấn về sản phẩm điện tử',
                    'Không cung cấp thông tin giá cụ thể',
                    'Không tư vấn về y tế, pháp lý, chính trị',
                ]
            ]
        ]);
    }

    /**
     * Extract product IDs from bot message and fetch products
     */
    private function extractProducts(string $message): array
    {
        // Extract product IDs from ```PRODUCTS:[id1,id2,id3]``` format
        if (preg_match('/```PRODUCTS:\[(\d+(?:,\d+)*)\]```/', $message, $matches)) {
            $ids = array_map('intval', explode(',', $matches[1]));
            
            if (empty($ids)) {
                return [];
            }
            
            // Fetch products from database
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
                ->whereIn('products.id', $ids)
                ->where('products.is_active', true)
                ->get()
                ->toArray();
            
            return $products;
        }
        
        return [];
    }
}
