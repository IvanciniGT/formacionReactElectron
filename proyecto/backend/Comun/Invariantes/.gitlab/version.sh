#!/bin/sh
# La versión de un componente sale de CHANGELOG.md y de los tags de git: nadie la escribe
# a mano. La usa sobre todo el pipeline; en local sirve para ver qué versión va a salir.
#
#   version.sh comprobar            que CHANGELOG.md tiene el formato que este script entiende
#   version.sh calcular             la versión que toca ahora
#   version.sh nivel                major, minor, patch o nada, según Unreleased
#   version.sh ultima-final         la última versión aprobada (tag vX.Y.Z), o nada
#   version.sh siguiente-rc X.Y.Z   el número de la siguiente candidata de esa versión
#   version.sh comprobar-main       que lo que llega a main es publicable como candidata
#   version.sh notas SECCION        las entradas de una sección (X.Y.Z o Unreleased)
#   version.sh formalizar X.Y.Z REF las entradas de Unreleased que había en REF (la rc
#                                   aprobada) pasan a [X.Y.Z] - fecha; las demás se quedan
#
# Qué sube cada cambio (Keep a Changelog + SemVer):
#   Removed, o una entrada con **BREAKING**   MAJOR   (en 0.x, MINOR)
#   Added, Changed, Deprecated                MINOR   (en 0.x, PATCH)
#   Fixed, Security                           PATCH
#
# Cada entrada del CHANGELOG ocupa UNA línea que empieza por "- ", bajo uno de los
# epígrafes de Keep a Changelog: así se pueden separar las que entraron en una candidata
# de las que se añadieron después. Las secciones se escriben siempre en el orden
# Added, Changed, Deprecated, Removed, Fixed, Security.
#
# Sin ninguna versión aprobada todavía, la primera es el VersionPrefix del proyecto: esa
# la decide una persona. A partir de ahí, solo el CHANGELOG.
#
# Solo sh, awk y git: corre igual en local, en el hook y en la imagen del SDK.
set -eu

CHANGELOG=CHANGELOG.md
CATEGORIAS="Added Changed Deprecated Removed Fixed Security"
PROYECTO="${PROYECTO_PAQUETE:-$(sed -n 's/^  PROYECTO_PAQUETE: //p' .gitlab-ci.yml)}"

fallo() {
    echo "version.sh: $1" >&2
    exit 1
}

inicial() {
    sed -n 's:.*<VersionPrefix>\(.*\)</VersionPrefix>.*:\1:p' "$PROYECTO"
}

ultima_final() {
    git tag --list 'v*' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sed 's/^v//' \
        | sort -t. -k1,1n -k2,2n -k3,3n | tail -1
}

# Las líneas de una sección, sin su título. Lee de la entrada estándar.
seccion() {
    awk -v titulo="## [$1]" '
        index($0, titulo) == 1 { dentro = 1; next }
        dentro && /^## \[/      { exit }
        dentro                  { print }
    '
}

# Un epígrafe mal escrito o una entrada en dos líneas no se puede clasificar: se contaría
# mal sin avisar. Mejor pararse.
comprobar() {
    [ -f "$CHANGELOG" ] || fallo "falta $CHANGELOG."
    grep -qx '## \[Unreleased\]' "$CHANGELOG" || fallo "$CHANGELOG no tiene la sección ## [Unreleased]."
    seccion Unreleased < "$CHANGELOG" | awk -v validas="$CATEGORIAS" '
        BEGIN { n = split(validas, v, " "); for (i = 1; i <= n; i++) ok[v[i]] = 1 }
        /^### / {
            categoria = substr($0, 5)
            if (!(categoria in ok)) { print "epígrafe desconocido: " $0 " (valen: " validas ")"; mal = 1 }
            next
        }
        /^- / { if (categoria == "") { print "entrada fuera de epígrafe: " $0; mal = 1 }; next }
        /^[[:space:]]*$/ { next }
        { print "cada entrada es una línea que empieza por \"- \": " $0; mal = 1 }
        END { exit mal }
    ' >&2 || fallo "$CHANGELOG no tiene el formato esperado (ver arriba)."
    echo "$CHANGELOG correcto."
}

nivel() {
    seccion Unreleased < "$CHANGELOG" | awk '
        /^### / { categoria = $2; next }
        /^- /   {
            if (categoria == "Removed" || index($0, "**BREAKING**")) n = 3
            else if (categoria == "Added" || categoria == "Changed" || categoria == "Deprecated") { if (n < 2) n = 2 }
            else if (categoria == "Fixed" || categoria == "Security") { if (n < 1) n = 1 }
        }
        END { print (n == 3 ? "major" : n == 2 ? "minor" : n == 1 ? "patch" : "nada") }
    '
}

