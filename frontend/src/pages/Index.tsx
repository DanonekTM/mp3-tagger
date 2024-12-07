import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MP3Upload } from "@/components/MP3Upload";
import { TagForm } from "@/components/TagForm";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { MP3Tags, UploadResponse } from "@/types/mp3";

const Index = () => {
	const [fileId, setFileId] = useState<string | null>(null);
	const [tags, setTags] = useState<MP3Tags>({});
	const { toast } = useToast();

	useEffect(() => {
		return () => {
			if (fileId) {
				fetch(`/api/cleanup/${fileId}`, { method: "DELETE" }).catch(console.error);
			}
		};
	}, [fileId]);

	const handleUploadSuccess = useCallback((response: UploadResponse) => {
		setFileId(response.file_id);
		setTags(response.tags);
	}, []);

	const handleError = useCallback((message: string) => {
		toast({
			title: "Error",
			description: message,
			variant: "destructive",
		});
	}, [toast]);

	return (
		<div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
			<ThemeToggle />
			<div className="max-w-3xl mx-auto">
				<h1 className="text-4xl font-bold text-foreground text-center mb-8">
					Tagger - MP3 Tag Editor
				</h1>

				<Card className="p-6 shadow-lg bg-card text-card-foreground">
					{!fileId ? (
						<MP3Upload onSuccess={handleUploadSuccess} onError={handleError} />
					) : (
						<TagForm
							fileId={fileId}
							initialTags={tags}
							onError={handleError}
							onReset={() => setFileId(null)}
						/>
					)}
				</Card>
			</div>
		</div>
	);
};

export default Index;