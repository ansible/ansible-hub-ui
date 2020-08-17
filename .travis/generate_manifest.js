#!/usr/bin/env node

// Usage: node .travis/generate_manifest.js OUTPUT [LOCKFILE]

const fs = require('fs');

const PREFIX = 'services-ansible-automation-hub:ui/'


function processPackage(name, pkg, result) {
    if (pkg.bundled || pkg.dev) {
        return;
    }

    if (pkg.resolved) {
        const name = pkg.resolved.replace(/.*\/-\//, '');
        const entry = `${PREFIX}npmjs-${name}`;
        result[entry] = entry
    }

    if (pkg.dependencies) {
        processDependencies(pkg, result);
    }
}

function processDependencies(pkg, result) {
    Object.entries(pkg.dependencies).forEach(([name, entry]) => {
        if (entry.dev === true) {
            return;
        }

        processPackage(name, entry, result);
    });
}


function main() {
    try {
        const [outputFile=null, lockFile='package-lock.json'] = process.argv.slice(2);

        const lockFileContent = fs.readFileSync(lockFile);
        const content = JSON.parse(lockFileContent);

        let deps = {};
        processDependencies(content, deps);
        let sortedDeps = Object.values(deps).sort();

        let output = null;
        if (outputFile && outputFile !== '-') {
            output = fs.createWriteStream(outputFile);
        } else {
            output = process.stdout;
        }

        sortedDeps.forEach(item => {
            output.write(`${item}\n`);
        });
        output.end();

    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}


main()
