const fs = require('fs');
const path = require('path');

const colourTokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'token-colour.json'), 'utf8'));
const typographyTokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'token-typography.json'), 'utf8'));

function resolveColor(ref, data) {
    if (!ref.startsWith('{') || !ref.endsWith('}')) return ref;
    
    const pathParts = ref.slice(1, -1).split('.');
    let current = data;
    
    for (const part of pathParts) {
        if (!current || current[part] === undefined) {
            return `/* MISSING: ${ref} */ unset`;
        }
        current = current[part];
    }
    
    if (typeof current === 'string' && current.startsWith('{')) {
        return resolveColor(current, data);
    }
    
    return current;
}

function camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

let cssContent = ':root {\n';

// --- Process Typography ---
const fontStyles = typographyTokens.font;
for (const [name, style] of Object.entries(fontStyles)) {
    const baseName = name.replace(/\s+/g, '-');
    const val = style.value;
    
    cssContent += `  /* Typography: ${name} */\n`;
    cssContent += `  --sys-typescale-${baseName}-font: "${val.fontFamily}";\n`;
    cssContent += `  --sys-typescale-${baseName}-size: ${val.fontSize}px;\n`;
    cssContent += `  --sys-typescale-${baseName}-weight: ${val.fontWeight};\n`;
    cssContent += `  --sys-typescale-${baseName}-line-height: ${val.lineHeight}px;\n`;
    cssContent += `  --sys-typescale-${baseName}-tracking: ${val.letterSpacing}px;\n\n`;
}

// --- Process Light Color Roles ---
cssContent += '  /* Color Roles: Light Mode */\n';
const lightRoles = colourTokens.color.role.light;
for (const [role, ref] of Object.entries(lightRoles)) {
    const value = resolveColor(ref, colourTokens);
    cssContent += `  --sys-color-${camelToKebab(role)}: ${value};\n`;
}
cssContent += '}\n\n';

// --- Process Dark Color Roles ---
cssContent += '[data-theme="dark"] {\n';
cssContent += '  /* Color Roles: Dark Mode */\n';
const darkRoles = colourTokens.color.role.dark;
for (const [role, ref] of Object.entries(darkRoles)) {
    const value = resolveColor(ref, colourTokens);
    cssContent += `  --sys-color-${camelToKebab(role)}: ${value};\n`;
}
cssContent += '}\n';

// Media query support for dark mode as well
cssContent += '\n@media (prefers-color-scheme: dark) {\n';
cssContent += '  :root:not([data-theme="light"]) {\n';
for (const [role, ref] of Object.entries(darkRoles)) {
    const value = resolveColor(ref, colourTokens);
    cssContent += `    --sys-color-${camelToKebab(role)}: ${value};\n`;
}
cssContent += '  }\n';
cssContent += '}\n';

fs.writeFileSync(path.join(__dirname, 'tokens.css'), cssContent);
console.log('Successfully generated tokens.css');
