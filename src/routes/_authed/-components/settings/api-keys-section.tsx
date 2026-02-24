"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/client/components/ui/alert-dialog";
import { Button } from "@/client/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/client/components/ui/table";
import {
	apiKeysQueryOptions,
	createApiKey,
	deleteApiKey,
} from "@/server/infrastructure/functions/api-keys";

export function ApiKeysSection() {
	const queryClient = useQueryClient();
	const { data: apiKeys, isLoading } = useQuery(apiKeysQueryOptions);
	const createApiKeyFn = useServerFn(createApiKey);
	const deleteApiKeyFn = useServerFn(deleteApiKey);

	const [newKeyName, setNewKeyName] = useState("");
	const [generatedKey, setGeneratedKey] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
	const keyNameId = useId();

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newKeyName.trim()) return;

		setIsCreating(true);
		try {
			const result = await createApiKeyFn({ data: { name: newKeyName } });
			setGeneratedKey(result.key);
			setNewKeyName("");
			queryClient.invalidateQueries(apiKeysQueryOptions);
			toast.success("API Key created");
		} catch (error) {
			toast.error("Failed to create API key");
			console.error(error);
		} finally {
			setIsCreating(false);
		}
	};

	const confirmDelete = async () => {
		if (!keyToDelete) return;

		const id = keyToDelete;
		setKeyToDelete(null);
		setIsDeleting(id);

		try {
			await deleteApiKeyFn({ data: { id } });
			queryClient.invalidateQueries(apiKeysQueryOptions);
			toast.success("API Key deleted");
		} catch (error) {
			toast.error("Failed to delete API key");
			console.error(error);
		} finally {
			setIsDeleting(null);
		}
	};

	return (
		<section className="settings-section space-y-6">
			<Card className="settings-card">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
							<Key className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<CardTitle className="text-sm font-medium">API Keys</CardTitle>
							<CardDescription className="text-xs">
								Manage API keys for accessing the search API
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<form onSubmit={handleCreate} className="flex gap-2 items-end">
						<div className="space-y-2 flex-1">
							<Label htmlFor={keyNameId} className="text-xs">
								New API Key Name
							</Label>
							<Input
								id={keyNameId}
								value={newKeyName}
								onChange={(e) => setNewKeyName(e.target.value)}
								placeholder="e.g. My App"
								className="h-9"
							/>
						</div>
						<Button
							type="submit"
							size="sm"
							variant="secondary"
							disabled={!newKeyName.trim() || isCreating}
						>
							{isCreating ? (
								"Creating..."
							) : (
								<>
									<Plus className="h-4 w-4 mr-1" /> Create
								</>
							)}
						</Button>
					</form>

					{generatedKey && (
						<div className="p-4 bg-muted/50 rounded-lg border border-border/50 space-y-2">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-medium text-green-600">
									API Key Generated
								</Label>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									onClick={() => setGeneratedKey(null)}
								>
									<span className="sr-only">Close</span>
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								Make sure to copy your API key now. You won't be able to see it
								again!
							</p>
							<div className="flex items-center gap-2">
								<Input
									value={generatedKey}
									readOnly
									className="font-mono text-xs h-9 bg-background"
								/>
								<Button
									size="icon"
									variant="outline"
									className="h-9 w-9 shrink-0"
									onClick={() => {
										navigator.clipboard.writeText(generatedKey);
										toast.success("Copied to clipboard");
									}}
								>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Last Used</TableHead>
									<TableHead className="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center h-24">
											Loading...
										</TableCell>
									</TableRow>
								) : apiKeys?.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center h-24 text-muted-foreground text-sm"
										>
											No API keys found
										</TableCell>
									</TableRow>
								) : (
									apiKeys?.map((key) => (
										<TableRow key={key.id}>
											<TableCell className="font-medium">{key.name}</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{new Date(key.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{key.lastUsedAt
													? new Date(key.lastUsedAt).toLocaleDateString()
													: "Never"}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
													onClick={() => setKeyToDelete(key.id)}
													disabled={isDeleting === key.id}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					<div className="space-y-3 pt-4 border-t">
						<h3 className="text-sm font-medium">API Documentation</h3>
						<div className="text-xs text-muted-foreground space-y-4">
							<p>
								Use your API key to authenticate requests to the search API. The
								key must be passed as a query parameter.
							</p>
							<div className="rounded-md bg-muted p-3 font-mono text-xs overflow-x-auto">
								GET /api/search?q=your_query&key=YOUR_API_KEY
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-foreground">Parameters</h4>
								<ul className="list-disc list-inside space-y-1 ml-1">
									<li>
										<code className="bg-muted px-1 py-0.5 rounded">q</code>{" "}
										(required): Search query
									</li>
									<li>
										<code className="bg-muted px-1 py-0.5 rounded">key</code>{" "}
										(required): Your API key
									</li>
									<li>
										<code className="bg-muted px-1 py-0.5 rounded">
											category
										</code>{" "}
										(optional): web, images, files
									</li>
									<li>
										<code className="bg-muted px-1 py-0.5 rounded">
											timeRange
										</code>{" "}
										(optional): day, month, year, all
									</li>
									<li>
										<code className="bg-muted px-1 py-0.5 rounded">locale</code>{" "}
										(optional): e.g. en-US, fr-FR
									</li>
									<li>
										<code className="bg-muted px-1 py-0.5 rounded">
											safeSearch
										</code>{" "}
										(optional): strict, moderate, off
									</li>
								</ul>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<AlertDialog
				open={!!keyToDelete}
				onOpenChange={(open) => !open && setKeyToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the API
							key and revoke access for any application using it.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
