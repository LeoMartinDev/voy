"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
	content: string;
	openInNewTab?: boolean;
}

export function Markdown({ content, openInNewTab = true }: MarkdownProps) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				a: ({ href, children }) => {
					const childText = String(children);
					const isCitation =
						/^\[\d+\]$/.test(childText) || /^\d+$/.test(childText);

					if (isCitation) {
						return (
							<a
								href={href}
								target={openInNewTab ? "_blank" : undefined}
								rel="noopener noreferrer"
								className="
									inline-flex items-center justify-center
									min-w-[18px] h-[18px] px-1 mx-0.5
									text-[10px] font-bold
									rounded-md
									bg-primary/10 text-primary
									hover:bg-primary/20 hover:scale-110
									transition-all duration-200
									no-underline align-text-top
									cursor-pointer
								"
							>
								{childText.replace(/[[\]]/g, "")}
							</a>
						);
					}

					return (
						<a
							href={href}
							target={openInNewTab ? "_blank" : undefined}
							rel="noopener noreferrer"
							className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
						>
							{children}
						</a>
					);
				},
				p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
				ul: ({ children }) => (
					<ul className="list-disc list-outside ml-4 space-y-1 mb-3 marker:text-primary/50">
						{children}
					</ul>
				),
				ol: ({ children }) => (
					<ol className="list-decimal list-outside ml-4 space-y-1 mb-3 marker:text-primary/50">
						{children}
					</ol>
				),
				strong: ({ children }) => (
					<strong className="font-semibold text-foreground">{children}</strong>
				),
			}}
		>
			{content}
		</ReactMarkdown>
	);
}
