import { CartItem, AddOn } from '@/types';

export const SIZE_MULTIPLIERS: Record<string, number> = {
  SMALL: 0.8,
  MEDIUM: 1.0,
  LARGE: 1.3,
};

export function getItemPrice(item: {
  price: number;
  addOns: AddOn[];
  size?: string;
  selectedAddOnIds: string[];
}): number {
  const multiplier = SIZE_MULTIPLIERS[item.size ?? 'MEDIUM'] ?? 1.0;
  const addOnTotal = item.selectedAddOnIds.reduce((sum, id) => {
    const addOn = item.addOns.find((a) => a.id === id);
    return sum + (addOn?.price ?? 0);
  }, 0);
  return item.price * multiplier + addOnTotal;
}

export function getCartItemPrice(item: CartItem): number {
  return getItemPrice({
    price: item.menuItem.price,
    addOns: item.menuItem.addOns,
    size: item.size,
    selectedAddOnIds: item.selectedAddOnIds,
  });
}

export const TAX_RATE = 0.1;
