/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#11213A',
    tint: '#1456D9',

    // Core surfaces
    background: '#F7F9FC',
    foreground: '#11213A',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#11213A',

    // Primary action color (buttons, links, active states)
    primary: '#1456D9',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E8F0FF',
    secondaryForeground: '#1456D9',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEF2F7',
    mutedForeground: '#6D7B91',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#DCE8FF',
    accentForeground: '#1456D9',

    // Destructive actions (delete, error states)
    destructive: '#D94C5C',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#E2E8F0',
    input: '#D9E1EC',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
