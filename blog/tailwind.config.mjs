/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': '#000000',
            '--tw-prose-headings': '#000000',
            '--tw-prose-lead': '#000000',
            '--tw-prose-links': '#000000',
            '--tw-prose-bold': '#000000',
            '--tw-prose-counters': '#000000',
            '--tw-prose-bullets': '#000000',
            '--tw-prose-hr': '#e5e7eb',
            '--tw-prose-quotes': '#000000',
            '--tw-prose-quote-borders': '#000000',
            '--tw-prose-captions': '#000000',
            '--tw-prose-code': '#000000',
            '--tw-prose-pre-code': '#ffffff',
            '--tw-prose-pre-bg': '#000000',
            '--tw-prose-th-borders': '#000000',
            '--tw-prose-td-borders': '#e5e7eb',
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
