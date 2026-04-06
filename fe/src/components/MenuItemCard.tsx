'use client';
import { useState } from 'react';
import { Plus, Clock, Leaf, Wheat } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { MenuItemModal } from './MenuItemModal';
import toast from 'react-hot-toast';
import styles from './MenuItemCard.module.scss';

export function MenuItemCard({ item }: { item: MenuItem }) {
  const [showModal, setShowModal] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    addItem(item, { quantity: 1, selectedAddOnIds: [], specialInstructions: '' });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <>
      <div className={styles.card} onClick={() => setShowModal(true)}>
        <div className={styles.imageWrap}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>🍽</div>
          )}
          {!item.isAvailable && (
            <div className={styles.unavailableOverlay}><span>Unavailable</span></div>
          )}
          {item.stock !== null && item.stock <= 5 && item.stock > 0 && (
            <div className={styles.stockBadge}>Only {item.stock} left!</div>
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h3 className={styles.name}>{item.name}</h3>
            <span className={styles.price}>${item.price.toFixed(2)}</span>
          </div>
          <p className={styles.description}>{item.description}</p>
          <div className={styles.footer}>
            <div className={styles.meta}>
              <span className={styles.time}><Clock /> {item.preparationTime}m</span>
              {item.isVegetarian && <Leaf className={styles.badgeVeg} aria-label="Vegetarian" />}
              {item.isGlutenFree && <Wheat className={styles.badgeGf} aria-label="Gluten Free" />}
            </div>
            <button onClick={handleQuickAdd} disabled={!item.isAvailable} className={styles.addBtn}>
              <Plus /> Add
            </button>
          </div>
        </div>
      </div>
      {showModal && <MenuItemModal item={item} onClose={() => setShowModal(false)} />}
    </>
  );
}
