#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

yarn build:cjs
mkdir -p ${HOME}/.node/bin
cd ${HOME}/.node/bin
ln -s ${DIR}/../build.cjs/index.js ./gbelt

printf "\nexport PATH=${HOME}/.node/bin:\$PATH\n" >> ${HOME}/.bash_profile

source ${HOME}/.bash_profile
