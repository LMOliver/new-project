#!/bin/bash -ex
rm -rf deploy/public
npm run build
(cd deploy && vercel --prod)