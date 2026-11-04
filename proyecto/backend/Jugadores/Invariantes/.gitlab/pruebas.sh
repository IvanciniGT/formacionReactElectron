#!/bin/sh
# Ejecuta un tipo de pruebas del componente:
#   unitarias     tests/*.Pruebas              en cada push, y en el hook pre-push
#   integracion   tests/*.Pruebas.Integracion  en dev y en main
#   sistema       tests/*.Pruebas.Sistema      en main
# Deja los resultados JUnit en artifacts/informes/junit/ para que GitLab los muestre.
set -eu

tipo="${1:-}"
case "$tipo" in
    unitarias)   sufijo=".Pruebas" ;;
    integracion) sufijo=".Pruebas.Integracion" ;;
    sistema)     sufijo=".Pruebas.Sistema" ;;
    *)           echo "uso: pruebas.sh unitarias|integracion|sistema" >&2; exit 1 ;;
esac
shift

proyectos="$(find tests -mindepth 2 -maxdepth 2 -name "*$sufijo.csproj" 2>/dev/null | sort)"

if [ -z "$proyectos" ]; then
    # Código sin ninguna prueba unitaria no pasa. Integración y sistema solo existen cuando
    # hay algo que integrar (persistencia, HTTP…), así que su ausencia no es un fallo.
    if [ "$sufijo" = ".Pruebas" ] && find src -name '*.cs' 2>/dev/null | grep -q .; then
        echo "Hay código en src/ y ninguna prueba unitaria (tests/*.Pruebas)." >&2
        exit 1
    fi
    echo "No hay pruebas de $tipo: nada que ejecutar."
    exit 0
fi

for proyecto in $proyectos; do
    dotnet test "$proyecto" --logger "junit;LogFilePath=$PWD/artifacts/informes/junit/{assembly}.xml" "$@"
done
