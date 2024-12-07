import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import type { UploadResponse } from "@/types/mp3";

interface MP3UploadProps {
	onSuccess: (response: UploadResponse) => void;
	onError: (message: string) => void;
}

export const MP3Upload = ({ onSuccess, onError }: MP3UploadProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUpload = async (file: File) => {
		if (!file.name.toLowerCase().endsWith(".mp3")) {
			onError("Please upload an MP3 file");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await fetch('/api/upload', {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Upload failed");

			const data = await response.json();
			onSuccess(data);
		} catch (error) {
			onError("Failed to upload file");
		}
	};

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			const file = e.dataTransfer.files[0];
			if (file) handleUpload(file);
		},
		[onSuccess, onError]
	);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleUpload(file);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	return (
		<>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept=".mp3"
				className="hidden"
			/>
			<div
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
			>
				<Upload className="mx-auto h-12 w-12 text-muted-foreground" />
				<p className="mt-4 text-lg font-medium text-foreground">
					Drop your MP3 file here
				</p>
				<p className="mt-2 text-sm text-muted-foreground">
					or click to select a file from your computer
				</p>
			</div>
		</>
	);
};