#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$SCRIPT_DIR"

HANDLED_FAILURE=0
LOCAL_COMMIT_CREATED=0

pause_before_close() {
  printf "\nPress Return to close..."
  read -r
}

fail() {
  HANDLED_FAILURE=1
  printf "%s\n" "$1"
  exit 1
}

TRAPEXIT() {
  local exit_code=$?

  if [[ ${ZSH_SUBSHELL:-0} -gt 0 ]]; then
    return $exit_code
  fi

  if [[ $exit_code -ne 0 && $HANDLED_FAILURE -eq 0 ]]; then
    if [[ $LOCAL_COMMIT_CREATED -eq 1 ]]; then
      printf "The project changes were committed locally, but the push did not succeed.\n"
    else
      printf "Something went wrong. No updates were sent.\n"
    fi
  fi

  pause_before_close
  return $exit_code
}

require_clean_git_operation_state() {
  local git_dir
  git_dir="$(git rev-parse --git-dir)"

  if [[ -e "$git_dir/MERGE_HEAD" ]]; then
    fail "Git is in the middle of a merge. Please ask for help before sending updates."
  fi

  if [[ -e "$git_dir/CHERRY_PICK_HEAD" ]]; then
    fail "Git is in the middle of a cherry-pick. Please ask for help before sending updates."
  fi

  if [[ -e "$git_dir/REVERT_HEAD" ]]; then
    fail "Git is in the middle of a revert. Please ask for help before sending updates."
  fi

  if [[ -d "$git_dir/rebase-merge" || -d "$git_dir/rebase-apply" ]]; then
    fail "Git is in the middle of a rebase. Please ask for help before sending updates."
  fi
}

derive_https_remote_url() {
  local remote_url="$1"

  if [[ "$remote_url" == https://* ]]; then
    printf "%s\n" "$remote_url"
    return 0
  fi

  if [[ "$remote_url" == git@github.com:* ]]; then
    printf "https://github.com/%s\n" "${remote_url#git@github.com:}"
    return 0
  fi

  if [[ "$remote_url" == ssh://git@github.com/* ]]; then
    printf "https://github.com/%s\n" "${remote_url#ssh://git@github.com/}"
    return 0
  fi

  return 1
}

if ! command -v git >/dev/null 2>&1; then
  fail "Git is not installed on this Mac yet."
fi

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  fail "This script must be run from inside the portfolio repository."
fi

require_clean_git_operation_state

current_branch="$(git branch --show-current)"

if [[ "$current_branch" != "main" ]]; then
  fail "This script can only be run while the repository is on the main branch."
fi

origin_url="$(git remote get-url origin 2>/dev/null || true)"

if [[ -z "$origin_url" ]]; then
  fail 'The "origin" remote is missing from this repository.'
fi

if ! https_remote_url="$(derive_https_remote_url "$origin_url")"; then
  fail 'The "origin" remote is not an HTTPS or GitHub SSH URL that this script can use.'
fi

if ! git fetch --quiet "$https_remote_url" main:refs/remotes/origin/main; then
  fail "Could not reach the HTTPS remote. Please check internet access and GitHub sign-in, then try again."
fi

if ! git rev-parse --verify refs/remotes/origin/main >/dev/null 2>&1; then
  fail "The remote main branch could not be found."
fi

read -r ahead_count behind_count <<< "$(git rev-list --left-right --count HEAD...refs/remotes/origin/main)"

if [[ "$ahead_count" != "0" && "$behind_count" != "0" ]]; then
  fail "This repository has local and remote commits that do not match. Please ask for help before sending updates."
fi

if [[ "$ahead_count" != "0" ]]; then
  fail "This repository has local commits that have not been sent yet. Please ask for help before sending updates."
fi

if [[ "$behind_count" != "0" ]]; then
  fail "This repository is behind the remote main branch. Please ask for help before sending updates."
fi

if [[ -z "$(git status --short --untracked-files=all -- projects)" ]]; then
  fail "No project updates were found under ./projects."
fi

git add --all -- projects
git commit -m "project updates" -- projects
LOCAL_COMMIT_CREATED=1

if ! git push "$https_remote_url" HEAD:main; then
  fail "The project changes were committed locally, but the push did not succeed."
fi

printf "Updates sent.\n"
printf "It may take some time to see these live.\n"
