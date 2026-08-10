import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    const currentIndex = options.findIndex((option) => option.value === theme);
    const next = options[(currentIndex + 1) % options.length];
    const CurrentIcon = options[currentIndex]?.icon || Laptop;
    return (
      <button
        type="button"
        className="focus-ring icon-button"
        onClick={() => setTheme(next.value)}
        aria-label={`Theme: ${theme}. Switch to ${next.label}`}
        title={`Theme: ${theme}`}
      >
        <CurrentIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="theme-segment" role="group" aria-label="Color theme">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={theme === value ? "is-active" : ""}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
