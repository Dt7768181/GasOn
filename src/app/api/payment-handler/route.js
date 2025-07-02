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
    const amount = paymentEntity.amount / 100; // Amount is in paise
    const contact = paymentEntity.contact?.replace('+91', '') || '';

    if (!contact) {
      console.log('Webhook received without contact number. Cannot process.');
      return NextResponse.json({ status: 'ok, no contact info' });
    }

    // 3. Find the corresponding booking in Firestore
    const bookingsRef = adminDb.collection('bookings');
    const q = bookingsRef
      .where('userId', '==', contact)
      .where('amount', '==', amount)
      .where('status', '==', 'Pending')
      .limit(1);

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      console.log(`Webhook: No pending booking found for user ${contact} with amount ${amount}`);
      return NextResponse.json({ status: 'ok, no booking found' });
    }
    
    // 4. Update the booking status to 'Confirmed'
    const bookingDoc = querySnapshot.docs[0];
    await bookingDoc.ref.update({
      status: 'Confirmed',
      razorpayPaymentId: paymentEntity.id, // Good practice to store this
    });

    console.log(`Webhook: Booking ${bookingDoc.data().id} confirmed for user ${contact}.`);

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
