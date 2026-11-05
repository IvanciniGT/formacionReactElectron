
node:internal/modules/run_main:123
    triggerUncaughtException(
    ^
[Error: ENOENT: no such file or directory, open 'C:\C:\repositorio\formacionReactElectron\proyecto\contratos\Apuestas\Catalogo\asyncapi.yaml'] {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\C:\\repositorio\\formacionReactElectron\\proyecto\\contratos\\Apuestas\\Catalogo\\asyncapi.yaml'
}
Node.js v22.22.3



---

Revisar saltos de linea Windows

---


FuncionA
  1 linea  // CAMINO 1

FuncionB
  IF
    48 lineas     << Cobertura de lineas me daría 96% // CAMINO 2
  ELSE
   1 lineas  // CAMINO 3

La cobertura de ramas: 33% El código puede tomar 3 caminos: Y solo has probado 1
La cobertura de funciones sería 50% // Solo se ha probado FuncionA

