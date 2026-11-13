// Loading order of the icon font (Material Symbols Rounded, ~100 KB: 117 icons × 3 variable
// axes). Icons are never the page's main content, so the font waits until the page has painted
// once after `load`, and the LCP text or image doesn't share the connection with it. Until then
// `<html data-icons="deferred">` keeps every .icon an empty 1em box (globals.css): no ligature
// names, no layout shift; the browser only requests a font when text uses it. `ready` draws the
// glyphs (font-display: block hides them for the few ms the font takes from there).
//
// The script sets `deferred` itself, so without JavaScript icons load the usual way, and
// Storybook and unit tests (no script) draw them at once.

export const ICONS_ATTRIBUTE = "data-icons";

/** Runs inline in <head> before first paint (root layout). */
export const iconFontScript = `(function(){var d=document.documentElement;d.setAttribute("${ICONS_ATTRIBUTE}","deferred");function r(){requestAnimationFrame(function(){setTimeout(function(){d.setAttribute("${ICONS_ATTRIBUTE}","ready")},0)})}if(document.readyState==="complete")r();else addEventListener("load",r,{once:true})})()`;
