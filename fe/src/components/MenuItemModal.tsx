'use client';
import { useState } from 'react';
import { X, Plus, Minus, Clock, Leaf, Wheat } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { getItemPrice, SIZE_MULTIPLIERS } from '@/utils/pricing';
import toast from 'react-hot-toast';
import styles from './MenuItemModal.module.scss';

export function MenuItemModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [size, setSize] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>('MEDIUM');
  const [instructions, setInstructions] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  const previewPrice = getItemPrice({
    price: item.price,
    addOns: item.addOns,
    size,
    selectedAddOnIds: selectedAddOns,
  });
  const total = previewPrice * quantity;

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleAdd = () => {
    addItem(item, { quantity, selectedAddOnIds: selectedAddOns, specialInstructions: instructions, size });
    toast.success(`${item.name} added to cart!`);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageWrap}>
          {item.imageUrl && <img src={item.imageUrl} alt={item.name} className={styles.image} />}
          <button onClick={onClose} className={styles.closeBtn}><X /></button>
        </div>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{item.name}</h2>
            <span className={styles.price}>${item.price.toFixed(2)}</span>
          </div>
          <p className={styles.description}>{item.description}</p>

          <div className={styles.meta}>
            <span><Clock /> {item.preparationTime} min</span>
            {item.isVegetarian && <span className={styles.veg}><Leaf /> Vegetarian</span>}
            {item.isVegan && <span className={styles.vegan}>Vegan</span>}
            {item.isGlutenFree && <span className={styles.gf}><Wheat /> Gluten Free</span>}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Size</h3>
            <div className={styles.sizeGroup}>
              {(['SMALL', 'MEDIUM', 'LARGE'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`${styles.sizeBtn} ${size === s ? styles.active : ''}`}
                >
                  {s === 'SMALL'
                    ? `S (${Math.round((SIZE_MULTIPLIERS.SMALL - 1) * 100)}%)`
                    : s === 'MEDIUM'
                    ? 'M'
                    : `L (+${Math.round((SIZE_MULTIPLIERS.LARGE - 1) * 100)}%)`}
                </button>
              ))}
            </div>
          </div>

          {item.addOns.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Add-ons</h3>
              {item.addOns.map((addOn) => (
                <div key={addOn.id} className={styles.addonRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedAddOns.includes(addOn.id)}
                      onChange={() => toggleAddOn(addOn.id)}
                    />
                    {addOn.name}
                  </label>
                  <span className={styles.addonPrice}>+${addOn.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Special Instructions</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any special requests? (e.g., no onions, extra sauce)"
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.actions}>
            <div className={styles.qtyControl}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={styles.qtyBtn}><Minus /></button>
              <span className={styles.qtyNum}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className={styles.qtyBtn}><Plus /></button>
            </div>
            <button onClick={handleAdd} disabled={!item.isAvailable} className={styles.addBtn}>
              Add to Cart — ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
