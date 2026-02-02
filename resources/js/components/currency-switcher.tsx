import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DollarSign, Coins } from 'lucide-react';

interface Currency {
    code: string;
    symbol: string;
    name: string;
    locale: string;
}

const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'NPR', symbol: 'Rs', name: 'Nepali Rupee', locale: 'en-NP' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
];

export function CurrencySwitcher() {
    const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies[0]);

    const handleCurrencyChange = (currency: Currency) => {
        setCurrentCurrency(currency);
        // Store in localStorage for persistence
        localStorage.setItem('preferred-currency', JSON.stringify(currency));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('currencyChanged', { 
            detail: currency 
        }));
    };

    // Load saved currency from localStorage on mount
    useState(() => {
        const saved = localStorage.getItem('preferred-currency');
        if (saved) {
            try {
                const currency = JSON.parse(saved);
                setCurrentCurrency(currency);
            } catch (e) {
                // Fallback to default
                setCurrentCurrency(currencies[0]);
            }
        }
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <span className="font-medium">{currentCurrency.symbol}</span>
                    <span className="text-muted-foreground text-xs">{currentCurrency.code}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {currencies.map((currency) => (
                    <DropdownMenuItem
                        key={currency.code}
                        onClick={() => handleCurrencyChange(currency)}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 text-sm font-bold">
                                {currency.symbol}
                            </div>
                            <div>
                                <div className="font-medium">{currency.name}</div>
                                <div className="text-xs text-muted-foreground">{currency.code}</div>
                            </div>
                        </div>
                        {currentCurrency.code === currency.code && (
                            <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Hook for components to use current currency
export function useCurrency() {
    const [currency, setCurrency] = useState<Currency>({
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        locale: 'en-US',
    });

    useState(() => {
        // Load from localStorage
        const saved = localStorage.getItem('preferred-currency');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCurrency(parsed);
            } catch (e) {
                // Fallback to default
            }
        }

        // Listen for currency changes
        const handleCurrencyChange = (event: CustomEvent) => {
            setCurrency(event.detail);
        };

        window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
        
        return () => {
            window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
        };
    });

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        switch (currency.code) {
            case 'NPR':
                // For Nepali Rupee, format with Rs symbol
                return `${currency.symbol}${numAmount.toFixed(2)}`;
            case 'JPY':
                // For Japanese Yen, no decimal places
                return `${currency.symbol}${Math.round(numAmount).toLocaleString()}`;
            case 'CNY':
                // For Chinese Yuan, format with ¥ symbol
                return `${currency.symbol}${numAmount.toFixed(2)}`;
            default:
                // For USD, EUR, GBP, AUD - use Intl.NumberFormat
                return new Intl.NumberFormat(currency.locale, {
                    style: 'currency',
                    currency: currency.code,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(numAmount);
        }
    };

    return { currency, formatCurrency };
}
