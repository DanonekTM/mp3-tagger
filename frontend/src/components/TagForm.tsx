import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Download, RotateCcw, Save } from "lucide-react";
import type { MP3Tags } from "@/types/mp3";

interface TagFormProps {
	fileId: string;
	initialTags: MP3Tags;
	onError: (message: string) => void;
	onReset: () => void;
}

export const TagForm = ({ fileId, initialTags, onError, onReset }: TagFormProps) => {
	const [tags, setTags] = useState<MP3Tags>(initialTags);
	const [cover, setCover] = useState<File | null>(null);
	const [taggedFileId, setTaggedFileId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData();
		Object.entries(tags).forEach(([key, value]) => {
			if (value) formData.append(key, value);
		});
		if (cover) formData.append("cover", cover);

		try {
			const response = await fetch(`/api/save-tags/${fileId}`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Failed to save tags");

			const data = await response.json();
			setTaggedFileId(data.tagged_file_id);
			toast({
				title: "Success",
				description: "Tags saved successfully",
			});
		} catch (error) {
			onError("Failed to save tags");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = async () => {
		if (!taggedFileId) return;

		try {
			const response = await fetch(`/api/download/${taggedFileId}`);
			if (!response.ok) throw new Error("Download failed");

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = tags.title ? `${tags.title}.mp3` : "tagged.mp3";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			onError("Failed to download file");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={tags.title || ""}
						onChange={(e) => setTags({ ...tags, title: e.target.value })}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="artist">Artist</Label>
					<Input
						id="artist"
						value={tags.artist || ""}
						onChange={(e) => setTags({ ...tags, artist: e.target.value })}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="album">Album</Label>
					<Input
						id="album"
						value={tags.album || ""}
						onChange={(e) => setTags({ ...tags, album: e.target.value })}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="year">Year</Label>
					<Input
						id="year"
						value={tags.year || ""}
						onChange={(e) => setTags({ ...tags, year: e.target.value })}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="genre">Genre</Label>
					<Input
						id="genre"
						value={tags.genre || ""}
						onChange={(e) => setTags({ ...tags, genre: e.target.value })}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cover">Cover Art</Label>
					<Input
						id="cover"
						type="file"
						accept="image/*"
						onChange={(e) => setCover(e.target.files?.[0] || null)}
					/>
				</div>
			</div>

			<div className="flex justify-between items-center">
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					className="flex items-center gap-2"
				>
					<RotateCcw className="h-4 w-4" />
					Start Over
				</Button>

				<div className="flex items-center space-x-4">
					<Button
						type="submit"
						disabled={isLoading}
						className="flex items-center gap-2"
					>
						<Save className="h-4 w-4" />
						Save Tags
					</Button>

					{taggedFileId && (
						<Button
							type="button"
							onClick={handleDownload}
							className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
						>
							<Download className="h-4 w-4" />
							Download
						</Button>
					)}
				</div>
			</div>
		</form>
	);
};