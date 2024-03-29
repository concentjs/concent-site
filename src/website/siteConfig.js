/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: "User1",
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: "/img/undraw_open_source.svg",
    infoLink: "https://www.facebook.com",
    pinned: true
  }
];

const siteConfig = {
  title: "concent", // Title for your website.
  tagline: 'power your react',//用于显示document.title
  tagline1: `一个可靠且简单的react状态管理框架`,
  tagline2: `让ui与业务逻辑分离得更优雅、更容易维护与扩展`,
  // url: 'https://github.com/concentjs/concent', // Your website URL
  // baseUrl: 'https://concentjs.github.io/concent-site', // Base URL for your project */
  url: "https://concentjs.github.io/concent-site", // Your website URL
  baseUrl: "/concent-site/", // Base URL for your project */
  // baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: "concent",
  organizationName: "concentjs",
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: "doc-intro-what-is-concent", label: "Docs" },
    { doc: "api-top-run", label: "API" },
    { doc: "release-v1-1-26", label: "ChangeLog" },
    { href: "https://github.com/concentjs/concent", label: "GitHub" }
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: "img/logo.png",
  footerIcon: "img/logo2.png",
  favicon: "img/favicon.ico",

  /* Colors for website */
  colors: {
    primaryColor: "#0094bd",
    secondaryColor: "#603378"
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} concentjs.org`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: "default"
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ["https://buttons.github.io/buttons.js"],

  // On page navigation for the current documentation page.
  onPageNav: "separate",
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: "img/undraw_online.svg",
  twitterImage: "img/undraw_tweetstorm.svg",

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  editUserUrl: 'https://github.com/concentjs/concent-site/edit/master/src/website/siteConfig.js',
};

module.exports = siteConfig;
