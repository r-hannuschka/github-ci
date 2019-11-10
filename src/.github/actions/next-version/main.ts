/**
 * github action which parses the gitlog for convential commit messages
 * and returns a new version since last tag.
 *
 * if no tag exists it starts with 0.0.0
 *
 * @see https://www.conventionalcommits.org/en/v1.0.0-beta.2/
 */

import { execSync } from "child_process";
import { EOL } from "os";
import { setOutput } from "@actions/core";

const enum VERSION {
    PATCH = 0,
    MINOR = 1,
    MAJOR = 2
}

// next version
function createTag(tag: string, version: VERSION) {
    switch (version) {
        case VERSION.MAJOR:
            return tag.replace(/^(\d+).*/, () => `${parseInt(RegExp.$1, 10) + 1}.0.0`);
        case VERSION.MINOR:
            return tag.replace(/^(\d+\.)(\d+).*/, () => `${RegExp.$1}${parseInt(RegExp.$2, 10) + 1}.0`);
        default:
            return tag.replace(/(.*)(\d+)$/, () => `${RegExp.$1}${parseInt(RegExp.$2, 10) + 1}`);
    }
}

let lastTag = "0.0.0";
let gitLog: string = null;

/** get git log since last tag */
try {
    lastTag = execSync(`git describe --tags --abbrev=0`).toString();
    gitLog  = execSync(`git log ${lastTag}..HEAD --pretty=oneline`).toString();
} catch (error) {
    gitLog = execSync(`git log --pretty=oneline`).toString();
}

/**
 * make use of conventional commits for versioning
 */
const nextVersion = gitLog.split((EOL))
    .filter((message) => message.length !== 0)
    .reduce<VERSION>( (version, commitMessage) => {

        const conventialCommitPattern = /(fix|feat|break)(?=(?:\(.*?\))?:).*$/;
        const commitedVersion = commitMessage.match(conventialCommitPattern);

        // no convential commit message found
        if (!commitedVersion) {
            return version;
        }

        let newVersion: VERSION;

        switch (commitedVersion[1]) {
            case "break": newVersion = VERSION.MAJOR; break;
            case "feat":  newVersion = VERSION.MINOR; break;
            default:      newVersion = VERSION.PATCH;
        }

        return Math.max(version, newVersion);
    }, VERSION.PATCH);

// out new version
setOutput("nextVersion", createTag(lastTag, nextVersion));
