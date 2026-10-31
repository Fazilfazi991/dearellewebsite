"use client";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { products, productPrice } from "@/lib/products";
import { ProductCard } from "./store";
export function Catalogue({
  category,
}: {
  category: "watches" | "bags" | "new-arrivals";
}) {
  const [sort, setSort] = useState("featured");
  const [color, setColor] = useState("all");
  const [filters, setFilters] = useState(false);
  const base = products.filter(
    (p) => category === "new-arrivals" || p.category === category,
  );
  const rows = base
    .filter((p) => color === "all" || p.colors.some((c) => c.name === color))
    .toSorted((a, b) =>
      sort === "low"
        ? productPrice(a) - productPrice(b)
        : sort === "high"
          ? productPrice(b) - productPrice(a)
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : 0,
    );
  return (
    <>
      <div className="catalogue-toolbar">
        <span>{rows.length} pieces</span>
        <div>
          <button
            className="text-link"
            aria-expanded={filters}
            aria-controls="filters"
            onClick={() => setFilters(!filters)}
          >
            {filters ? <X size={16} /> : <SlidersHorizontal size={16} />}{" "}
            Filters
          </button>
          <label className="sort-label">
            Sort by{" "}
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Our selection</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
      </div>
      {filters && (
        <div id="filters" className="filters">
          <label>
            Colour{" "}
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="all">All colours</option>
              {Array.from(
                new Set(base.flatMap((p) => p.colors.map((c) => c.name))),
              ).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button className="text-link" onClick={() => setColor("all")}>
            Clear filters
          </button>
        </div>
      )}
      <div className="product-grid catalogue-grid">
        {rows.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {!rows.length && (
        <div className="empty">
          <h2>Nothing in this shade just yet.</h2>
          <button className="button" onClick={() => setColor("all")}>
            See all pieces
          </button>
        </div>
      )}
    </>
  );
}
