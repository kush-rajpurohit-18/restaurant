'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { getCartItemPrice, TAX_RATE } from '@/utils/pricing';
import toast from 'react-hot-toast';
import styles from './cart.module.scss';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getSubtotal, getTotal, hasPriceChanges } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const subtotal = getSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = getTotal();

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      toast.error('Please log in to place an order');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <Navbar />
        <div className={styles.emptyContent}>
          <ShoppingBag className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptyDesc}>Add some delicious items from our menu!</p>
          <Link href="/menu" className={styles.browseBtn}>Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Your Cart</h1>

        {hasPriceChanges() && (
          <div className={styles.priceAlert}>
            <AlertTriangle />
            Some item prices have changed since you added them to your cart.
          </div>
        )}

        <div className={styles.itemList}>
          {items.map((item) => {
            const itemTotal = getCartItemPrice(item) * item.quantity;
            return (
              <div key={`${item.menuItemId}-${item.size}`} className={styles.item}>
                {item.menuItem.imageUrl && (
                  <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className={styles.itemImage} />
                )}
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <div>
                      <h3 className={styles.itemName}>{item.menuItem.name}</h3>
                      {item.size && item.size !== 'MEDIUM' && (
                        <span className={styles.itemSize}>{item.size}</span>
                      )}
                      {item.selectedAddOnIds.length > 0 && (
                        <p className={styles.itemAddons}>
                          + {item.selectedAddOnIds
                            .map((id) => item.menuItem.addOns.find((a) => a.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className={styles.itemNote}>&quot;{item.specialInstructions}&quot;</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.menuItemId)} className={styles.removeBtn}>
                      <Trash2 />
                    </button>
                  </div>
                  <div className={styles.itemFooter}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className={styles.qtyBtn}>
                        <Minus />
                      </button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className={styles.qtyBtn}>
                        <Plus />
                      </button>
                    </div>
                    <span className={styles.itemPrice}>${itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className={styles.summaryRow}><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
          </div>
          <div className={styles.summaryTotal}><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button onClick={handleCheckout} className={styles.checkoutBtn}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
