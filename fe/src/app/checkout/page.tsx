'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useCartStore } from '@/stores/cartStore';
import { ordersApi } from '@/services/api';
import { TAX_RATE } from '@/utils/pricing';
import { CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './checkout.module.scss';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [simulateFail, setSimulateFail] = useState(false);
  const [card, setCard] = useState({ number: '4111111111111111', expiry: '12/26', cvv: '123', name: 'John Doe' });

  const subtotal = getSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = getTotal();

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsLoading(true);
    try {
      const order = await ordersApi.create({
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          size: item.size,
          addOnIds: item.selectedAddOnIds,
          specialInstructions: item.specialInstructions,
        })),
      });

      const paymentResult = await ordersApi.processPayment(order.id, {
        cardNumber: card.number,
        expiryDate: card.expiry,
        cvv: card.cvv,
        cardholderName: card.name,
        mockFail: simulateFail,
      });

      if (paymentResult.success) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/orders/${order.id}`);
      } else {
        toast.error(paymentResult.message || 'Payment failed. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <CreditCard /> Payment Details
            </h2>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Card Number</label>
                <input type="text" value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  className={styles.input} placeholder="4111 1111 1111 1111" />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Expiry</label>
                  <input type="text" value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    className={styles.input} placeholder="MM/YY" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>CVV</label>
                  <input type="text" value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                    className={styles.input} placeholder="123" />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Cardholder Name</label>
                <input type="text" value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  className={styles.input} placeholder="John Doe" />
              </div>
              <label className={styles.failToggle}>
                <input type="checkbox" checked={simulateFail}
                  onChange={(e) => setSimulateFail(e.target.checked)} />
                Simulate payment failure (for testing)
              </label>
            </div>
          </div>

          <div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Order Summary</h2>
              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.menuItemId} className={styles.summaryItem}>
                    <span>{item.menuItem.name} x{item.quantity}</span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.divider}>
                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className={styles.summaryRow}><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className={styles.summaryTotal}><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || items.length === 0}
              className={styles.payBtn}
            >
              <Lock />
              {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
