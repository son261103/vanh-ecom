<?php

namespace App\Http\Responses;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class ApiErrorResponse
{
    /**
     * Handle API exceptions and return standardized error responses.
     */
    public static function handle(Throwable $exception, Request $request): JsonResponse
    {
        // Handle validation errors
        if ($exception instanceof ValidationException) {
            return self::validationError($exception);
        }

        // Handle authentication errors
        if ($exception instanceof AuthenticationException) {
            return self::authenticationError($exception);
        }

        // Handle authorization errors
        if ($exception instanceof AccessDeniedHttpException) {
            return self::authorizationError($exception);
        }

        // Handle model not found errors
        if ($exception instanceof ModelNotFoundException) {
            return self::notFoundError($exception);
        }

        // Handle not found errors
        if ($exception instanceof NotFoundHttpException) {
            return self::notFoundError($exception);
        }

        // Handle method not allowed errors
        if ($exception instanceof MethodNotAllowedHttpException) {
            return self::methodNotAllowedError($exception);
        }

        // Handle HTTP exceptions
        if ($exception instanceof HttpException) {
            return self::httpError($exception);
        }

        // Handle general exceptions
        return self::generalError($exception);
    }

    /**
     * Handle validation errors.
     */
    private static function validationError(ValidationException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $exception->errors(),
            'error_code' => 'VALIDATION_ERROR',
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * Handle authentication errors.
     */
    private static function authenticationError(AuthenticationException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Authentication required',
            'error_code' => 'AUTHENTICATION_ERROR',
        ], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Handle authorization errors.
     */
    private static function authorizationError(AccessDeniedHttpException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Access denied. Insufficient permissions.',
            'error_code' => 'AUTHORIZATION_ERROR',
        ], Response::HTTP_FORBIDDEN);
    }

    /**
     * Handle not found errors.
     */
    private static function notFoundError(Throwable $exception): JsonResponse
    {
        $message = 'Resource not found';
        
        if ($exception instanceof ModelNotFoundException) {
            $model = class_basename($exception->getModel());
            $message = "{$model} not found";
        }

        return response()->json([
            'success' => false,
            'message' => $message,
            'error_code' => 'NOT_FOUND',
        ], Response::HTTP_NOT_FOUND);
    }

    /**
     * Handle method not allowed errors.
     */
    private static function methodNotAllowedError(MethodNotAllowedHttpException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Method not allowed',
            'error_code' => 'METHOD_NOT_ALLOWED',
        ], Response::HTTP_METHOD_NOT_ALLOWED);
    }

    /**
     * Handle HTTP errors.
     */
    private static function httpError(HttpException $exception): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $exception->getMessage() ?: 'HTTP error occurred',
            'error_code' => 'HTTP_ERROR',
        ], $exception->getStatusCode());
    }

    /**
     * Handle general errors.
     */
    private static function generalError(Throwable $exception): JsonResponse
    {
        // Log the error for debugging
        \Log::error('API Error: ' . $exception->getMessage(), [
            'exception' => $exception,
            'trace' => $exception->getTraceAsString(),
        ]);

        // Don't expose internal errors in production
        $message = app()->environment('production') 
            ? 'An error occurred while processing your request'
            : $exception->getMessage();

        return response()->json([
            'success' => false,
            'message' => $message,
            'error_code' => 'INTERNAL_ERROR',
            'debug' => app()->environment('production') ? null : [
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ],
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * Create a standardized success response.
     */
    public static function success($data = null, string $message = 'Success', int $statusCode = Response::HTTP_OK): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Create a standardized error response.
     */
    public static function error(string $message, int $statusCode = Response::HTTP_BAD_REQUEST, string $errorCode = 'ERROR', array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }
}
