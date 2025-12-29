import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PortalSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export const PortalSearch = ({ 
  placeholder = "Search...", 
  onSearch,
  className 
}: PortalSearchProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <div className={cn("relative", className)}>
      <Search className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
        isFocused ? "text-primary" : "text-muted-foreground"
      )} />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50"
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
