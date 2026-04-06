'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './login.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'CUSTOMER' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = isLogin
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.register(form);
      setAuth(result.user, result.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      router.push(result.user.role === 'CUSTOMER' ? '/menu' : '/kitchen');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Link href="/" className={styles.logo}>
            <UtensilsCrossed /> ForkAndFire
          </Link>
          <h2 className={styles.heading}>{isLogin ? 'Welcome back' : 'Create account'}</h2>
        </div>

        {isLogin && (
          <div className={styles.hints}>
            <p>Test accounts:</p>
            <p>Customer: customer@example.com / customer123</p>
            <p>Kitchen: kitchen@example.com / kitchen123</p>
            <p>Admin: admin@example.com / admin123</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={styles.input} placeholder="Your name" />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={styles.input} placeholder="you@example.com" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={styles.input} placeholder="••••••••" />
          </div>
          {!isLogin && (
            <div className={styles.field}>
              <label className={styles.label}>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={styles.select}>
                <option value="CUSTOMER">Customer</option>
                <option value="KITCHEN">Kitchen Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={isLoading} className={styles.submitBtn}>
            {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className={styles.toggleRow}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} className={styles.toggleBtn}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
