export function extractFileExtension(url: string): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const lastDotIndex = pathname.lastIndexOf(".");

		if (lastDotIndex === -1 || lastDotIndex === pathname.length - 1) {
			return "";
		}

		const extension = pathname.slice(lastDotIndex);

		if (extension.length > 10 || !/^\.[a-zA-Z0-9]+$/.test(extension)) {
			return "";
		}

		return extension.toLowerCase();
	} catch {
		return "";
	}
}
