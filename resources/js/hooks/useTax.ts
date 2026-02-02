import { usePage } from '@inertiajs/react';

interface TaxSetting {
    id: number;
    name: string;
    type: 'free' | 'manual';
    tax_rate: string | null;
    is_active: boolean;
    description: string | null;
    formatted_tax_rate: string;
}

interface TaxData {
    active: TaxSetting | null;
}

export function useTax() {
    const { props } = usePage<{ tax: TaxData }>();
    
    const activeTax = props.tax?.active;
    
    const getTaxRate = (): number => {
        if (!activeTax) return 0.1; // Default 10% fallback
        if (activeTax.type === 'free') return 0;
        return parseFloat(activeTax.tax_rate || '0') / 100;
    };
    
    const getTaxRatePercentage = (): string => {
        if (!activeTax) return '10%';
        if (activeTax.type === 'free') return '0%';
        return `${activeTax.tax_rate}%`;
    };
    
    const getTaxLabel = (): string => {
        if (!activeTax) return 'Tax (10%)';
        if (activeTax.type === 'free') return 'Tax (0%)';
        return `Tax (${activeTax.tax_rate}%)`;
    };
    
    const calculateTax = (amount: number): number => {
        return amount * getTaxRate();
    };
    
    const calculateTotal = (amount: number): number => {
        return amount + calculateTax(amount);
    };
    
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };
    
    const isTaxFree = (): boolean => {
        return activeTax?.type === 'free' || false;
    };
    
    const getTaxName = (): string => {
        return activeTax?.name || 'Default Tax';
    };
    
    return {
        activeTax,
        getTaxRate,
        getTaxRatePercentage,
        getTaxLabel,
        calculateTax,
        calculateTotal,
        formatCurrency,
        isTaxFree,
        getTaxName,
    };
}
