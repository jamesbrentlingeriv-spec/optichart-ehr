import React, { useState, useRef } from "react";
import { Search, Check, Tag } from "lucide-react";
import { MASTER_PRICE_LIST } from "./constants";
import type { LensItem } from "./types";

interface CatalogProps {
  currentPlan: string;
  isAllowancePlan: boolean;
  onSelectItem: (name: string, price: number, cat: string) => void;
  selectedItemName?: string;
}

const MEDICAID_LENSES: string[] = [
  "Single Vision Plastic",
  "Flat Top 28 Bifocal Plastic",
  "Younger Image Plastic",
  "Single Vision POLY",
  "Flat Top 28 Bifocal POLY",
  "Younger Image POLY",
];

export function Catalog({
  currentPlan,
  onSelectItem,
  selectedItemName,
}: CatalogProps) {
  const [activeCat, setActiveCat] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Drag to scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const categories = ["All", ...Object.keys(MASTER_PRICE_LIST)];

  const isMedicalPlan =
    currentPlan === "MEDICAID" || currentPlan === "SCHOOL LETTER";
  const getPriceDisplay = (item: LensItem) => {
    if (isMedicalPlan) return "$0.00";
    return "$" + item.price.toFixed(2);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const filteredItems = Object.entries(MASTER_PRICE_LIST).flatMap(
    ([cat, items]) => {
      if (activeCat !== "All" && activeCat !== cat) return [];

      return items
        .filter((item) => {
          const matchesSearch = item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

          if (isMedicalPlan) {
            const isMedicaidApproved = MEDICAID_LENSES.some((m) =>
              item.name.toLowerCase().includes(m.toLowerCase()),
            );
            return matchesSearch && isMedicaidApproved;
          }

          return matchesSearch;
        })
        .map((item) => ({ ...item, category: cat as string }));
    },
  );

  return (
    <div className="flex flex-col bg-theme-card overflow-hidden">
      <div className="p-4 border-b border-theme-border flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text" />
          <input
            type="text"
            placeholder="Search lenses, coatings, misc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-bg border border-theme-border rounded-lg text-sm focus:ring-1 focus:ring-theme-accent outline-none text-theme-text font-bold uppercase"
          />
        </div>

        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x select-none cursor-grab active:cursor-grabbing"
          style={{
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex gap-3 min-w-max px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border snap-center active:scale-90 ${
                  activeCat === cat
                    ? "bg-theme-text border-theme-border text-theme-card shadow-xl"
                    : "bg-theme-card border-theme-border text-theme-text hover:bg-theme-bg"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-theme-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
          {filteredItems.map((item, idx) => {
            const isSelected =
              selectedItemName === item.name ||
              selectedItemName === `LENS: ${item.name}`;
            return (
              <button
                key={`${item.name}-${idx}`}
                onClick={() =>
                  onSelectItem(item.name, item.price, item.category)
                }
                className={`group p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "bg-green-500/20 border-green-500 shadow-lg ring-2 ring-green-500/20"
                    : "bg-theme-card border-theme-border hover:bg-green-500/10 hover:border-green-500/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`p-1 px-2 rounded border text-[9px] font-black uppercase transition-colors ${
                      isSelected
                        ? "bg-green-500 text-white border-green-600"
                        : "bg-theme-bg border-theme-border text-theme-text"
                    }`}
                  >
                    {item.category}
                  </span>
                  {isSelected && (
                    <Check className="w-3 h-3 transition-opacity text-green-600 opacity-100" />
                  )}
                </div>
                <h4
                  className={`text-xs font-black leading-tight mb-2 line-clamp-2 uppercase italic transition-colors ${isSelected ? "text-green-700" : "text-theme-text"}`}
                >
                  {item.name}
                </h4>
                <div className="flex items-baseline gap-1">
                  <Tag
                    className={`w-3 h-3 transition-colors ${isSelected ? "text-green-600" : "text-theme-text"}`}
                  />
                  <span
                    className={`text-[11px] font-black transition-colors ${isSelected ? "text-green-600" : "text-theme-text"}`}
                  >
                    {getPriceDisplay(item)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <Search className="w-12 h-12 mb-2" />
            <p className="text-sm font-bold uppercase tracking-widest">
              No results found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
