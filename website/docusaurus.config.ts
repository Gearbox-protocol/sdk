import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "Gearbox SDK",
  tagline: "Core types and utilities for Gearbox Protocol",
  favicon: "img/favicon.ico",

  url: "https://gearbox-protocol.github.io",
  baseUrl: "/sdk/",

  organizationName: "gearbox-protocol",
  projectName: "sdk",

  onBrokenLinks: "warn",
  onBrokenAnchors: "warn",

  markdown: {
    format: "detect",
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  future: {
    v4: true,
    experimental_faster: true,
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        entryPoints: [
          "../src/sdk/index.ts",
          "../src/dev/index.ts",
          // "../src/history/index.ts",
          "../src/permissionless/index.ts",
          "../src/common-utils/index.ts",
          "../src/rewards/index.ts",
          // "../src/plugins/accounts/index.ts",
          // "../src/plugins/accounts-counter/index.ts",
          // "../src/plugins/adapters/index.ts",
          // "../src/plugins/bots/index.ts",
          // "../src/plugins/degen-distributors/index.ts",
          // "../src/plugins/delayed-withdrawal/index.ts",
          // "../src/plugins/pools-history/index.ts",
          // "../src/plugins/zappers/index.ts",
        ],
        entryPointStrategy: "resolve",
        tsconfig: "../tsconfig.build.json",
        out: "docs/api",
        readme: "none",
        excludePrivate: true,
        excludeProtected: true,
        excludeInternal: true,
        excludeReferences: true,
        excludeExternals: true,
        // maxTypeConversionDepth: 3,
        exclude: ["**/*.test.ts", "**/*.mock.ts"],
        excludeNotDocumented: true,
        excludeNotDocumentedKinds: [
          // "Module",
          "Namespace",
          // "Enum",
          // "EnumMember", // Not enabled by default
          "Variable",
          // "Function",
          // "Class",
          // "Interface",
          // "Constructor",
          // "Property",
          // "Method",
          // "CallSignature",
          "IndexSignature",
          // "ConstructorSignature",
          // "Accessor",
          // "GetSignature",
          // "SetSignature",
          "TypeAlias",
          "Reference",
        ],
        sort: ["source-order"],
        skipErrorChecking: true,
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Gearbox SDK",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/gearbox-protocol/sdk",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/gearbox",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/GearboxProtocol",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/gearbox-protocol/sdk",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Gearbox Foundation.`,
    },
    prism: {
      theme: {
        plain: { color: "#393A34", backgroundColor: "#f6f8fa" },
        styles: [],
      },
      darkTheme: {
        plain: { color: "#F8F8F2", backgroundColor: "#282A36" },
        styles: [],
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