calcular() {
    base="$(ultima_final)"
    [ -n "$base" ] || { inicial; return; }
    echo "$base" | awk -F. -v nv="$(nivel)" '{
        ma = $1; mi = $2; pa = $3
        if (ma == 0) { if (nv == "major") nv = "minor"; else if (nv == "minor") nv = "patch" }
        if (nv == "major")      { ma++; mi = 0; pa = 0 }
        else if (nv == "minor") { mi++; pa = 0 }
        else if (nv == "patch") { pa++ }
        print ma "." mi "." pa
    }'
}

siguiente_rc() {
    git tag --list "v$1-rc.*" | sed "s/^v$1-rc\.//" | sort -n | tail -1 \
        | awk '{ n = $1 } END { print n + 1 }'
}

comprobar_main() {
    comprobar > /dev/null
    if [ -n "$(ultima_final)" ] && [ "$(nivel)" = nada ]; then
        fallo "Unreleased está vacío en CHANGELOG.md: no hay nada que publicar como candidata."
    fi
    # Una candidata con una dependencia en desarrollo no es publicable.
    if grep -rqE --include='*.csproj' --include='*.props' 'Version="[^"]*-desa' .; then
        fallo "depende de una versión -desa. Sube antes esas dependencias a una rc o a una final."
    fi
    echo "Candidata publicable: $(calcular)"
}

notas() {
    seccion "$1" < "$CHANGELOG" | sed '/./,$!d'
}

formalizar() {
    version="$1"
    ref="$2"
    comprobar > /dev/null
    fecha="$(date +%Y-%m-%d)"
    entradas="$(mktemp)"
    git show "$ref:$CHANGELOG" | seccion Unreleased | grep '^- ' > "$entradas" || true
    [ -s "$entradas" ] || fallo "$ref no tiene ninguna entrada en Unreleased."
    tmp="$(mktemp)"
    # Primera pasada: las entradas de la rc, por categoría, para la sección nueva.
    # Segunda: el fichero, quitando esas entradas de Unreleased e insertando la sección.
    awk -v version="$version" -v fecha="$fecha" -v fichero_entradas="$entradas" -v orden="$CATEGORIAS" '
        BEGIN {
            while ((getline linea < fichero_entradas) > 0) de_la_rc[linea] = 1
            ncat = split(orden, categorias, " ")
        }
        function volcar(titulo, entradas,   i, c) {
            print titulo
            for (i = 1; i <= ncat; i++) {
                c = categorias[i]
                if (entradas[c] != "") { print ""; print "### " c; printf "%s", entradas[c] }
            }
            print ""
        }
        function volcar_unreleased() {
            volcar("## [Unreleased]", quedan)
            volcar("## [" version "] - " fecha, salen)
        }
        $0 == "## [Unreleased]" { en_unreleased = 1; next }
        en_unreleased && /^## \[/ { volcar_unreleased(); en_unreleased = 0; hecho = 1 }
        en_unreleased {
            if ($0 ~ /^### /) cat = substr($0, 5)
            else if ($0 ~ /^- /) { if ($0 in de_la_rc) salen[cat] = salen[cat] $0 "\n"; else quedan[cat] = quedan[cat] $0 "\n" }
            next
        }
        { print }
        END { if (en_unreleased && !hecho) volcar_unreleased() }
    ' "$CHANGELOG" > "$tmp"
    mv "$tmp" "$CHANGELOG"
    rm -f "$entradas"
    echo "CHANGELOG.md: las entradas de $ref pasan a [$version] - $fecha."
}

orden="${1:-}"
[ $# -gt 0 ] && shift
case "$orden" in
    comprobar)      comprobar ;;
    calcular)       calcular ;;
    nivel)          nivel ;;
    ultima-final)   ultima_final ;;
    siguiente-rc)   siguiente_rc "${1:?uso: version.sh siguiente-rc X.Y.Z}" ;;
    comprobar-main) comprobar_main ;;
    notas)          notas "${1:?uso: version.sh notas X.Y.Z|Unreleased}" ;;
    formalizar)     formalizar "${1:?uso: version.sh formalizar X.Y.Z REF}" "${2:?uso: version.sh formalizar X.Y.Z REF}" ;;
    *)              sed -n '2,30s/^# \{0,1\}//p' "$0"; exit 1 ;;
esac
