import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

import { useCartStore } from '../stores/cartStore';

const mockMenuItem = {
  id: 'item1',
  name: 'Burger',
  description: 'Tasty burger',
  price: 10,
  imageUrl: '',
  category: { id: 'cat1', name: 'Mains', slug: 'mains', sortOrder: 1 },
  categoryId: 'cat1',
  preparationTime: 15,
  isAvailable: true,
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  stock: null,
  addOns: [{ id: 'addon1', name: 'Cheese', price: 1.5 }],
  createdAt: '',
  updatedAt: '',
};

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], priceSnapshots: [] });
  });

  it('adds item to cart', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem, { quantity: 2, selectedAddOnIds: [], specialInstructions: '' });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('merges duplicate items', () => {
    const store = useCartStore.getState();
    store.addItem(mockMenuItem, { quantity: 1, selectedAddOnIds: [], specialInstructions: '' });
    store.addItem(mockMenuItem, { quantity: 2, selectedAddOnIds: [], specialInstructions: '' });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('removes item from cart', () => {
    const store = useCartStore.getState();
    store.addItem(mockMenuItem, { quantity: 1, selectedAddOnIds: [], specialInstructions: '' });
    store.removeItem('item1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates subtotal correctly with add-ons', () => {
    const store = useCartStore.getState();
    store.addItem(mockMenuItem, { quantity: 2, selectedAddOnIds: ['addon1'], specialInstructions: '' });
    const subtotal = useCartStore.getState().getSubtotal();
    expect(subtotal).toBe((10 + 1.5) * 2);
  });

  it('calculates total with 10% tax', () => {
    const store = useCartStore.getState();
    store.addItem(mockMenuItem, { quantity: 1, selectedAddOnIds: [], specialInstructions: '' });
    const total = useCartStore.getState().getTotal();
    expect(total).toBeCloseTo(11, 2);
  });

  it('clears cart', () => {
    const store = useCartStore.getState();
    store.addItem(mockMenuItem, { quantity: 1, selectedAddOnIds: [], specialInstructions: '' });
    store.clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('applies LARGE size multiplier', () => {
    const store = useCartStore.getState();
    store.addItem(mockMenuItem, { quantity: 1, selectedAddOnIds: [], specialInstructions: '', size: 'LARGE' });
    const subtotal = useCartStore.getState().getSubtotal();
    expect(subtotal).toBeCloseTo(13, 1);
  });
});
