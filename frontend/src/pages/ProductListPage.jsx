import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATALOG_URL } from "../api";
import {
  FOOD_CATEGORIES,
  formatCategoryLabel,
  normalizeCategory,
} from "../data/menuCategories";

function getFallbackImage(productId) {
  return `https://picsum.photos/seed/${encodeURIComponent(productId)}/1200/800`;
}

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    fetch(`${CATALOG_URL}/products`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not load products.");
        }
        setProducts(data);
      })
      .catch(() => {
        setError("Could not load products. Is catalog-service running?");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const availableCategories = useMemo(() => {
    const currentCategories = products
      .map((product) => normalizeCategory(product.category))
      .filter(Boolean);
    const merged = new Set([
      ...FOOD_CATEGORIES.map((category) => category.value),
      ...currentCategories,
    ]);
    return ["all", ...Array.from(merged)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const items = products.filter((product) => {
      const categoryValue = normalizeCategory(product.category);
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.manufacturer,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesCategory =
        activeCategory === "all" || categoryValue === activeCategory;

      return matchesQuery && matchesCategory;
    });

    return [...items].sort((first, second) => {
      if (sortBy === "price-low") {
        return Number(first.price || 0) - Number(second.price || 0);
      }

      if (sortBy === "price-high") {
        return Number(second.price || 0) - Number(first.price || 0);
      }

      return String(first.name || "").localeCompare(String(second.name || ""));
    });
  }, [activeCategory, products, query, sortBy]);

  if (loading) return <div className="spinner">Loading products…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <section className="catalog-hero card">
        <div className="hero-copy">
          <div className="eyebrow">Fresh food ordering</div>
          <h1 className="page-title">
            Order your favorites from one clean menu
          </h1>
          <p>
            Browse dishes, filter by cuisine, and search quickly without the
            dark dashboard feel.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span className="metric-value">{products.length}</span>
            <span className="metric-label">Menu items</span>
          </div>
          <div className="metric-card accent">
            <span className="metric-value">{filteredProducts.length}</span>
            <span className="metric-label">Matching filters</span>
          </div>
        </div>
      </section>

      <div className="catalog-toolbar card">
        <label className="search-field">
          <span>Search dishes</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search burgers, biryani, drinks..."
          />
        </label>

        <label className="sort-field">
          <span>Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="filter-strip">
        {availableCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category === "all" ? "All dishes" : formatCategoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="catalog-meta">
        <span>{filteredProducts.length} items shown</span>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            setQuery("");
            setActiveCategory("all");
            setSortBy("featured");
          }}
        >
          Reset filters
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="product-card-link"
          >
            <article className="product-card">
              <div className="product-card-badge">
                {formatCategoryLabel(product.category)}
              </div>
              <img
                src={product.image_url || getFallbackImage(product.id)}
                alt={product.name}
                onError={(event) => {
                  const fallback = getFallbackImage(product.id);
                  if (event.currentTarget.src !== fallback) {
                    event.currentTarget.src = fallback;
                  }
                }}
              />
              <div className="product-card-body">
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-description">
                  {product.description || "Chef-selected dish crafted fresh."}
                </div>
                <div className="product-card-footer">
                  <span className="price">
                    ${Number(product.price || 0).toFixed(2)}
                  </span>
                  <span className="stock-badge">
                    {product.stock ?? 0} available
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}

        {!filteredProducts.length && (
          <div className="empty-state card">
            <h2>No dishes match your filters</h2>
            <p>Try a different search term or category.</p>
          </div>
        )}
      </div>
    </>
  );
}
