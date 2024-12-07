export interface MP3Tags {
	title?: string;
	artist?: string;
	album?: string;
	year?: string;
	genre?: string;
}

export interface UploadResponse {
	file_id: string;
	tags: MP3Tags;
}

export interface SaveResponse {
	tagged_file_id: string;
}