import { request } from "https";
import { getInput, setOutput, debug} from "@actions/core";
import { execSync } from "child_process";

const commitHash = execSync("git rev-parse HEAD");

const data = JSON.stringify({
    ref: `refs/tags/${getInput("tag")}`,
    sha: commitHash.toString().trim()
});

const options = {
    hostname: "api.github.com",
    port: 443,
    path: "/repos/r-hannuschka/github-ci/git/refs",
    method: "POST",
    headers: {
        Authorization: `token ${getInput("github_token")}`,
        "user-agent": "node.js",
        "Content-Type": "application/json",
        "Content-Length": data.length
    }
};

const req = request(options, (res) => {
    res.on("data", (message) => {
        setOutput("response", message.toString());
    });
});

req.write(data);
req.end();
