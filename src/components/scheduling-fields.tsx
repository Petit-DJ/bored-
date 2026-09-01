import React, { useState, useEffect, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { parse, isValid, format } from "date-fns";

// --- UTILS ---

export function formatTimezoneOption(tz: string) {
  try {
    const date = new Date();
    const dtf = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "long" });
    const longName = dtf.formatToParts(date).find((p) => p.type === "timeZoneName")?.value || "";

    const dtfOffset = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" });
    let offset = dtfOffset.formatToParts(date).find((p) => p.type === "timeZoneName")?.value || "GMT";
    offset = offset.replace("GMT", "UTC");

    return `${tz} — ${longName} (${offset})`;
  } catch (e) {
    return tz;
  }
}

function getTodayInTimezone(tz: string): Date {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(new Date());
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (y && m && d) {
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
  } catch (e) {
    // fallback
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// --- TIMEZONE SELECTOR ---

export function TimezoneSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (tz: string) => void;
}) {
  const [open, setOpen] = useState(false);
  
  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return ["UTC"];
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="w-full border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors focus:border-ink text-left truncate"
        >
          {value ? formatTimezoneOption(value) : "Select timezone..."}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0 rounded-none border-ink shadow-none">
        <Command>
          <CommandInput placeholder="Search timezones..." className="rounded-none border-0 outline-none" />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {timezones.map((tz) => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={(currentValue) => {
                    onChange(tz);
                    setOpen(false);
                  }}
                  className="rounded-none cursor-pointer"
                >
                  {formatTimezoneOption(tz)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- DATE PICKER ---

export function DatePicker({
  value, // YYYY-MM-DD
  onChange,
  timezone,
}: {
  value: string;
  onChange: (val: string) => void;
  timezone: string;
}) {
  // 02 : 09 : 2026
  const [displayValue, setDisplayValue] = useState("");
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  // Sync internal value to display value if it changes externally
  useEffect(() => {
    if (value) {
      const parsed = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(parsed)) {
        setDisplayValue(format(parsed, "dd : MM : yyyy"));
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)} : ${raw.slice(2, 4)} : ${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)} : ${raw.slice(2)}`;
    }

    setDisplayValue(formatted);

    if (raw.length === 8) {
      const parsed = parse(raw, "ddMMyyyy", new Date());
      if (isValid(parsed)) {
        const yyyymmdd = format(parsed, "yyyy-MM-dd");
        // Check timezone minimum
        const todayTz = getTodayInTimezone(timezone);
        if (parsed >= todayTz) {
          onChange(yyyymmdd);
        }
      }
    }
  };

  const handleInputBlur = () => {
    // If incomplete or invalid, reset to known value
    if (value) {
      const parsed = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(parsed)) {
        setDisplayValue(format(parsed, "dd : MM : yyyy"));
      }
    } else {
      setDisplayValue("");
    }
  };

  const todayTz = getTodayInTimezone(timezone);
  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  return (
    <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <input
          type="text"
          placeholder="DD : MM : YYYY"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={() => setCalendarOpen(true)}
          className="w-full border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-ink"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-none border-ink shadow-none" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setCalendarOpen(false);
            }
          }}
          disabled={(d) => {
            // Disable dates strictly before "today" in target timezone
            return d < todayTz;
          }}
          initialFocus
          className="rounded-none bg-card"
        />
      </PopoverContent>
    </Popover>
  );
}

// --- TIME PICKER ---

export function TimePicker({
  value, // HH:mm (24h format)
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [displayMode, setDisplayMode] = useState<"12H" | "24H">("12H");
  const [displayValue, setDisplayValue] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("PM");

  // Sync value to display
  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      const hStr = parts[0];
      const m = parts[1] || "00";
      let h = parseInt(hStr, 10);

      if (displayMode === "24H") {
        setDisplayValue(`${hStr} : ${m}`);
      } else {
        const isPM = h >= 12;
        setPeriod(isPM ? "PM" : "AM");
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        setDisplayValue(`${h12.toString().padStart(2, "0")} : ${m}`);
      }
    } else {
      setDisplayValue("");
    }
  }, [value, displayMode]);

  const commitTime = (raw: string, p: "AM" | "PM") => {
    if (raw.length === 4) {
      let h = parseInt(raw.slice(0, 2), 10);
      const m = parseInt(raw.slice(2, 4), 10);

      if (isNaN(h) || isNaN(m) || m > 59) return;

      if (displayMode === "12H") {
        if (h < 1 || h > 12) return;
        if (p === "PM" && h !== 12) h += 12;
        if (p === "AM" && h === 12) h = 0;
      } else {
        if (h > 23) return;
      }

      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      onChange(`${hh}:${mm}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length > 4) raw = raw.slice(0, 4);

    let formatted = raw;
    if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)} : ${raw.slice(2)}`;
    }

    setDisplayValue(formatted);
    commitTime(raw, period);
  };

  const handleInputBlur = () => {
    // Re-sync on blur to clean up incomplete inputs
    if (value) {
      const parts = value.split(":");
      const hStr = parts[0];
      const m = parts[1] || "00";
      let h = parseInt(hStr, 10);
      if (displayMode === "24H") {
        setDisplayValue(`${hStr} : ${m}`);
      } else {
        const isPM = h >= 12;
        setPeriod(isPM ? "PM" : "AM");
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        setDisplayValue(`${h12.toString().padStart(2, "0")} : ${m}`);
      }
    } else {
      setDisplayValue("");
    }
  };

  const togglePeriod = () => {
    const next = period === "AM" ? "PM" : "AM";
    setPeriod(next);
    const raw = displayValue.replace(/[^0-9]/g, "");
    commitTime(raw, next);
  };

  return (
    <div className="flex w-full items-center gap-4">
      <input
        type="text"
        placeholder="HH : MM"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="flex-1 border-b border-silver-deep bg-transparent py-2 font-display text-xl text-ink outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-ink"
      />
      {displayMode === "12H" && (
        <button
          type="button"
          onClick={togglePeriod}
          className="border-b border-silver-deep py-2 font-display text-xl text-ink outline-none transition-colors focus:border-ink"
        >
          {period}
        </button>
      )}
      <div className="flex items-center gap-1 border border-silver-deep p-1 ml-auto shrink-0">
        <button
          type="button"
          onClick={() => setDisplayMode("12H")}
          className={cn(
            "px-2 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer",
            displayMode === "12H" ? "bg-ink text-card" : "text-muted-foreground hover:text-ink"
          )}
        >
          12H
        </button>
        <button
          type="button"
          onClick={() => setDisplayMode("24H")}
          className={cn(
            "px-2 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer",
            displayMode === "24H" ? "bg-ink text-card" : "text-muted-foreground hover:text-ink"
          )}
        >
          24H
        </button>
      </div>
    </div>
  );
}
