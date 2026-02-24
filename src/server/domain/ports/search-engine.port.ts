import type {
	BaseSearchResult,
	SearchInput,
	SuggestInput,
	SuggestResult,
} from "../value-objects/search.vo";

export interface SearchEngine {
	search: (args: SearchInput) => Promise<BaseSearchResult>;
	suggest: (args: SuggestInput) => Promise<SuggestResult>;
}
