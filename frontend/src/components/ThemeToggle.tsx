import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			className="fixed top-4 right-4"
		>
			{theme === "dark" ? (
				<Sun className="h-5 w-5" />
			) : (
				<Moon className="h-5 w-5" />
			)}
		</Button>
	);
};