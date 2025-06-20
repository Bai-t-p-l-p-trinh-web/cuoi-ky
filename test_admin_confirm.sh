#!/bin/bash

echo "🔄 Testing Admin Payment Confirmation..."

# Test script cho việc xác nhận thanh toán admin
# Chạy script này để debug nhanh

echo "1. 🔍 Checking backend processes..."
ps aux | grep node | grep -v grep

echo ""
echo "2. 📡 Testing payment API endpoint..."

# Sẽ cần payment ID thực tế để test
PAYMENT_ID="REPLACE_WITH_ACTUAL_PAYMENT_ID"
ADMIN_TOKEN="REPLACE_WITH_ADMIN_TOKEN"

echo "Payment ID to test: $PAYMENT_ID"
echo "Admin token: ${ADMIN_TOKEN:0:10}..."

echo ""
echo "3. 🧪 Sample API call:"
echo "PATCH http://localhost:3000/api/payments/$PAYMENT_ID/admin-confirm"
echo "Headers: Authorization: Bearer $ADMIN_TOKEN"
echo "Body: { notes: 'Test confirmation', transactionInfo: { bankTransactionId: 'TEST123' } }"

echo ""
echo "4. 📋 To test manually:"
echo "   - Login as admin: http://localhost:5173/login"
echo "   - Go to: http://localhost:5173/admin/payments"
echo "   - Click 'Payment Flow (Mới)' tab"
echo "   - Filter 'Chờ xác nhận'"
echo "   - Find payment and click 'Xác nhận nhận tiền'"
echo "   - Fill form and submit"
echo "   - Check browser console and backend logs"

echo ""
echo "5. 🔍 Common issues to check:"
echo "   ✓ Payment exists and has status 'pending'"
echo "   ✓ User has admin role"
echo "   ✓ Payment ID is valid MongoDB ObjectId"
echo "   ✓ Request body format is correct"
echo "   ✓ No validation errors"
echo "   ✓ Database connection is working"

echo ""
echo "6. 📊 Backend logs to monitor:"
echo "   - Check console for 'ADMIN CONFIRM PAYMENT' logs"
echo "   - Check for any MongoDB errors"
echo "   - Check for validation errors"

echo ""
echo "✅ Test completed. Check output above for issues."
