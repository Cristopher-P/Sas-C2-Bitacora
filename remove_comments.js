const fs = require('fs');
const path = require('path');

const excludeDirs = ['node_modules', '.git', '.gemini', 'tmp'];

function removeCommentsFromJS(code) {
    let out = '';
    let i = 0;
    while (i < code.length) {
        if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
            let quote = code[i];
            out += code[i++];
            while (i < code.length) {
                if (code[i] === '\\') { // skip escaped chars
                    out += code[i++];
                    out += code[i++];
                } else if (code[i] === '$' && quote === "`" && code[i + 1] === '{') {
                    // Start of template literal expression
                    out += code[i++];
                } else if (code[i] === quote) {
                    out += code[i++];
                    break;
                } else {
                    out += code[i++];
                }
            }
        } else if (code[i] === '/' && code[i + 1] === '/') {
            // single line comment
            i += 2;
            while (i < code.length && code[i] !== '\n' && code[i] !== '\r') i++;
            // We do NOT add the newline yet, let the loop grab it so it remains
        } else if (code[i] === '/' && code[i + 1] === '*') {
            // multi line comment
            i += 2;
            while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
                // If we want to preserve newlines so line numbers don't change
                if (code[i] === '\n' || code[i] === '\r') {
                    out += code[i];
                }
                i++;
            }
            i += 2; // skip */
        } else {
            out += code[i++];
        }
    }
    return out;
}

function removeCommentsFromCSS(code) {
    let out = '';
    let i = 0;
    while (i < code.length) {
        if (code[i] === '"' || code[i] === "'") {
            let quote = code[i];
            out += code[i++];
            while (i < code.length) {
                if (code[i] === '\\') {
                    out += code[i++];
                    out += code[i++];
                } else if (code[i] === quote) {
                    out += code[i++];
                    break;
                } else {
                    out += code[i++];
                }
            }
        } else if (code[i] === '/' && code[i + 1] === '*') {
            i += 2;
            while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
                if (code[i] === '\n' || code[i] === '\r') {
                    out += code[i];
                }
                i++;
            }
            i += 2;
        } else {
            out += code[i++];
        }
    }
    return out;
}

function removeCommentsFromHTML(code) {
    // We will just do a simple replacement for <!-- -->
    return code.replace(/<!--[\s\S]*?-->/g, '');
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (excludeDirs.includes(file)) continue;

        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile()) {
            const ext = path.extname(fullPath).toLowerCase();
            if (['.js', '.css', '.html'].includes(ext) && file !== 'remove_comments.js') {
                let content = fs.readFileSync(fullPath, 'utf8');
                let newContent = content;

                if (ext === '.js') {
                    newContent = removeCommentsFromJS(content);
                } else if (ext === '.css') {
                    newContent = removeCommentsFromCSS(content);
                } else if (ext === '.html') {
                    newContent = removeCommentsFromHTML(content);
                }

                // Clean up multiple empty lines that might have been left
                // Replace 3 or more empty lines with 1 empty line
                newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
                // Remove trailing whitespace from lines
                newContent = newContent.replace(/[ \t]+$/gm, '');

                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    console.log('Limpio:', fullPath);
                }
            }
        }
    }
}

console.log('Iniciando limpieza de comentarios...');
processDirectory(__dirname);
console.log('Limpieza completada.');
