// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightDocSearch from '@astrojs/starlight-docsearch';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			expressiveCode: {
				themes: ['github-dark', 'github-light'],
				useStarlightUiThemeColors: true,
				styleOverrides: {
					borderRadius: '0.5rem',
				},
			},
			title: 'duckflux docs',
			logo: {
				src: './src/assets/duckflow.png',
				alt: 'DuckFlux',
				replacesTitle: false,
			},
			head: [
				{
					tag: 'script',
					content: `document.addEventListener('DOMContentLoaded', () => {
						const link = document.querySelector('.site-title');
						if (link) link.href = 'https://duckflux.openvibes.tech';
					});`,
				},
			],
			plugins: [
				starlightDocSearch({
					appId: '37ZUDU2YKV',
					apiKey: '6a1e5ac04d0fbbc986ad98fcfb85cc14',
					indexName: 'Duckflux Docs',
				}),
			],
			customCss: ['./src/styles/custom.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Getting started',
					items: [
						{ label: 'Your first workflow', slug: 'getting-started/your-first-workflow' },
						{ label: 'Exploring participants', slug: 'getting-started/exploring-participants' },
						{ label: 'A real-world example', slug: 'getting-started/a-real-world-example' },
					],
				},
				{
					label: 'Workflows',
					items: [
						{ label: 'Workflow files', slug: 'workflows' },
						{ label: 'Participants', slug: 'workflows/participants' },
						{ label: 'Participant types', slug: 'workflows/participant-types' },
						{ label: 'Inputs & outputs', slug: 'workflows/inputs-outputs' },
						{ label: 'Variables & expressions', slug: 'workflows/variables-and-expressions' },
						{ label: 'Loops', slug: 'workflows/loops' },
						{ label: 'Conditionals', slug: 'workflows/conditionals' },
						{ label: 'Parallel execution', slug: 'workflows/parallel' },
						{ label: 'Context assignment (set)', slug: 'workflows/set' },
						{ label: 'Events', slug: 'workflows/events' },
						{ label: 'Error handling', slug: 'workflows/error-handling' },
						{ label: 'Nested workflows', slug: 'workflows/nested-workflows' },
					],
				},
				{
					label: 'Runtime & library',
					collapsed: true,
					items: [
						{ label: "Runtime overview", slug: 'runtime/overview' },
						{ label: 'CLI usage', slug: 'runtime/cli' },
						{ label: 'Execution tracing', slug: 'runtime/tracing' },
						{ label: 'Event hub providers', slug: 'runtime/event-hub-providers' },
						{ label: 'Library usage', slug: 'runtime/library' }
					],
				},
				{
					label: 'Tooling',
					collapsed: true,
					autogenerate: { directory: 'tooling' },
				},
				{
					label: 'Migrating',
					collapsed: true,
					items: [
						{ label: 'From Ralph Loops', slug: 'migrating/from-ralph' },
						{ label: 'From Ralph Orchestrator', slug: 'migrating/from-ralph-orchestrator' },
						{ label: 'From Claude Sub-agents', slug: 'migrating/from-claude-subagents' },
						{ label: 'From GitHub Actions', slug: 'migrating/from-github-actions' },
					],
				},
				{
					label: 'About',
					collapsed: true,
					items: [
						{ label: 'History and motivation', slug: 'about' },
						{ label: 'Specification', link: 'https://github.com/duckflux/spec/blob/main/SPEC.md' },
						{ label: 'Roadmap', slug: 'about/roadmap' },
						{ label: 'Changelog', link: 'https://github.com/duckflux/spec/blob/main/CHANGELOG.md' },
					],
				},
			],
		}),
	],
});
