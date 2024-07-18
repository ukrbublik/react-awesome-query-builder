#!/usr/bin/env bash

## Runs NVM or NVS depending on which is available
## Source this script or call it with arguments to execute a task with the correct nvm/nvs env

## usage:
##
## Source inside a script:
## $ dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
## $ source "$dir/path/to/nvms.sh"
##
## Run a command with nvm/nvs:
## path/to/nvms.sh command arg1 arg2 arg3

echo "(before) node: $(node -v)"
echo "(before) pnpm: $(pnpm -v)"

if [ -f ~/.nvm/nvm.sh ]; then
    . ~/.nvm/nvm.sh
    nvm use
else
    . ~/.nvs/nvs.sh
    nvs use
fi

echo "Now node: $(node -v)"
echo "Now pnpm: $(pnpm -v)"

if [[ "$(pnpm -v)" != "8."* ]]; then
    echo "Installing pnpm..."
    npm i -g pnpm@8
    echo "Now pnpm: $(pnpm -v)"
fi

if [ $# -gt 0 ]; then
    bin="$(which $1 | head -n 1)"
    cmd="$@"
    shift
    args="$(echo $cmd | cut -d' ' -f2-)" # strip "pnpm" from "pnpm X"
    if [[ "$cmd" == *"pnpm run "* ]]; then
        args="$(echo $cmd | cut -d' ' -f3-)" # strip "pnpm run" from "pnpm run X"
    fi
    echo "bin: $bin"
    echo "cmd: $cmd"
    echo "args: $args"
    echo "Running $bin $args"
    eval "$bin $args"
fi
