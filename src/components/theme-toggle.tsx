import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button variant="outline2" size="icon" onClick={() => setTheme(next)} aria-label="Toggle theme" className="dark:text-foreground dark:!bg-background"  >
      {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
    </Button>
  );
}