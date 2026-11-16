#!/usr/bin/env bash
# FHK self-hosted runner setup for a Linux server (Ubuntu/Oracle Linux, x64 or ARM).
# Usage (as a normal user with sudo):  bash setup-linux.sh <RUNNER_TOKEN> <NAME>
# RUNNER_TOKEN: from GitHub > khanfarazhusain/minds-eye-chess > Settings > Actions > Runners > New self-hosted runner (valid 1 hour). Never share it in chat.
set -euo pipefail
TOKEN="${1:?token missing}"; NAME="${2:?name missing (e.g. oracle-1)}"
if command -v apt-get >/dev/null; then sudo apt-get update -y && sudo apt-get install -y build-essential git curl jq tar gzip
else sudo dnf install -y gcc make git curl jq tar gzip; fi
case "$(uname -m)" in x86_64) ARCH=x64;; aarch64|arm64) ARCH=arm64;; *) echo "unknown arch $(uname -m)"; exit 1;; esac
VER=$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest | jq -r .tag_name | sed 's/^v//')
mkdir -p ~/fhk-runner && cd ~/fhk-runner
curl -fsSL -o runner.tgz "https://github.com/actions/runner/releases/download/v${VER}/actions-runner-linux-${ARCH}-${VER}.tar.gz"
tar xzf runner.tgz && rm runner.tgz
sudo ./bin/installdependencies.sh || true
./config.sh --unattended --url https://github.com/khanfarazhusain/minds-eye-chess --token "$TOKEN" --name "$NAME" --labels fhk --work _work --replace
sudo ./svc.sh install && sudo ./svc.sh start
echo "OK: runner $NAME ($ARCH, $(nproc) cores) installed as a service. It should show as Idle in GitHub > Settings > Actions > Runners."
