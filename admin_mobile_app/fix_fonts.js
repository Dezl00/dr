const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.dart')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            if (content.includes("import 'package:google_fonts/google_fonts.dart';")) {
                content = content.replace(/import\s+'package:google_fonts\/google_fonts\.dart';\s*\n?/, '');
                modified = true;
            }

            if (content.includes('GoogleFonts.ibmPlexSansArabic')) {
                // Handle nested parens by a simpler approach or since it's just dart properties it usually doesn't have deep parens 
                // A better approach for nested parens is difficult with regex, but we only have simple properties like color, fontSize, fontWeight
                content = content.replace(/GoogleFonts\.ibmPlexSansArabic\(([^)]*)\)/g, (match, p1) => {
                    let args = p1.trim();
                    if (args.length > 0) {
                        // If args already starts with fontStyle, fontSize etc
                        return `TextStyle(fontFamily: 'IBMPlexSansArabic', ${args})`;
                    } else {
                        return `TextStyle(fontFamily: 'IBMPlexSansArabic')`;
                    }
                });
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir('c:/xampp/htdocs/drs/admin_mobile_app/lib');
