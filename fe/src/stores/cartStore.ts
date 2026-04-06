import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '@/types';
import { getCartItemPrice, TAX_RATE } from '@/utils/pricing';

interface PriceSnapshot {
  menuItemId: string;
  priceAtAddTime: number;
}

interface CartStore {
  items: CartItem[];
  priceSnapshots: PriceSnapshot[];
  addItem: (menuItem: MenuItem, options: { quantity: number; selectedAddOnIds: string[]; specialInstructions: string; size?: 'SMALL' | 'MEDIUM' | 'LARGE' }) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  itemCount: () => number;
  hasPriceChanges: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      priceSnapshots: [],
      addItem: (menuItem, options) => {
        set((state) => {
          const sortedNewIds = [...options.selectedAddOnIds].sort();
          const existing = state.items.find(
            (i) =>
              i.menuItemId === menuItem.id &&
              i.size === options.size &&
              JSON.stringify([...i.selectedAddOnIds].sort()) === JSON.stringify(sortedNewIds),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + options.quantity } : i,
              ),
            };
          }
          return {
            items: [...state.items, { menuItemId: menuItem.id, menuItem, ...options }],
            priceSnapshots: [
              ...state.priceSnapshots,
              { menuItemId: menuItem.id, priceAtAddTime: menuItem.price },
            ],
          };
        });
      },
      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.menuItemId !== menuItemId)
              : state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [], priceSnapshots: [] }),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0),
      getTotal: () => {
        const subtotal = get().getSubtotal();
        return subtotal * (1 + TAX_RATE);
      },
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      hasPriceChanges: () => {
        const itemMap = new Map(get().items.map((i) => [i.menuItemId, i]));
        return get().priceSnapshots.some((snap) => {
          const cartItem = itemMap.get(snap.menuItemId);
          return cartItem && cartItem.menuItem.price !== snap.priceAtAddTime;
        });
      },
    }),
    { name: 'cart-storage' },
  ),
);
