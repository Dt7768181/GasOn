import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

const WEBHOOK_SECRET = 'GasOn@2025';

export async function POST(req) {
  const text = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  // 1. Verify the webhook signature
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(text);
  const digest = hmac.digest('hex');

  if (digest !== signature) {
    console.error('Webhook signature validation failed.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 2. Parse the payload and check the event
  const payload = JSON.parse(text);

  if (payload.event !== 'payment.captured') {
    // We only care about successful payments
    return NextResponse.json({ status: 'ok, event not payment.captured' });
  }

  try {
    const paymentEntity = payload.payload.payment.entity;
    const bookingId = paymentEntity.notes?.booking_id;

    if (!bookingId) {
      console.log('Webhook received without booking_id in notes. Cannot process.');
      return NextResponse.json({ status: 'ok, no booking_id' });
    }

    // 3. Find the corresponding booking in Firestore using the bookingId from notes
    const bookingsRef = adminDb.collection('bookings');
    const q = bookingsRef
      .where('id', '==', bookingId)
      .where('status', '==', 'Pending')
      .limit(1);

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      console.log(`Webhook: No pending booking found for bookingId ${bookingId}. It might have already been processed.`);
      return NextResponse.json({ status: 'ok, no booking found or already processed' });
    }
    
    // 4. Update the booking status to 'Confirmed'
    const bookingDoc = querySnapshot.docs[0];
    await bookingDoc.ref.update({
      status: 'Confirmed',
      razorpayPaymentId: paymentEntity.id,
    });

    console.log(`Webhook: Booking ${bookingId} confirmed for user ${bookingDoc.data().userId}.`);

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
