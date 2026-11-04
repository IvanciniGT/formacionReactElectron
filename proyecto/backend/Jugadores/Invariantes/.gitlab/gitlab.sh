#!/bin/sh
# Lo que el pipeline escribe en el propio repo: tags, Releases y la formalización del
# CHANGELOG en dev. El CI_JOB_TOKEN no puede escribir, así que necesita la variable
# TOKEN_ESCRITURA: un token de acceso del proyecto (o del grupo) con permisos api y
# write_repository.
#
#   gitlab.sh tag VERSION                 tag vVERSION sobre este commit
#   gitlab.sh release VERSION             Release de GitLab con las notas de Unreleased
#   gitlab.sh formalizar VERSION          en dev: lo que entró en esta versión pasa a su sección
set -eu

: "${TOKEN_ESCRITURA:?Falta la variable TOKEN_ESCRITURA: un token del proyecto con api y write_repository.}"

api() {
    curl --fail-with-body -sS -H "PRIVATE-TOKEN: $TOKEN_ESCRITURA" "$@"
}

orden="${1:-}"
version="${2:?uso: gitlab.sh tag|release|formalizar VERSION}"

case "$orden" in
    tag)
        api -X POST "$CI_API_V4_URL/projects/$CI_PROJECT_ID/repository/tags" \
            --data-urlencode "tag_name=v$version" --data-urlencode "ref=$CI_COMMIT_SHA" \
            --data-urlencode "message=$CI_PROJECT_NAME v$version" > /dev/null
        echo "Tag v$version sobre $CI_COMMIT_SHORT_SHA."
        ;;
    release)
        sh .gitlab/version.sh notas Unreleased > artifacts/notas-release.md
        api -X POST "$CI_API_V4_URL/projects/$CI_PROJECT_ID/releases" \
            --data-urlencode "tag_name=v$version" --data-urlencode "name=v$version" \
            --data-urlencode "description@artifacts/notas-release.md" > /dev/null
        echo "Release v$version creada."
        ;;
    formalizar)
        # El commit de la final es el de la rc aceptada: sus entradas de Unreleased son
        # exactamente las de esta versión. Las que llegaron a dev después se quedan.
        aceptado="$CI_COMMIT_SHA"
        remoto="https://gitlab-ci-token:${TOKEN_ESCRITURA}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git"
        git fetch --quiet "$remoto" dev
        git checkout --quiet -B dev FETCH_HEAD
        sh .gitlab/version.sh formalizar "$version" "$aceptado"
        git -c user.name="Pipeline de $CI_PROJECT_NAME" -c user.email="ci@$CI_SERVER_HOST" \
            commit --quiet -am "CHANGELOG: versión $version"
        # ci.skip: este commit solo ordena el CHANGELOG, no hay nada que probar ni publicar.
        git push --quiet -o ci.skip "$remoto" dev
        echo "CHANGELOG de dev formalizado para $version."
        ;;
    *)
        echo "uso: gitlab.sh tag|release|formalizar VERSION" >&2
        exit 1
        ;;
esac
