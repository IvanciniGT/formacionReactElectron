#!/bin/sh
# Empaqueta y sube el paquete con la versión que se le pasa (X.Y.Z, X.Y.Z-desa.N o
# X.Y.Z-rc.N). Las notas del paquete son lo que hay en Unreleased en este commit: lo que
# trae esta publicación. El registro no admite duplicados, así que una versión ya
# publicada no se puede volver a subir.
set -eu

version="${1:?uso: publicar.sh VERSION}"

mkdir -p artifacts
sh .gitlab/version.sh notas Unreleased > artifacts/notas-version.md

dotnet pack "$PROYECTO_PAQUETE" -c Release -o artifacts/paquetes -p:Version="$version"
dotnet nuget add source "${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/nuget/index.json" \
    --name publicacion --username gitlab-ci-token --password "$CI_JOB_TOKEN" \
    --store-password-in-clear-text --configfile nuget.config
dotnet nuget push "artifacts/paquetes/*.$version.nupkg" --source publicacion
echo "Publicado $version."
