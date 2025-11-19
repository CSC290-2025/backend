# Auth Module Usage Guide

## Overview

### Server-Side Data

```typescript
const user = c.get('user'); // or payload
```

## Frontend Usage (React + Axios + React Query)

### 1. Register User

```typescript
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: { email: string; username: string; password: string }) =>
      apiClient.post('/auth/register', data),
    onSuccess: (response) => {
      // Cookies set automatically, user logged in
      // Redirect to dashboard maybe
    },
  });
};

// Usage in component
function RegisterForm() {
  const { mutate } = useRegister();

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutate({ email, username, password });
    }}>
      {/* form fields */}
    </form>
  );
}
```

### 2. Login User

```typescript
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),
    onSuccess: () => {
      // Cookies set automatically
      // Redirect or update app state
    },
  });
};
```

### 3. Get Authentication Status

```typescript
export const useAuthenticated = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get('/auth/me').then(res => res.data.data),
  });
};

// Usage
function CheckUser() {
  const { data, isLoading } = useAuthenticated();
  
  return <div>User ID: {data?.userId}, Authenticated: {data?.authenticated}</div>;
}
```

### 4. Logout

```typescript
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      // Redirect to login
    },
  });
};
```

## Backend API Responses

### Login Response

```json
{
  "success": true,
  "data": {},
  "message": "Login successful",
  "timestamp": "2025-11-18T04:02:18.248Z"
}
```

**Cookies Set:**

- `accessToken` (HTTP-only, short expiry)
- `refreshToken` (HTTP-only, long expiry)

### Register Response

```json
{
  "success": true,
  "data": {},
  "message": "Registration successful",
  "timestamp": "2025-11-18T04:02:18.248Z"
}
```

**Cookies Set:**

- `accessToken` (HTTP-only, short expiry)
- `refreshToken` (HTTP-only, long expiry)

### Me Response (Get Current User)

```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "userId": 18
  },
  "timestamp": "2025-11-18T04:02:18.248Z"
}
```

### Logout Response

```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2025-11-18T04:02:18.248Z"
}
```
