import React from 'react';
import { 
    Utensils, 
    Coffee, 
    Cake, 
    Pizza, 
    Sandwich, 
    IceCream, 
    Soup, 
    Salad, 
    Beef, 
    Fish, 
    Cookie 
} from 'lucide-react';

// Icon options for categories
export const iconOptions = [
    { name: 'Utensils', icon: Utensils, label: 'General' },
    { name: 'Coffee', icon: Coffee, label: 'Beverages' },
    { name: 'Cake', icon: Cake, label: 'Desserts' },
    { name: 'Pizza', icon: Pizza, label: 'Pizza' },
    { name: 'Sandwich', icon: Sandwich, label: 'Sandwiches' },
    { name: 'IceCream', icon: IceCream, label: 'Ice Cream' },
    { name: 'Soup', icon: Soup, label: 'Soups' },
    { name: 'Salad', icon: Salad, label: 'Salads' },
    { name: 'Beef', icon: Beef, label: 'Meat' },
    { name: 'Fish', icon: Fish, label: 'Seafood' },
    { name: 'Cookie', icon: Cookie, label: 'Bakery' },
];

// Get icon component by name or category name
export const getCategoryIcon = (iconNameOrCategoryName?: string | null): React.ComponentType<{ className?: string }> => {
    console.log('getCategoryIcon called with:', iconNameOrCategoryName);
    
    if (!iconNameOrCategoryName) {
        console.log('No icon name provided, returning Utensils');
        return Utensils;
    }
    
    // First try to find by icon name
    const iconOption = iconOptions.find(option => option.name === iconNameOrCategoryName);
    if (iconOption) {
        console.log('Found icon by name:', iconNameOrCategoryName, '->', iconOption.label);
        return iconOption.icon;
    }
    
    // If not found, try to map by category name
    console.log('Icon not found by name, trying category name mapping...');
    const Icon = getIconByCategoryName(iconNameOrCategoryName);
    console.log('Category mapping result:', Icon);
    return Icon;
};

// Get icon component by category name (fallback for backward compatibility)
export const getIconByCategoryName = (categoryName: string): React.ComponentType<{ className?: string }> => {
    console.log('getIconByCategoryName called with:', categoryName);
    
    const categoryIconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
        'Tea': Coffee,
        'Snack': Utensils,
        'Cake': Cake,
        'Pizza': Pizza,
        'Beverages': Coffee,
        'Desserts': Cake,
        'Sandwiches': Sandwich,
        'Soup': Soup,
        'Salad': Salad,
        'Meat': Beef,
        'Seafood': Fish,
        'Bakery': Cookie,
        'Ice Cream': IceCream,
        'Ice cream': IceCream,
        'ice cream': IceCream,
        'IceCream': IceCream,
        'icecream': IceCream,
        'Coffee': Coffee,
        'Sandwich': Sandwich,
    };
    
    const result = categoryIconMap[categoryName] || Utensils;
    console.log('Category mapping for', categoryName, '->', result === Utensils ? 'Utensils (default)' : 'Found mapping');
    return result;
};

// Dynamic category color mapping
export const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
        'Tea': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
        'Snack': 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
        'Cake': 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-300',
        'Pizza': 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-300',
        'Beverages': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
        'Desserts': 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-300',
        'Sandwiches': 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
        'Soup': 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-300',
        'Salad': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
        'Meat': 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300',
        'Seafood': 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300',
        'Bakery': 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300',
        'Ice Cream': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300',
        'Ice cream': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300',
        'ice cream': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300',
        'IceCream': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300',
        'icecream': 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300',
        'Coffee': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
        'Sandwich': 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
    };
    return colorMap[categoryName] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
};

// Dynamic card background color
export const getCardBackground = (categoryName: string) => {
    const bgMap: { [key: string]: string } = {
        'Tea': 'bg-gradient-to-br from-green-50 to-emerald-50',
        'Snack': 'bg-gradient-to-br from-yellow-50 to-orange-50',
        'Cake': 'bg-gradient-to-br from-pink-50 to-rose-50',
        'Pizza': 'bg-gradient-to-br from-red-50 to-orange-50',
        'Beverages': 'bg-gradient-to-br from-green-50 to-emerald-50',
        'Desserts': 'bg-gradient-to-br from-pink-50 to-rose-50',
        'Sandwiches': 'bg-gradient-to-br from-yellow-50 to-orange-50',
        'Soup': 'bg-gradient-to-br from-orange-50 to-red-50',
        'Salad': 'bg-gradient-to-br from-green-50 to-emerald-50',
        'Meat': 'bg-gradient-to-br from-red-50 to-pink-50',
        'Seafood': 'bg-gradient-to-br from-blue-50 to-cyan-50',
        'Bakery': 'bg-gradient-to-br from-yellow-50 to-amber-50',
        'Ice Cream': 'bg-gradient-to-br from-blue-50 to-indigo-50',
        'Ice cream': 'bg-gradient-to-br from-blue-50 to-indigo-50',
        'ice cream': 'bg-gradient-to-br from-blue-50 to-indigo-50',
        'IceCream': 'bg-gradient-to-br from-blue-50 to-indigo-50',
        'icecream': 'bg-gradient-to-br from-blue-50 to-indigo-50',
        'Coffee': 'bg-gradient-to-br from-green-50 to-emerald-50',
        'Sandwich': 'bg-gradient-to-br from-yellow-50 to-orange-50',
    };
    return bgMap[categoryName] || 'bg-gradient-to-br from-gray-50 to-gray-100';
};
