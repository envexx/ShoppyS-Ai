# URL Routing System Guide

## Overview

Sistem URL routing telah diperbaiki untuk menggunakan format `/chat/[sessionId]` yang lebih terstruktur dan mudah dikelola.

## URL Structure

### Format URL Baru

- **New Chat**: `/chat/new`
- **Specific Session**: `/chat/[sessionId]`
- **Landing Page**: `/`
- **Authentication**: `/auth`

### Contoh URL

```
/chat/new                    # Chat baru
/chat/session_123456         # Session dengan ID spesifik
/chat/abc-def-ghi           # Session dengan ID custom
```

## Komponen Utama

### 1. App.tsx - Route Configuration

```typescript
// Routes yang diperbarui
<Route path="/chat/new" element={<ChatPage />} />
<Route path="/chat/:sessionId" element={<ChatPage />} />
```

### 2. ChatPage.tsx - Session Management

```typescript
// Menggunakan useParams untuk mendapatkan sessionId
const { sessionId } = useParams<{ sessionId: string }>();

// Menggunakan ChatRedirect untuk menangani URL
<ChatRedirect onSessionSelect={handleSessionSelect} />
```

### 3. ChatSidebar.tsx - Navigation

```typescript
// Fungsi helper untuk navigation
const handleNewChat = () => {
  onChatSelect('new-chat');
  URL_MANAGER.navigateToNewChat();
};

const handleChatSelect = (sessionId: string) => {
  onChatSelect(sessionId);
  URL_MANAGER.navigateToSession(sessionId);
};
```

### 4. URL_MANAGER - Utility Functions

```typescript
// Fungsi utama
URL_MANAGER.getCurrentSessionId()     // Mendapatkan session ID dari URL
URL_MANAGER.navigateToSession(id)     // Navigate ke session tertentu
URL_MANAGER.navigateToNewChat()       // Navigate ke chat baru
URL_MANAGER.isNewChat()               // Cek apakah URL untuk chat baru
URL_MANAGER.isSpecificSession()       // Cek apakah URL untuk session spesifik
```

## Keuntungan Sistem Baru

### ✅ **URL Terstruktur**
- Format yang konsisten: `/chat/[sessionId]`
- Mudah dipahami dan diprediksi
- SEO-friendly

### ✅ **Session Management yang Lebih Baik**
- Session ID langsung terlihat di URL
- Tidak perlu mencari session ID di state
- Mudah untuk bookmark dan share

### ✅ **Navigation yang Lebih Cerdas**
- URL otomatis terupdate saat session berubah
- Browser back/forward button bekerja dengan baik
- Deep linking langsung ke session tertentu

### ✅ **Maintenance yang Lebih Mudah**
- Tidak perlu susah mencari session ID
- Debugging lebih mudah dengan URL yang jelas
- Testing lebih straightforward

## Cara Kerja

### 1. **New Chat Creation**
```typescript
// User klik "New Chat"
handleNewChat() → navigate('/chat/new') → ChatRedirect → setSelectedChat('new-chat')
```

### 2. **Session Selection**
```typescript
// User pilih session dari sidebar
handleChatSelect(sessionId) → navigate(`/chat/${sessionId}`) → ChatRedirect → setSelectedChat(sessionId)
```

### 3. **URL Sync**
```typescript
// Saat session baru dibuat
handleNewChatCreated(sessionId) → URL_MANAGER.navigateToSession(sessionId) → URL terupdate
```

## Testing

Untuk test sistem URL, gunakan:

```typescript
// Di browser console
import testURLManager from './utils/urlManager.test';
testURLManager();
```

## Migration Notes

### Dari Sistem Lama
- **Sebelum**: `/chat` (tanpa session ID)
- **Sesudah**: `/chat/new` atau `/chat/[sessionId]`

### Perubahan yang Diperlukan
1. Update semua redirect ke `/chat/new`
2. Gunakan URL_MANAGER untuk navigation
3. Pastikan ChatRedirect component terpasang

## Best Practices

### ✅ **Gunakan URL_MANAGER**
```typescript
// ✅ Benar
URL_MANAGER.navigateToSession(sessionId);

// ❌ Hindari
navigate(`/chat/${sessionId}`);
```

### ✅ **Handle Session ID dengan Benar**
```typescript
// ✅ Benar
const { sessionId } = useParams<{ sessionId: string }>();

// ❌ Hindari
const sessionId = localStorage.getItem('currentSession');
```

### ✅ **Gunakan ChatRedirect Component**
```typescript
// ✅ Benar
<ChatRedirect onSessionSelect={handleSessionSelect} />

// ❌ Hindari
useEffect(() => {
  // Manual URL handling
}, [sessionId]);
```

## Troubleshooting

### **URL Tidak Terupdate**
- Pastikan URL_MANAGER digunakan
- Cek apakah ChatRedirect component terpasang
- Verify bahwa navigate function dipanggil

### **Session Tidak Berubah**
- Cek useParams hook
- Verify ChatRedirect component
- Pastikan onSessionSelect callback bekerja

### **Browser Back Button Tidak Bekerja**
- Pastikan URL terupdate dengan pushState
- Cek apakah route configuration benar
- Verify bahwa ChatRedirect menangani URL changes
