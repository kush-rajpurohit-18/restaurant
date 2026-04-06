'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { MenuItemCard } from '@/components/MenuItemCard';
import { menuApi } from '@/services/api';
import { Category, MenuItem } from '@/types';
import { Search, SlidersHorizontal } from 'lucide-react';
import styles from './menu.module.scss';

const DIETARY_FILTERS = [
  { key: 'isVegetarian', label: 'Vegetarian' },
  { key: 'isVegan',      label: 'Vegan' },
  { key: 'isGlutenFree', label: 'Gluten Free' },
] as const;

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState({ isVegetarian: false, isVegan: false, isGlutenFree: false });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories,
  });

  const { data: items = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu-items', search, selectedCategory, filters, priceRange],
    queryFn: () =>
      menuApi.getItems({
        ...(search && { search }),
        ...(selectedCategory && { categorySlug: selectedCategory }),
        ...(filters.isVegetarian && { isVegetarian: 'true' }),
        ...(filters.isVegan && { isVegan: 'true' }),
        ...(filters.isGlutenFree && { isGlutenFree: 'true' }),
        minPrice: String(priceRange[0]),
        maxPrice: String(priceRange[1]),
      }),
    staleTime: 30000,
  });

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    items.forEach((item) => {
      const key = item.category.name;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <Search />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
          >
            <SlidersHorizontal /> Filters
          </button>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterSection}>
              <h3>Dietary</h3>
              <div className={styles.checkboxGroup}>
                {DIETARY_FILTERS.map((f) => (
                  <label key={f.key} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters[f.key]}
                      onChange={() => setFilters((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.filterSection}>
              <h3>Price Range: ${priceRange[0]} – ${priceRange[1]}</h3>
              <div className={styles.rangeGroup}>
                <input type="range" min={0} max={100} value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} />
                <input type="range" min={0} max={100} value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} />
              </div>
            </div>
          </div>
        )}

        <div className={styles.categoryBar}>
          <button
            onClick={() => setSelectedCategory('')}
            className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ''}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
              className={`${styles.categoryBtn} ${selectedCategory === cat.slug ? styles.active : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={`${styles.skeleton} ${styles.skeletonImg}`} />
                <div className={styles.skeletonBody}>
                  <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonShort}`} />
                  <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedItems).length === 0 ? (
          <p className={styles.empty}>No items found. Try adjusting your filters.</p>
        ) : (
          <div className={styles.sections}>
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <section key={category} className={styles.section}>
                <h2>{category}</h2>
                <div className={styles.grid}>
                  {categoryItems.map((item) => <MenuItemCard key={item.id} item={item} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
