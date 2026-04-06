'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, ChefHat, User, LogOut, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { UserRole } from '@/types';
import styles from './Navbar.module.scss';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());

  if (pathname.startsWith('/kitchen')) return null;

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <UtensilsCrossed />
          <span>ForkAndFire</span>
        </Link>

        <div className={styles.links}>
          <Link href="/menu" className={`${styles.link} ${pathname === '/menu' ? styles.active : ''}`}>
            Menu
          </Link>

          {isAuthenticated() && (
            <Link href="/orders" className={`${styles.link} ${pathname === '/orders' ? styles.active : ''}`}>
              My Orders
            </Link>
          )}

          {(user?.role === UserRole.KITCHEN || user?.role === UserRole.ADMIN) && (
            <Link href="/kitchen" className={styles.kitchenLink}>
              <ChefHat /> Kitchen
            </Link>
          )}

          <Link href="/cart" className={styles.cartBtn}>
            <ShoppingCart />
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </Link>

          {isAuthenticated() ? (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <button onClick={() => { logout(); router.push('/'); }} className={styles.logoutBtn}>
                <LogOut />
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              <User /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
