#!/bin/bash

export NVM_DIR=$HOME/.nvm
source $NVM_DIR/nvm.sh

nvm use node

cd ./apps/backend/uploads
rm -ri *
cd ../../../

docker-compose down
docker volume rm hr_helper_postgres_data
docker-compose up -d

sleep 5

cd ./apps/backend
npx prisma migrate dev
npx prisma db seed

cd ../../


cd ./apps/web

pnpm run dev