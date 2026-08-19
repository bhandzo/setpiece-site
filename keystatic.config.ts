// keystatic.config.ts
import { collection, config, fields, singleton } from "@keystatic/core";
import { block, wrapper } from "@keystatic/core/content-components";

const postContentComponents = {
	Chart: block({
		label: "Chart",
		description: "Render a chart from the post's colocated charts.json file.",
		schema: {
			name: fields.text({
				label: "Chart name",
				description: "The chart key in charts.json.",
			}),
			headline: fields.text({
				label: "Headline",
				validation: { isRequired: false },
			}),
			subtitle: fields.text({
				label: "Subtitle",
				multiline: true,
				validation: { isRequired: false },
			}),
			title: fields.text({
				label: "Title",
				validation: { isRequired: false },
			}),
			caption: fields.text({
				label: "Caption",
				multiline: true,
				validation: { isRequired: false },
			}),
			height: fields.integer({
				label: "Height",
				description: "Optional chart height in pixels.",
				validation: { isRequired: false, min: 1 },
			}),
		},
	}),
	SectionLabel: wrapper({
		label: "Section label",
		description: "A compact eyebrow label that qualifies the section below it.",
		schema: {},
	}),
};

export default config({
	// Default to GitHub storage. Use `pnpm dev:local` to edit files on disk
	// without a GitHub login. `import.meta.env` is safe in the browser bundle.
	storage:
		import.meta.env.MODE === "keystatic-local"
			? { kind: "local" }
			: {
					kind: "github",
					repo: {
						owner: "bhandzo",
						name: "setpiece-site",
					},
				},
	collections: {
		post: collection({
			label: "Blog Posts",
			slugField: "title",
			path: "src/content/post/*/",
			format: { contentField: "content" },
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				description: fields.text({
					label: "Description",
					multiline: true,
				}),
				coverImage: fields.object(
					{
						alt: fields.text({ label: "Alt Text" }),
						// Keystatic stores the file at {directory}/{entry-slug}/{filename}
						// and writes {publicPath}{entry-slug}/{filename} into frontmatter,
						// which resolves from src/content/post/{slug}/index.mdx for
						// Astro's image() schema helper.
						src: fields.image({
							label: "Cover Image",
							directory: "src/assets/images/posts",
							publicPath: "../../../assets/images/posts/",
						}),
					},
					{
						label: "Cover Image",
					},
				),
				draft: fields.checkbox({
					label: "Draft",
					defaultValue: false,
				}),
				ogImage: fields.text({
					label: "OG Image URL",
					validation: { isRequired: false },
				}),
				tags: fields.array(fields.text({ label: "Tag" }), {
					label: "Tags",
					itemLabel: (props) => props.value || "Tag",
				}),
				publishDate: fields.date({
					label: "Publish Date",
					defaultValue: { kind: "today" },
				}),
				updatedDate: fields.date({
					label: "Updated Date",
					validation: { isRequired: false },
				}),
				pinned: fields.checkbox({
					label: "Pinned",
					defaultValue: false,
				}),
				content: fields.mdx({
					label: "Content",
					extension: "mdx",
					components: postContentComponents,
				}),
			},
		}),
		tag: collection({
			label: "Tags",
			slugField: "title",
			path: "src/content/tag/*",
			format: { contentField: "content" },
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				description: fields.text({
					label: "Description",
					multiline: true,
					validation: { isRequired: false },
				}),
				content: fields.markdoc({
					label: "Content",
					extension: "md",
				}),
			},
		}),
		problemCards: collection({
			label: "Problem Cards",
			slugField: "title",
			path: "src/content/problemCards/*",
			format: { contentField: "description" },
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				order: fields.number({
					label: "Display Order",
					defaultValue: 0,
				}),
				description: fields.markdoc({
					label: "Description",
					extension: "md",
				}),
			},
		}),
		differentiators: collection({
			label: "Differentiators",
			slugField: "title",
			path: "src/content/differentiators/*",
			format: { contentField: "description" },
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				order: fields.number({
					label: "Display Order",
					defaultValue: 0,
				}),
				description: fields.markdoc({
					label: "Description",
					extension: "md",
				}),
			},
		}),
		services: collection({
			label: "Services",
			slugField: "title",
			path: "src/content/services/*",
			format: { contentField: "description" },
			schema: {
				title: fields.slug({ name: { label: "Title" } }),
				order: fields.number({
					label: "Display Order",
					defaultValue: 0,
				}),
				description: fields.markdoc({
					label: "Description",
					extension: "md",
				}),
			},
		}),
		studioProducts: collection({
			label: "Studio Products",
			slugField: "name",
			path: "src/content/studioProducts/*",
			format: { contentField: "description" },
			schema: {
				name: fields.slug({ name: { label: "Name" } }),
				tagline: fields.text({
					label: "Tagline",
					multiline: true,
				}),
				order: fields.number({
					label: "Display Order",
					defaultValue: 0,
				}),
				description: fields.markdoc({
					label: "Description",
					extension: "md",
				}),
			},
		}),
		teamMembers: collection({
			label: "Team Members",
			slugField: "name",
			path: "src/content/teamMembers/*",
			format: { contentField: "bio" },
			schema: {
				name: fields.slug({ name: { label: "Name" } }),
				title: fields.text({
					label: "Job Title",
					defaultValue: "",
				}),
				order: fields.number({
					label: "Display Order",
					defaultValue: 0,
				}),
				specializations: fields.array(
					fields.text({ label: "Specialization" }),
					{
						label: "Specializations",
						itemLabel: (props) => props.value || "Specialization",
					},
				),
				bio: fields.markdoc({
					label: "Bio",
					extension: "md",
				}),
			},
		}),
	},
	singletons: {
		homepage: singleton({
			label: "Homepage",
			path: "src/content/homepage",
			format: { data: "json" },
			schema: {
				// Hero section
				heroTitle: fields.text({
					label: "Hero Title",
					defaultValue: "When you hit a wall, we transform everything.",
				}),
				heroDescription: fields.text({
					label: "Hero Description",
					multiline: true,
					defaultValue:
						"We are AI-native operating partners for SaaS leaders who've hit a wall. Get unstuck and go fast (again).",
				}),
				heroCtaLabel: fields.text({
					label: "Hero CTA Label",
					defaultValue: "Book an intro call",
				}),
				heroCtaUrl: fields.text({
					label: "Hero CTA URL",
					description:
						"The hero button renders only when this is set — leave empty to hide it.",
					defaultValue: "https://app.reclaim.ai/m/setpiece/setpiece-intro",
					validation: { isRequired: false },
				}),

				// What got you here section
				mainProblemTitle: fields.text({
					label: "Main Problem Title",
					defaultValue: "What got you here stopped working",
				}),
				mainProblemDescription: fields.text({
					label: "Main Problem Description",
					multiline: true,
					defaultValue:
						"Whether you're finding product-market fit, scaling past early success, or managing explosive growth - what used to work is now making things worse. Every day feels like trying to stay afloat instead of building the future.",
				}),

				// We're Built Different section
				differentiatorTitle: fields.text({
					label: "Differentiator Title",
					defaultValue: "We're Built Different",
				}),

				// Services section
				servicesTitle: fields.text({
					label: "Services Title",
					defaultValue: "Sprint to get unstuck",
				}),
				servicesSubtitle: fields.text({
					label: "Services Subtitle",
					defaultValue: "How we work with you to get your groove back",
				}),
				servicesDescription: fields.text({
					label: "Services Description",
					multiline: true,
					defaultValue:
						"You own the data. You own the artifacts. You own everything we ship.",
				}),

				// Setpiece Studio section
				studioTitle: fields.text({
					label: "Studio Title",
					defaultValue: "Work with builders, not advisors.",
				}),
				studioDescription: fields.text({
					label: "Studio Description",
					multiline: true,
					defaultValue:
						"Softcopy, Dashbox, and Tighthead aren't showpieces — they run our business and our clients' businesses every day. We stay at the front of the field because building this is our daily work.",
				}),

				// About Us section
				aboutUsTitle: fields.text({
					label: "About Us Title",
					defaultValue: "Operating Partners, Not Consultants",
				}),
				aboutUsDescription: fields.text({
					label: "About Us Description",
					multiline: true,
					defaultValue:
						"We're operators who've navigated the messy middle ourselves. We embed with your team to execute transformation together, ensuring knowledge transfer and sustainable results.",
				}),
			},
		}),
	},
});
