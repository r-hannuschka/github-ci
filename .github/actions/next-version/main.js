"use strict";
/**
 * github action which parses the gitlog for convential commit messages
 * and returns a new version since last tag.
 *
 * if no tag exists it starts with 0.0.0
 *
 * @see https://www.conventionalcommits.org/en/v1.0.0-beta.2/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const os_1 = require("os");
const core_1 = require("@actions/core");
// next version
function createTag(tag, version) {
    switch (version) {
        case 2 /* MAJOR */:
            return tag.replace(/^(\d).*/, () => `${parseInt(RegExp.$1, 10) + 1}.0.0`);
        case 1 /* MINOR */:
            return tag.replace(/^(\d.)(\d).*/, () => `\\1${parseInt(RegExp.$2, 10) + 1}.0`);
        default:
            return tag.replace(/.*(\d)$/, () => `\\1${parseInt(RegExp.$2, 10) + 1}`);
    }
}
let lastTag = "0.0.0";
let gitLog = null;
/** get git log since last tag */
try {
    lastTag = child_process_1.execSync(`git describe --tags --abbrev=0`).toString();
    gitLog = child_process_1.execSync(`git log ${lastTag}..HEAD --pretty=oneline`).toString();
}
catch (error) {
    gitLog = child_process_1.execSync(`git log --pretty=oneline`).toString();
}
/**
 * make use of conventional commits for versioning
 */
const nextVersion = gitLog.split((os_1.EOL))
    .filter((message) => message.length !== 0)
    .reduce((version, commitMessage) => {
    const conventialCommitPattern = /(fix|feat|break)(?=(?:\(.*?\))?:).*$/;
    const commitedVersion = commitMessage.match(conventialCommitPattern);
    // no convential commit message found
    if (!commitedVersion) {
        return version;
    }
    let newVersion;
    switch (commitedVersion[1]) {
        case "break":
            newVersion = 2 /* MAJOR */;
            break;
        case "feat":
            newVersion = 1 /* MINOR */;
            break;
        default: newVersion = 0 /* PATCH */;
    }
    return Math.max(version, newVersion);
}, 0 /* PATCH */);
// out new version
core_1.setOutput("nextVersion", createTag(lastTag, nextVersion));
