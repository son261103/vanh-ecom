# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Vanh E-Commerce is a full-featured e-commerce frontend application built with React 19, TypeScript, Vite, and Tailwind CSS. It provides separate interfaces for admin users (product/catalog management) and customers (shopping experience).

The application uses a Laravel backend API (expected at `http://localhost:8000/api` or configured via `VITE_API_URL` environment variable).

## Development Commands

### Setup
```powershell
# Install dependencies
npm install

# Copy environment file and configure
Copy-Item .env.example .env
# Edit .env to set VITE_API_URL if backend is not at http://localhost:8000/api
```

### Development
```powershell
# Start development server (runs on http://localhost:5173)
npm run dev
```

### Build and Preview
```powershell
# Type-check and build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality
```powershell
# Run ESLint
npm run lint

# Lint with auto-fix
npm run lint -- --fix
```

## Architecture Overview

### Authentication & Authorization Flow

The app uses JWT token-based authentication with role-based access control:
- **Token Storage**: JWT tokens stored in `localStorage` as `auth_token`
- **User Storage**: User data stored in `localStorage` as serialized JSON under `user` key
- **Auto-redirect**: Axios interceptors automatically redirect to `/login` on 401 responses
- **Role-based routing**: Two separate route trees for `admin` and `customer` roles
- **Protected routes**: `ProtectedRoute` component validates authentication and role before rendering

Key files:
- `src/store/authStore.ts` - Zustand store managing auth state
- `src/lib/axios.ts` - Axios instance with auth interceptors
- `src/components/auth/ProtectedRoute.tsx` - Route protection HOC

### State Management Architecture

The application uses **Zustand** for all global state. Each domain has its own store:

**Core Stores:**
- `authStore` - Authentication state, login/logout, user data
- `cartStore` - Shopping cart state and operations
- `productStore` - Product listing, filtering, CRUD (admin)
- `catalogStore` - Categories and brands management
- `orderStore` - Order management for both users and admin
- `profileStore` - User profile management
- `adminUserStore` - Admin user management (CRUD users, permissions)

**Store Pattern:**
All stores follow a consistent pattern:
1. State properties (data, isLoading, error)
2. Async actions that call service layer
3. Local state updates after API success
4. Toast notifications for user feedback
5. Error handling with user-friendly messages

### Service Layer (API Communication)

All backend communication is centralized in the `src/services/` directory. Services use the shared Axios instance from `src/lib/axios.ts`.

**Key Services:**
- `authService.ts` - Login, register, password reset
- `productService.ts` - Product CRUD, public/admin endpoints
- `categoryService.ts` - Category management
- `brandService.ts` - Brand management
- `cartService.ts` - Cart operations
- `orderService.ts` - Order management
- `profileService.ts` - User profile operations
- `adminUserService.ts` - Admin user management

**API Patterns:**
- Public endpoints: `/public/*` - No auth required
- User endpoints: `/user/*` - Requires customer role
- Admin endpoints: `/admin/*` - Requires admin role
- All responses follow Laravel format: `{ success: boolean, data: any }` or `{ success: boolean, meta: {}, data: [] }`

### Routing Structure

**Public Routes** (`/`):
- `/login`, `/register`, `/forgot-password`, `/reset-password`

**Admin Routes** (`/admin`):
- `/admin/dashboard` - Admin dashboard with statistics
- `/admin/products` - Product list, create, edit
- `/admin/categories` - Category management
- `/admin/brands` - Brand management
- `/admin/orders` - Order management
- `/admin/profile` - Admin profile

**User Routes** (`/user`):
- `/user/dashboard` - User dashboard
- `/user/products` - Product catalog with filters
- `/user/products/:slug` - Product detail page
- `/user/cart` - Shopping cart
- `/user/checkout` - Checkout flow
- `/user/orders` - Order history
- `/user/orders/:id` - Order detail
- `/user/profile` - User profile settings

**Route Protection:**
Root path `/` redirects based on authentication state and user role.

### Component Structure

**Layout Components:**
- `AdminLayout.tsx` - Wraps all admin pages with navigation
- `UserLayout.tsx` - Wraps all customer pages with header/footer

**Shared Components:**
- `Modal.tsx` - Reusable modal dialog
- `Pagination.tsx` - Pagination controls
- `Table.tsx` - Data table component
- Alert, Button, Card, Input - UI primitives

**Feature-specific Components:**
Organized by domain under `src/pages/`:
- `admin/` - Admin feature pages
- `user/` - Customer-facing pages
- `auth/` - Authentication pages

### Styling and Theming

**Design System:**
- **Framework**: Tailwind CSS v3.4
- **Color Palette**: Rose/Pink theme (customized in `tailwind.config.js`)
  - Primary: `primary-*` (pink shades: 50-950)
  - Accent: `rose-*` (rose shades: 50-950)
- **Typography**: System font stack
- **Spacing**: Tailwind's default spacing scale
- **Components**: Custom components use consistent Tailwind utility classes

**Theme Configuration:**
The `tailwind.config.js` defines custom color palettes. When styling new components, prefer using `primary-*` and `rose-*` tokens over hardcoded colors.

### Toast Notifications

**Library**: `react-hot-toast`

**Configuration** (in `App.tsx`):
- Position: top-right
- Duration: 3s (success), 4s (error)
- Dark theme with custom styling

**Usage Pattern:**
The `src/utils/toast.ts` utility provides:
- `showToast.success()` - Success messages
- `showToast.error()` - Error messages with automatic API error extraction
- `getErrorMessage()` - Extracts user-friendly error from API responses

**Convention:**
All Zustand store actions should call toast utilities after operations for consistent user feedback.

### Type Definitions

All TypeScript types are centralized in `src/types/`:
- `auth.ts` - User, auth response, credentials
- `product.ts` - Product, filters, pagination
- `cart.ts` - Cart, cart items
- `order.ts` - Order, order items, statuses
- `index.ts` - Re-exports all types

**Type Import Convention:**
Import types from `src/types` barrel export:
```typescript
import type { User, Product, Order } from '../types';
```

### Form Handling

**Library**: `react-hook-form` v7.63

**Pattern:**
Most forms use controlled components with `react-hook-form`:
1. Define form schema/validation
2. Use `useForm()` hook
3. Handle submission with store actions
4. Display validation errors inline
5. Show loading states during submission

See `src/pages/auth/Login.tsx` or `src/pages/admin/products/ProductForm.tsx` for examples.

### Image Handling

**Utilities:** `src/utils/imageUtils.ts`

**Pattern:**
- Images are uploaded as `File[]` via FormData
- Product/Brand images sent to backend as multipart/form-data
- The service layer handles FormData construction
- Backend returns image URLs in responses

## Backend API Contract

The frontend expects a Laravel-style API with these conventions:

**Response Format:**
```json
{
  "success": true,
  "data": { /* single object */ }
}
```

Or for lists:
```json
{
  "success": true,
  "data": [/* array */],
  "meta": {
    "current_page": 1,
    "total": 100,
    "per_page": 15
  }
}
```

**Authentication:**
- JWT tokens sent as `Authorization: Bearer <token>` header
- Token managed automatically by Axios interceptors
- 401 responses trigger logout and redirect to login

**File Uploads:**
- Use `multipart/form-data`
- Laravel expects PUT/PATCH via `_method` field in FormData

## Development Patterns

### Adding a New Entity Type

When adding a new entity (e.g., "Promotions"):

1. **Define types** in `src/types/promotion.ts`, export from `src/types/index.ts`
2. **Create service** at `src/services/promotionService.ts` with CRUD operations
3. **Create Zustand store** at `src/store/promotionStore.ts`
4. **Add routes** in `src/App.tsx` under appropriate section (admin/user)
5. **Create page components** under `src/pages/admin/promotions/` or similar
6. **Update navigation** in `AdminLayout.tsx` or `UserLayout.tsx`

### State Update Pattern

When modifying data:
1. Set `isLoading: true` and clear error
2. Call service method
3. Update local state optimistically or refetch
4. Set `isLoading: false`
5. Show success toast
6. On error: set error state, show error toast, throw error if needed

### Error Handling Pattern

All API calls should:
1. Use try/catch blocks
2. Extract user-friendly messages with `getErrorMessage(error)`
3. Display errors via toast: `showToast.error(errorMessage)`
4. Set store error state for component-level handling
5. Optionally throw error if caller needs to handle it

## Code Conventions

### Import Order
1. React imports
2. Third-party libraries
3. Types
4. Stores/hooks
5. Services
6. Components
7. Utils

### File Naming
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Services: camelCase (e.g., `productService.ts`)
- Stores: camelCase (e.g., `productStore.ts`)
- Types: camelCase (e.g., `product.ts`)
- Utils: camelCase (e.g., `imageUtils.ts`)

### Component Structure
1. Imports
2. Props interface (if applicable)
3. Component definition
4. Early returns (loading, error states)
5. Main JSX return

### TypeScript
- Use `type` for object shapes and unions
- Use `interface` for extendable contracts (props, config)
- Always type function parameters and return values
- Avoid `any` - use `unknown` if type is truly unknown

## Testing Strategy

**Note:** The codebase currently has no test setup. When adding tests:

- Use Vitest (Vite's test runner)
- Test stores with mock API responses
- Test critical user flows (auth, checkout, cart)
- Component tests with React Testing Library
- Mock Zustand stores for component tests

## Common Gotchas

1. **Token refresh**: There is no token refresh mechanism. Tokens expire and require re-login.

2. **LocalStorage sync**: User data is cached in localStorage. If backend user data changes, it won't reflect until logout/login or explicit refresh.

3. **Form data for updates**: Laravel expects PUT/PATCH via POST with `_method` field when using FormData (see `productService.updateProduct`).

4. **Role checking**: Always check `user.role === 'admin'` or `'customer'`, not just authentication status.

5. **Axios base URL**: Configure `VITE_API_URL` in `.env` for backend API location. Defaults to `http://localhost:8000/api`.

6. **Cart state**: Cart is tied to authenticated user. Not implemented for guest users.

7. **Image paths**: Backend returns relative or full URLs. Ensure consistency between local and production environments.

## Environment Variables

Required variables (see `.env.example`):

```
VITE_API_URL=http://localhost:8000/api
```

Access in code via `import.meta.env.VITE_API_URL`.

## Additional Context

**Vietnamese Language**: UI text and toast messages are in Vietnamese. Keep this consistent when adding new features.

**Responsive Design**: All pages are responsive (mobile, tablet, desktop). Use Tailwind responsive modifiers (`sm:`, `md:`, `lg:`) consistently.

**Admin Features Summary**: See `ADMIN_FEATURES_SUMMARY.md` for detailed Vietnamese documentation of admin features, stores, and pages.
