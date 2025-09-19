import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(next)} aria-label="Toggle theme">
      {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
    </Button>
  );
}