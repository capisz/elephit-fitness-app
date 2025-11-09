import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function FoodInput({ onAddFood }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [addedFoods, setAddedFoods] = useState([]);
  const [manualFood, setManualFood] = useState({ name: '', protein: '', carbs: '', fat: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Retrieve current username (if profile exists)
  const currentUser = (() => {
    try {
      const profile = JSON.parse(localStorage.getItem('userProfile'));
      return profile?.name || 'default';
    } catch {
      return 'default';
    }
  })();

  // Load foods from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`foods_${currentUser}`) || '[]');
    setAddedFoods(saved);
  }, [currentUser]);

  // Persist foods whenever changed
  useEffect(() => {
    localStorage.setItem(`foods_${currentUser}`, JSON.stringify(addedFoods));
  }, [addedFoods, currentUser]);

  // Search handler
  useEffect(() => {
    const searchFoods = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/food-search?query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (Array.isArray(data.foods)) {
          setSearchResults(data.foods.map((f) => ({
            id: String(f.id || f.food_id || crypto.randomUUID()),
            name: f.name || f.food_name || 'Unknown',
            calories: parseFloat(f.calories) || 0,
            protein: parseFloat(f.protein) || 0,
            carbs: parseFloat(f.carbs) || 0,
            fat: parseFloat(f.fat) || 0,
            brand: f.brand || f.brand_name || '',
          })));
          setShowDropdown(true);
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      } catch (e) {
        console.error('Food search error', e);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    };

    const t = setTimeout(searchFoods, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Add selected food
  function handleSelect(food) {
    const newList = [...addedFoods, food];
    setAddedFoods(newList);
    setShowDropdown(false);
    setQuery('');
    onAddFood?.(food);
  }

  // Manual add
  function handleManualAdd() {
    if (!manualFood.name.trim()) return;
    const p = parseFloat(manualFood.protein) || 0;
    const c = parseFloat(manualFood.carbs) || 0;
    const f = parseFloat(manualFood.fat) || 0;
    const cal = p * 4 + c * 4 + f * 9;

    const newFood = {
      id: crypto.randomUUID(),
      name: manualFood.name,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
    };

    setAddedFoods([...addedFoods, newFood]);
    onAddFood?.(newFood);
    setManualFood({ name: '', protein: '', carbs: '', fat: '' });
  }

  // Remove item
  function handleRemove(id) {
    setAddedFoods((prev) => prev.filter((f) => f.id !== id));
  }

  // Click outside closes dropdown
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <Card className="border-2 border-gray-300 dark:border-gray-800" style={{ backgroundColor: 'hsl(var(--blue-form))' }}>
      <CardHeader>
        <CardTitle className="text-foreground dark:text-white">Add Food</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative" ref={dropdownRef}>
          <Label htmlFor="food-search" className="block mb-2 text-foreground dark:text-white">
            Search for a food
          </Label>
          <Input
            id="food-search"
            placeholder="Type a food name (e.g., banana)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-background text-foreground border border-border"
          />

          {isLoading && <p className="mt-2 text-sm text-gray-500 text-center">Searching...</p>}

          {showDropdown && searchResults.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-80 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
              {searchResults.map((f) => (
                <li
                  key={f.id}
                  onClick={() => handleSelect(f)}
                  className="flex cursor-pointer justify-between items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-sm font-medium text-[#5062a1]">{f.name}</span>
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-right min-w-[110px]">
                    <p>{Math.round(f.calories)} cal</p>
                    <p className="text-[11px] text-gray-400">
                      {f.protein.toFixed(1)}P · {f.carbs.toFixed(1)}C · {f.fat.toFixed(1)}F
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Manual Entry */}
        <div className="mt-6">
          <Label className="block mb-3 text-foreground dark:text-white">Manual Food Entry</Label>
          <Input
            placeholder="Food name"
            value={manualFood.name}
            onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })}
            className="h-11 bg-background text-foreground border border-border"
          />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Protein (g)"
              value={manualFood.protein}
              onChange={(e) => setManualFood({ ...manualFood, protein: e.target.value })}
              inputMode="decimal"
              className="h-11 bg-background text-foreground border border-border"
            />
            <Input
              placeholder="Carbs (g)"
              value={manualFood.carbs}
              onChange={(e) => setManualFood({ ...manualFood, carbs: e.target.value })}
              inputMode="decimal"
              className="h-11 bg-background text-foreground border border-border"
            />
            <Input
              placeholder="Fat (g)"
              value={manualFood.fat}
              onChange={(e) => setManualFood({ ...manualFood, fat: e.target.value })}
              inputMode="decimal"
              className="h-11 bg-background text-foreground border border-border"
            />
          </div>
          <Button
            className="mt-4 h-12 w-full text-base font-semibold rounded-xl shadow-sm"
            style={{ backgroundColor: 'hsl(var(--blue-bar))' }}
            onClick={handleManualAdd}
          >
            Add Food
          </Button>
        </div>

        {/* Added Foods List */}
        {addedFoods.length > 0 && (
          <div className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-3">Added Foods</h3>
            <ul className="space-y-2">
              {addedFoods.map((food) => (
                <li key={food.id} className="flex justify-between items-center bg-white/60 dark:bg-gray-800 rounded-md px-4 py-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">{food.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(food.calories)} cal — {food.protein.toFixed(1)}P / {food.carbs.toFixed(1)}C / {food.fat.toFixed(1)}F
                    </span>
                  </div>
                  <button onClick={() => handleRemove(food.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors">✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
