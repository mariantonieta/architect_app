import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EmailSelectorProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  onEmailAdd?: (email: string) => Promise<boolean> | boolean;
  role?: "customer" | "supplier" | "architect";
  onSearch?: (
    query: string,
    role: "customer" | "supplier" | "architect"
  ) => Promise<string[]>;
  showInput?: boolean; 
  onInputToggle?: () => void;
}

export function EmailSelector({
  value = [],
  onChange,
  placeholder,
  onEmailAdd,
  role = "customer",
  onSearch,
    showInput = false,
  onInputToggle,
}: EmailSelectorProps) {
  const safeValue = Array.isArray(value) ? value : [];

  const [input, setInput] = useState("");
  const [data, setData] = useState<string[]>([]);
  const [showData, setShowData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
 const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const handleAddClick = () => {
    if (onInputToggle) {
      onInputToggle();
    } else {
      setInput("");
      setShowData(true);
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (input.trim().length === 0) {
      setData([]);
      setShowData(false);
      setLoading(false);
      return;
    }
    if (!onSearch) {
      setData([]);
      setShowData(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceTimer.current = setTimeout(() => {
      let active = true;

      onSearch(input, role)
        .then((results) => {
          if (!Array.isArray(results)) {
            setData([]);
            setShowData(false);
            setLoading(false);
            return;
          }

          const filtered = results.filter(
            (email) => !safeValue.includes(email)
          );

          setData(filtered);
          setShowData(true);
          setLoading(false);
          setHighlightedIndex(-1);
        })
        .catch(() => {
          if (!active) return;
          setData([]);
          setShowData(false);
          setLoading(false);
        });

      return () => {
        active = false;
        setLoading(false);
      };
    }, 100);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [input, role, safeValue, onSearch]);
  const addEmail = async (emailToAdd?: string) => {
    const email = (emailToAdd ?? input).trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    console.log("Input:", email);
    console.log("Is valid:", isValidEmail);
    console.log("Already added:", safeValue.includes(email));

    if (email) {
      if (isValidEmail && !safeValue.includes(email)) {
        if (onEmailAdd) {
          const canAdd = await onEmailAdd(email);
          console.log("onEmailAdd allowed:", canAdd);
          if (canAdd === false) {
            setInput("");
            setShowData(false);
            setHighlightedIndex(-1);
            return;
          }
        }
        onChange([...safeValue, email]);
      }
    }

    setInput("");
    setData([]);
    setShowData(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (
          showData &&
          highlightedIndex >= 0 &&
          highlightedIndex < data.length
        ) {
          await addEmail(data[highlightedIndex]);
        } else {
          await addEmail();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!showData) {
          setShowData(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev + 1) % data.length);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!showData) {
          setShowData(true);
          setHighlightedIndex(data.length - 1);
        } else {
          setHighlightedIndex((prev) =>
            prev <= 0 ? data.length - 1 : prev - 1
          );
        }
        break;
      // case "Backspace":
      //   if (input === "" && safeValue.length > 0) {
      //     onChange(safeValue.slice(0, -1));
      //   }
      //   break;
      case ",":
        e.preventDefault();
        await addEmail();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowData(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-wrap gap-1 border rounded p-2 min-h-[3rem]"
    >
      {safeValue.map((email) => (
        <Badge
          key={email}
          className="flex items-center space-x-1 hover:text-red-500 cursor-pointer"
          onClick={() => onChange(safeValue.filter((e) => e !== email))}
        >
          {email}
        </Badge>
      ))}
      
     
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-none shadow-none focus:outline-none w-auto flex-1"
        onFocus={() => {
          if (data.length > 0) setShowData(true);
        }}
        autoComplete="off"
      />
        
      

      {/* {loading && <div className="absolute right-2 top-3">Loading...</div>} */}
      {showData && (
        <ul className="absolute z-10 left-0 top-full mt-1 max-h-40 w-full overflow-auto rounded border bg-white shadow-md">
          {data.length === 0 && !loading && (
            <li className="px-3 py-2 text-center text-gray-500">
              No results found.
            </li>
          )}
          {data.map((email, idx) => (
            <li
              key={email}
              className={`cursor-pointer px-3 py-2 hover:bg-blue-500 hover:text-white ${
                highlightedIndex === idx ? "bg-blue-500 text-white" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                addEmail(email);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              {email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
