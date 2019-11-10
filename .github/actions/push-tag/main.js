"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("https");
const core_1 = require("@actions/core");
const child_process_1 = require("child_process");
const commitHash = child_process_1.execSync("git rev-parse HEAD");
const data = JSON.stringify({
    ref: `refs/tags/${core_1.getInput("tag")}`,
    sha: commitHash.toString().replace(/(^\s*|\s*$)/, "")
});
const options = {
    hostname: "api.github.com",
    port: 443,
    path: "/repos/r-hannuschka/github-ci/git/refs",
    method: "POST",
    headers: {
        Authorization: `token ${core_1.getInput("github_token")}`,
        "user-agent": "node.js",
        "Content-Type": "application/json",
        "Content-Length": data.length
    }
};
const req = https_1.request(options, (res) => {
    // get status code 401 is forbidden wow
    // console.log(res.statusCode);
    res.on("data", (message) => {
        core_1.setOutput("response", message.toString());
    });
});
req.write(data);
req.end();
