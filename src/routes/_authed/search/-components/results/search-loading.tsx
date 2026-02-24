import { SearchCategory } from "@/server/domain/value-objects";
import { FileResultsSkeleton } from "./file-results";
import { ImageResultsSkeleton } from "./image-results";
import { WebResultsSkeleton } from "./web-results";

interface SearchResultsProps {
	category: SearchCategory;
}

export function SearchLoading({ category }: SearchResultsProps) {
	if (category === SearchCategory.IMAGES) {
		return <ImageResultsSkeleton />;
	}

	if (category === SearchCategory.FILES) {
		return <FileResultsSkeleton />;
	}

	if (category === SearchCategory.WEB) {
		return <WebResultsSkeleton />;
	}

	return null;
}
