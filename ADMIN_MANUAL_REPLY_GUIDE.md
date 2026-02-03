# Admin Manual Reply Setup Guide

## Overview
This guide explains how to enable admin manual reply functionality in the chat system. Admin can now manually type and send responses to customers with enhanced features.

## Features Implemented

### ✅ Admin Manual Reply Capabilities
- **Manual Text Input** - Admin can type custom messages
- **Quick Reply Templates** - Pre-defined responses for common queries
- **Reply to Specific Messages** - Admin can reply to individual customer messages
- **Enhanced Chat Interface** - Admin-specific chat window with reply features
- **Real-time Sending** - Messages are sent immediately when admin clicks send

### ✅ Admin Reply Features
- **Custom Message Input** - Full keyboard support with Enter to send
- **Quick Reply Buttons** - 10 pre-written response templates
- **Reply Context** - Shows which message admin is replying to
- **Message History** - Complete conversation thread maintained
- **Admin Status Indicator** - Shows admin is online and ready to respond

## Setup Instructions

### 1. Update Admin Dashboard
Replace the existing AdminChatPage with the enhanced version:

```tsx
import AdminChatPageEnhanced from './components/chat/AdminChatPageEnhanced';

// In your routing
<Route path="/admin" element={<AdminDashboard />} />
```

### 2. Use AdminChatWindow Component
For admin-specific chat interface:

```tsx
import AdminChatWindow from './components/chat/AdminChatWindow';

// In your admin chat page
<AdminChatWindow
  messages={messages}
  currentUserId={adminId}
  onSendMessage={handleSendMessage}
  onLoadMoreMessages={handleLoadMoreMessages}
  hasMoreMessages={hasMoreMessages}
  loadingMessages={loadingMessages}
  otherUser={selectedUser}
  isAdmin={true}
/>
```

## How Admin Manual Reply Works

### 1. **Manual Typing**
- Admin can type any custom message in the input field
- Press Enter or click Send button to send
- Messages appear immediately in chat

### 2. **Quick Replies**
- Click "Show Quick Replies" to see templates
- Click any template to auto-fill and send
- Templates include common responses like:
  - "Halo, selamat siang! Ada yang bisa saya bantu?"
  - "Terima kasih telah menghubungi kami."
  - "Baik, saya akan bantu proses pesanan Anda."

### 3. **Reply to Messages**
- Click the reply icon (↩️) on any customer message
- Message context is shown in reply
- Admin can reply specifically to that message

### 4. **Enhanced Interface**
- Admin status indicator shows "Admin Online"
- Blue message bubbles for admin messages
- Read receipts (✓✓) for sent messages
- Professional admin chat layout

## Admin Reply Templates

The system includes 10 quick reply templates:

1. **Greeting**: "Halo, selamat siang! Ada yang bisa saya bantu?"
2. **Thanks**: "Terima kasih telah menghubungi kami."
3. **Order Help**: "Baik, saya akan bantu proses pesanan Anda."
4. **Wait**: "Mohon tunggu sebentar, saya cek dulu ya."
5. **Website**: "Untuk informasi lebih lanjut, silakan kunjungi website kami."
6. **Payment**: "Pembayaran bisa dilakukan melalui transfer bank atau e-wallet."
7. **Shipping**: "Paket akan dikirim dalam 1-2 hari kerja."
8. **Tracking**: "Anda bisa track pesanan melalui link yang kami kirimkan."
9. **Apology**: "Mohon maaf atas ketidaknyamanannya."
10. **Closing**: "Terima kasih atas kepercayaan Anda!"

## Testing Admin Manual Reply

### 1. Access Admin Chat
- Navigate to `/admin` route
- Select a conversation (e.g., "M Rasya Zildan")

### 2. Test Manual Typing
1. Click in the input field "Type your admin reply..."
2. Type a custom message: "Baik, saya bantu ya kak!"
3. Press Enter or click Send button
4. Verify message appears in chat window

### 3. Test Quick Replies
1. Click "Show Quick Replies" button
2. Click any template (e.g., "Halo, selamat siang! Ada yang bisa saya bantu?")
3. Verify message is sent automatically

### 4. Test Reply to Message
1. Hover over any customer message
2. Click the reply icon (↩️)
3. Type your reply and send
4. Verify reply context is shown

## API Integration

### Send Message Endpoint
```bash
POST /api/chat/conversations/:id/messages
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "message": "Admin manual reply message",
  "messageType": "text"
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-123",
      "sender_id": "admin-001",
      "receiver_id": "user-002",
      "message": "Admin manual reply message",
      "message_type": "text",
      "is_read": false,
      "timestamp": "2026-02-02T14:11:00.000Z",
      "sender_name": "Admin",
      "sender_display_name": "Admin",
      "sender_avatar": "/rizwords-nomad.jpg"
    }
  }
}
```

## Customization

### Add Custom Quick Replies
Edit the `quickReplies` array in `AdminChatWindow.tsx`:

```tsx
const quickReplies = [
  'Your custom reply 1',
  'Your custom reply 2',
  // ... add more
];
```

### Change Admin Message Style
Modify the CSS classes in `AdminChatWindow.tsx`:

```tsx
// Admin message bubble
className="px-4 py-2 rounded-2xl bg-blue-500 text-white"
```

### Customize Input Placeholder
```tsx
placeholder="Type your admin reply..."
```

## Troubleshooting

### Admin Can't Send Messages
1. Check admin authentication
2. Verify API endpoint is working
3. Check network connection
4. Verify message is not empty

### Quick Replies Not Working
1. Check quickReplies array is populated
2. Verify click handlers are working
3. Check console for errors

### Reply Context Not Showing
1. Verify replyingTo state is set correctly
2. Check reply button click handler
3. Verify message ID is passed correctly

## Security Considerations

- Sanitize admin messages before sending
- Rate limit admin message sending
- Log all admin responses for audit
- Validate message length and content
- Use HTTPS for all communications

## Next Steps

1. **Message Templates**: Add more industry-specific templates
2. **Canned Responses**: Create categorized response libraries
3. **Auto-suggestions**: AI-powered response suggestions
4. **Message Scheduling**: Schedule replies for specific times
5. **Multi-language**: Support replies in multiple languages
6. **Analytics**: Track response times and customer satisfaction

The admin manual reply system is now fully functional! Admin can type custom responses, use quick templates, and reply to specific customer messages. 🎉
